import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { HardDrive, Download, Upload, RefreshCw, Shield, Clock, Database, CheckCircle2, AlertTriangle, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface BackupMeta {
  version: string;
  created_at: string;
  created_by: string;
  metadata: {
    total_profiles: number;
    total_roles: number;
    total_users: number;
  };
}

export default function BackupRestore() {
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

      // Download as JSON
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_sanremo_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Backup exportado!", description: `${backup.metadata.total_users} usuários, ${backup.metadata.total_profiles} perfis` });
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

      toast({ title: "Restauração concluída!", description: `${res.data.restored.profiles} perfis, ${res.data.restored.user_roles} roles restaurados` });
      setConfirmRestore(false);
      setPendingFile(null);
      setPendingMeta(null);
    } catch (err: any) {
      toast({ title: "Erro ao restaurar", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* PBI Header */}
      <div className="pbi-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <div>
            <h1 className="text-base font-semibold text-white">Backup & Restauração</h1>
            <p className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Exporte e restaure os dados do sistema</p>
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
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Formato</span>
          </div>
          <p className="text-[12px]" style={{ color: "hsl(var(--pbi-text-primary))" }}>Arquivo JSON com perfis, roles e metadados dos usuários</p>
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
            <span className="text-[12px] font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Exportar Backup</span>
          </div>
          <p className="text-[11px] mb-4" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
            Gera um arquivo JSON com todos os dados do sistema: perfis de usuários, roles e configurações. Salve em local seguro.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "hsl(152, 60%, 38%)" }} />
              <span>Perfis de usuários e metadados</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "hsl(152, 60%, 38%)" }} />
              <span>Roles e permissões (admin, master, normal)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "hsl(152, 60%, 38%)" }} />
              <span>Informações de autenticação</span>
            </div>
          </div>
          <Button onClick={handleExport} disabled={exporting} className="w-full h-9 text-[12px] font-semibold mt-5 gap-2"
            style={{ background: "hsl(152, 60%, 38%)", color: "white" }}>
            {exporting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Exportando...</> : <><Download className="w-3.5 h-3.5" /> Exportar Backup</>}
          </Button>

          {lastBackup && (
            <div className="mt-4 p-3 rounded-md" style={{ background: "hsl(var(--pbi-dark))", border: "1px solid hsl(var(--pbi-border))" }}>
              <div className="flex items-center gap-2 mb-2">
                <FileJson className="w-3.5 h-3.5" style={{ color: "hsl(var(--pbi-yellow))" }} />
                <span className="text-[11px] font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Último backup exportado</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
                <div><span className="block font-medium" style={{ color: "hsl(var(--pbi-text-primary))" }}>{lastBackup.metadata.total_users}</span>Usuários</div>
                <div><span className="block font-medium" style={{ color: "hsl(var(--pbi-text-primary))" }}>{lastBackup.metadata.total_profiles}</span>Perfis</div>
                <div><span className="block font-medium" style={{ color: "hsl(var(--pbi-text-primary))" }}>{lastBackup.metadata.total_roles}</span>Roles</div>
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
            Selecione um arquivo de backup JSON gerado anteriormente para restaurar os dados. Os registros existentes serão atualizados (upsert).
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
              <span>Apenas arquivos .json são aceitos</span>
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
              Confirmar Restauração
            </DialogTitle>
          </DialogHeader>
          {pendingMeta && (
            <div className="space-y-4 mt-2">
              <p className="text-[12px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
                Você está prestes a restaurar um backup. Os dados atuais serão sobrescritos.
              </p>
              <div className="p-3 rounded-md" style={{ background: "hsl(var(--pbi-dark))", border: "1px solid hsl(var(--pbi-border))" }}>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span style={{ color: "hsl(var(--pbi-text-secondary))" }}>Criado em:</span><br/><span style={{ color: "hsl(var(--pbi-text-primary))" }}>{new Date(pendingMeta.created_at).toLocaleString("pt-BR")}</span></div>
                  <div><span style={{ color: "hsl(var(--pbi-text-secondary))" }}>Por:</span><br/><span style={{ color: "hsl(var(--pbi-text-primary))" }}>{pendingMeta.created_by}</span></div>
                  <div><span style={{ color: "hsl(var(--pbi-text-secondary))" }}>Usuários:</span><br/><span style={{ color: "hsl(var(--pbi-text-primary))" }}>{pendingMeta.metadata.total_users}</span></div>
                  <div><span style={{ color: "hsl(var(--pbi-text-secondary))" }}>Perfis:</span><br/><span style={{ color: "hsl(var(--pbi-text-primary))" }}>{pendingMeta.metadata.total_profiles}</span></div>
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
