import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { HardDrive, Download, Upload, RefreshCw, Shield, Clock, Database, CheckCircle2, AlertTriangle, FileJson, Target, ListChecks, BarChart3, FileText, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import AccessDenied from "@/components/AccessDenied";

interface BackupMeta {
  version: string;
  created_at: string;
  created_by: string;
  metadata: {
    total_profiles: number;
    total_roles: number;
    total_users: number;
    total_metas: number;
    total_acoes: number;
    total_checkins: number;
    total_relatorios: number;
  };
}

export default function BackupRestore() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<BackupMeta | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [pendingFile, setPendingFile] = useState<any>(null);
  const [pendingMeta, setPendingMeta] = useState<BackupMeta | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("backup-system", {
        body: { action: "export" },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      if (res.data.error) throw new Error(res.data.error);

      const backup = res.data;
      setLastBackup({ version: backup.version, created_at: backup.created_at, created_by: backup.created_by, metadata: backup.metadata });

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_completo_sanremo_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      const total = (backup.metadata.total_profiles || 0) + (backup.metadata.total_metas || 0) + (backup.metadata.total_acoes || 0) + (backup.metadata.total_checkins || 0) + (backup.metadata.total_relatorios || 0) + (backup.metadata.total_roles || 0);
      toast({ title: "Backup completo exportado!", description: `${total} registros em 6 tabelas` });
    } catch (err: any) {
      toast({ title: "Erro ao exportar", description: err.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      if (!backup.data || !backup.version) throw new Error("Formato inválido");
      setPendingFile(backup);
      setPendingMeta({ version: backup.version, created_at: backup.created_at, created_by: backup.created_by, metadata: backup.metadata });
      setConfirmRestore(true);
    } catch (err: any) {
      toast({ title: "Arquivo inválido", description: err.message, variant: "destructive" });
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRestore = async () => {
    if (!pendingFile) return;
    setImporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("backup-system", {
        body: { action: "import", backup: pendingFile },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      if (res.data.error) throw new Error(res.data.error);

      const r = res.data.restored;
      const total = (r.profiles || 0) + (r.user_roles || 0) + (r.metas || 0) + (r.acoes_meta || 0) + (r.meta_checkins || 0) + (r.relatorios_gerados || 0);
      toast({ title: "Restauração concluída!", description: `${total} registros restaurados em 6 tabelas` });
      setConfirmRestore(false);
      setPendingFile(null);
      setPendingMeta(null);
    } catch (err: any) {
      toast({ title: "Erro ao restaurar", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  if (!isAdmin) return <AccessDenied requiredRole="Administrador" />;

  const metaStats = [
    { icon: Users, label: "Perfis", key: "total_profiles", color: "hsl(207, 89%, 48%)" },
    { icon: Shield, label: "Roles", key: "total_roles", color: "hsl(280, 60%, 50%)" },
    { icon: Target, label: "Metas", key: "total_metas", color: "hsl(152, 60%, 38%)" },
    { icon: ListChecks, label: "Ações", key: "total_acoes", color: "hsl(45, 100%, 51%)" },
    { icon: BarChart3, label: "Check-ins", key: "total_checkins", color: "hsl(340, 70%, 50%)" },
    { icon: FileText, label: "Relatórios", key: "total_relatorios", color: "hsl(20, 80%, 50%)" },
  ];

  return (
    <div className="space-y-4">
      <div className="pbi-header flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <div>
            <h1 className="text-base font-semibold text-white">Backup Completo do Banco de Dados</h1>
            <p className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Exporte e restaure TODOS os dados do sistema (6 tabelas)</p>
          </div>
        </div>
      </div>

      {/* Info tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="pbi-tile">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4" style={{ color: "hsl(207, 89%, 48%)" }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Segurança</span>
          </div>
          <p className="text-[12px]" style={{ color: "hsl(var(--pbi-text-primary))" }}>Apenas administradores podem realizar backup e restauração</p>
        </div>
        <div className="pbi-tile">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4" style={{ color: "hsl(45, 100%, 51%)" }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Dados Incluídos</span>
          </div>
          <p className="text-[12px]" style={{ color: "hsl(var(--pbi-text-primary))" }}>Perfis, roles, metas, ações, check-ins e relatórios</p>
        </div>
        <div className="pbi-tile">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" style={{ color: "hsl(152, 60%, 38%)" }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Último Backup</span>
          </div>
          <p className="text-[12px]" style={{ color: "hsl(var(--pbi-text-primary))" }}>
            {lastBackup ? new Date(lastBackup.created_at).toLocaleString("pt-BR") : "Nenhum nesta sessão"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Export */}
        <div className="pbi-tile">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-4 h-4" style={{ color: "hsl(152, 60%, 38%)" }} />
            <span className="text-[12px] font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Exportar Backup Completo</span>
          </div>
          <p className="text-[11px] mb-4" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
            Gera um arquivo JSON com TODOS os dados do banco: perfis, roles, metas, ações, check-ins e relatórios.
          </p>
          <div className="space-y-2">
            {[
              "Perfis de usuários e autenticação",
              "Roles e permissões",
              "Metas (OKRs) completas",
              "Plano de ações das metas",
              "Check-ins e histórico de progresso",
              "Relatórios gerados",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(152, 60%, 38%)" }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <Button onClick={handleExport} disabled={exporting} className="w-full h-9 text-[12px] font-semibold mt-5 gap-2"
            style={{ background: "hsl(152, 60%, 38%)", color: "white" }}>
            {exporting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Exportando...</> : <><Download className="w-3.5 h-3.5" /> Exportar Backup Completo</>}
          </Button>

          {lastBackup && (
            <div className="mt-4 p-3 rounded-md" style={{ background: "hsl(var(--pbi-dark))", border: "1px solid hsl(var(--pbi-border))" }}>
              <div className="flex items-center gap-2 mb-2">
                <FileJson className="w-3.5 h-3.5" style={{ color: "hsl(var(--pbi-yellow))" }} />
                <span className="text-[11px] font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Último backup exportado</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
                {metaStats.map(s => (
                  <div key={s.key} className="flex items-center gap-1.5">
                    <s.icon className="w-3 h-3" style={{ color: s.color }} />
                    <div>
                      <span className="block font-medium" style={{ color: "hsl(var(--pbi-text-primary))" }}>
                        {(lastBackup.metadata as any)[s.key] || 0}
                      </span>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Import */}
        <div className="pbi-tile">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-4 h-4" style={{ color: "hsl(45, 100%, 51%)" }} />
            <span className="text-[12px] font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Restaurar Backup</span>
          </div>
          <p className="text-[11px] mb-4" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
            Selecione um arquivo de backup JSON para restaurar TODOS os dados. Os registros existentes serão atualizados (upsert).
          </p>
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "hsl(45, 100%, 51%)" }} />
              <span>Registros existentes serão sobrescritos</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "hsl(45, 100%, 51%)" }} />
              <span>Faça backup antes de restaurar</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "hsl(152, 60%, 38%)" }} />
              <span>Compatível com backups v1.0 e v2.0</span>
            </div>
          </div>

          <input ref={fileRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
          <Button onClick={() => fileRef.current?.click()} className="w-full h-9 text-[12px] font-semibold gap-2"
            style={{ background: "hsl(45, 100%, 51%)", color: "hsl(var(--pbi-dark))" }}>
            <Upload className="w-3.5 h-3.5" /> Selecionar Arquivo de Backup
          </Button>
        </div>
      </div>

      {/* Restore confirm dialog */}
      <Dialog open={confirmRestore} onOpenChange={setConfirmRestore}>
        <DialogContent className="sm:max-w-md" style={{ background: "hsl(var(--pbi-surface))", border: "1px solid hsl(var(--pbi-border))" }}>
          <DialogHeader>
            <DialogTitle className="text-[14px] flex items-center gap-2" style={{ color: "hsl(var(--pbi-text-primary))" }}>
              <AlertTriangle className="w-5 h-5" style={{ color: "hsl(45, 100%, 51%)" }} />
              Confirmar Restauração Completa
            </DialogTitle>
          </DialogHeader>
          {pendingMeta && (
            <div className="space-y-4 mt-2">
              <p className="text-[12px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
                Você está prestes a restaurar um backup completo. Os dados atuais serão sobrescritos.
              </p>
              <div className="p-3 rounded-md space-y-2" style={{ background: "hsl(var(--pbi-dark))", border: "1px solid hsl(var(--pbi-border))" }}>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span style={{ color: "hsl(var(--pbi-text-secondary))" }}>Criado em:</span><br/><span style={{ color: "hsl(var(--pbi-text-primary))" }}>{new Date(pendingMeta.created_at).toLocaleString("pt-BR")}</span></div>
                  <div><span style={{ color: "hsl(var(--pbi-text-secondary))" }}>Por:</span><br/><span style={{ color: "hsl(var(--pbi-text-primary))" }}>{pendingMeta.created_by}</span></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] pt-2" style={{ borderTop: "1px solid hsl(var(--pbi-border))" }}>
                  {metaStats.map(s => (
                    <div key={s.key} className="flex items-center gap-1.5">
                      <s.icon className="w-3 h-3" style={{ color: s.color }} />
                      <div>
                        <span className="block font-medium" style={{ color: "hsl(var(--pbi-text-primary))" }}>
                          {(pendingMeta.metadata as any)?.[s.key] || 0}
                        </span>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setConfirmRestore(false)} className="flex-1 h-8 text-[11px] border-none"
                  style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }}>
                  Cancelar
                </Button>
                <Button onClick={handleRestore} disabled={importing} className="flex-1 h-8 text-[11px] font-semibold gap-1"
                  style={{ background: "hsl(0, 72%, 51%)", color: "white" }}>
                  {importing ? <><RefreshCw className="w-3 h-3 animate-spin" /> Restaurando...</> : "Confirmar Restauração"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
