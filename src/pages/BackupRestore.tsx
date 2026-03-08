import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { HardDrive, Download, Upload, RefreshCw, Shield, Clock, Database, CheckCircle2, AlertTriangle, FileJson, Target, ListChecks, BarChart3, FileText, Users, FileArchive, DatabaseZap, ArrowUpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import AccessDenied from "@/components/AccessDenied";
import JSZip from "jszip";

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
  const updateFileRef = useRef<HTMLInputElement>(null);
  const [updating, setUpdating] = useState(false);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [updateFile, setUpdateFile] = useState<any>(null);
  const [updateMeta, setUpdateMeta] = useState<BackupMeta | null>(null);

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

      // Create ZIP with all data
      const zip = new JSZip();
      const dateStr = new Date().toISOString().split("T")[0];

      // Full backup JSON (without sql_dump to keep clean)
      const { sql_dump, ...backupWithoutSQL } = backup;
      zip.file("backup_completo.json", JSON.stringify(backupWithoutSQL, null, 2));

      // SQL dump — compatible with Supabase SQL Editor / psql
      if (sql_dump) {
        zip.file("backup_supabase.sql", sql_dump);
      }

      // Individual table CSVs for easy viewing
      const tables = ["profiles", "user_roles", "metas", "acoes_meta", "meta_checkins", "relatorios_gerados", "auth_users"];
      for (const table of tables) {
        const rows = backup.data[table];
        if (rows && rows.length > 0) {
          zip.file(`tabelas/${table}.json`, JSON.stringify(rows, null, 2));
          const headers = Object.keys(rows[0]);
          const csvLines = [
            headers.join(";"),
            ...rows.map((row: any) => headers.map(h => {
              const val = row[h];
              if (val === null || val === undefined) return "";
              if (typeof val === "object") return JSON.stringify(val).replace(/"/g, '""');
              return String(val).replace(/"/g, '""');
            }).join(";"))
          ];
          zip.file(`tabelas/${table}.csv`, csvLines.join("\n"));
        }
      }

      // Metadata file
      zip.file("LEIAME.txt", [
        `=== BACKUP COMPLETO SAN REMO v3.0 ===`,
        `Data: ${new Date(backup.created_at).toLocaleString("pt-BR")}`,
        `Criado por: ${backup.created_by}`,
        ``,
        `=== RESUMO ===`,
        `Perfis: ${backup.metadata.total_profiles}`,
        `Roles: ${backup.metadata.total_roles}`,
        `Usuários Auth: ${backup.metadata.total_users}`,
        `Metas: ${backup.metadata.total_metas}`,
        `Ações: ${backup.metadata.total_acoes}`,
        `Check-ins: ${backup.metadata.total_checkins}`,
        `Relatórios: ${backup.metadata.total_relatorios}`,
        ``,
        `=== ARQUIVOS ===`,
        `backup_completo.json — Backup JSON (restauração via sistema)`,
        `backup_supabase.sql — SQL compatível com Supabase SQL Editor / psql`,
        `tabelas/*.json — Tabelas individuais em JSON`,
        `tabelas/*.csv — Tabelas individuais em CSV (abrir no Excel)`,
        ``,
        `=== RESTAURAÇÃO ===`,
        `Opção 1: Importe o .zip na tela de Backup & Restauração.`,
        `Opção 2: Cole backup_supabase.sql no SQL Editor do Supabase.`,
      ].join("\n"));

      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_completo_sanremo_${dateStr}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      const total = Object.values(backup.metadata).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
      toast({ title: "Backup ZIP exportado!", description: `${total} registros em 6 tabelas + CSVs` });
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
      let backup: any;

      if (file.name.endsWith(".zip")) {
        const zip = await JSZip.loadAsync(file);
        const jsonFile = zip.file("backup_completo.json");
        if (!jsonFile) throw new Error("Arquivo backup_completo.json não encontrado no ZIP");
        const text = await jsonFile.async("string");
        backup = JSON.parse(text);
      } else if (file.name.endsWith(".json")) {
        const text = await file.text();
        backup = JSON.parse(text);
      } else {
        throw new Error("Formato não suportado. Use .zip ou .json");
      }

      if (!backup.data || !backup.version) throw new Error("Formato de backup inválido");
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
      const total = Object.values(r).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
      toast({ title: "Restauração concluída!", description: `${total} registros restaurados no banco de dados` });
      setConfirmRestore(false);
      setPendingFile(null);
      setPendingMeta(null);
    } catch (err: any) {
      toast({ title: "Erro ao restaurar", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const handleUpdateFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let backup: any;
      if (file.name.endsWith(".zip")) {
        const zip = await JSZip.loadAsync(file);
        const jsonFile = zip.file("backup_completo.json");
        if (!jsonFile) throw new Error("Arquivo backup_completo.json não encontrado no ZIP");
        const text = await jsonFile.async("string");
        backup = JSON.parse(text);
      } else if (file.name.endsWith(".json")) {
        const text = await file.text();
        backup = JSON.parse(text);
      } else {
        throw new Error("Formato não suportado. Use .zip ou .json");
      }
      if (!backup.data || !backup.version) throw new Error("Formato de backup inválido");
      setUpdateFile(backup);
      setUpdateMeta({ version: backup.version, created_at: backup.created_at, created_by: backup.created_by, metadata: backup.metadata });
      setConfirmUpdate(true);
    } catch (err: any) {
      toast({ title: "Arquivo inválido", description: err.message, variant: "destructive" });
    }
    if (updateFileRef.current) updateFileRef.current.value = "";
  };

  const handleUpdate = async () => {
    if (!updateFile) return;
    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("backup-system", {
        body: { action: "import", backup: updateFile },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      if (res.data.error) throw new Error(res.data.error);

      const r = res.data.restored;
      const total = Object.values(r).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
      toast({ title: "✅ Banco atualizado com sucesso!", description: `${total} registros atualizados em 6 tabelas` });
      setConfirmUpdate(false);
      setUpdateFile(null);
      setUpdateMeta(null);
    } catch (err: any) {
      toast({ title: "Erro ao atualizar banco", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(false);
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
            <h1 className="text-base font-semibold text-white">Backup Completo — Sistema & Banco de Dados</h1>
            <p className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Exporta ZIP com todas as tabelas (JSON + CSV) • Restauração atualiza o banco automaticamente</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="pbi-tile">
          <div className="flex items-center gap-2 mb-2">
            <FileArchive className="w-4 h-4" style={{ color: "hsl(207, 89%, 48%)" }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Formato</span>
          </div>
          <p className="text-[12px]" style={{ color: "hsl(var(--pbi-text-primary))" }}>ZIP com JSON + SQL (Supabase) + CSVs por tabela</p>
        </div>
        <div className="pbi-tile">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4" style={{ color: "hsl(45, 100%, 51%)" }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Tabelas</span>
          </div>
          <p className="text-[12px]" style={{ color: "hsl(var(--pbi-text-primary))" }}>6 tabelas: perfis, roles, metas, ações, check-ins, relatórios</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Export */}
        <div className="pbi-tile">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-4 h-4" style={{ color: "hsl(152, 60%, 38%)" }} />
            <span className="text-[12px] font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Exportar Backup Completo (ZIP)</span>
          </div>
          <p className="text-[11px] mb-4" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
            Baixa um arquivo ZIP contendo o backup completo do banco + CSVs individuais para abrir no Excel.
          </p>
          <div className="space-y-2">
            {[
              "backup_completo.json — para restauração",
              "tabelas/*.csv — abrir no Excel",
              "tabelas/*.json — dados por tabela",
              "LEIAME.txt — resumo do backup",
              "Perfis, roles, metas, ações, check-ins, relatórios",
              "Dados de autenticação dos usuários",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(152, 60%, 38%)" }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <Button onClick={handleExport} disabled={exporting} className="w-full h-9 text-[12px] font-semibold mt-5 gap-2"
            style={{ background: "hsl(152, 60%, 38%)", color: "white" }}>
            {exporting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Exportando...</> : <><FileArchive className="w-3.5 h-3.5" /> Exportar Backup ZIP</>}
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
            <span className="text-[12px] font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Restaurar Backup (atualiza o banco)</span>
          </div>
          <p className="text-[11px] mb-4" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
            Importe um arquivo ZIP ou JSON de backup. Todos os dados serão restaurados e o banco de dados será atualizado automaticamente.
          </p>
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "hsl(45, 100%, 51%)" }} />
              <span>Registros existentes serão sobrescritos no banco</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "hsl(45, 100%, 51%)" }} />
              <span>Faça um backup antes de restaurar</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "hsl(152, 60%, 38%)" }} />
              <span>Aceita .zip e .json — compatível com v1.0 e v2.0</span>
            </div>
          </div>

          <input ref={fileRef} type="file" accept=".zip,.json" onChange={handleFileSelect} className="hidden" />
          <Button onClick={() => fileRef.current?.click()} className="w-full h-9 text-[12px] font-semibold gap-2"
            style={{ background: "hsl(45, 100%, 51%)", color: "hsl(var(--pbi-dark))" }}>
            <Upload className="w-3.5 h-3.5" /> Selecionar Arquivo (.zip ou .json)
          </Button>
        </div>
      </div>

      {/* Atualizar Banco — destaque */}
      <div className="pbi-tile" style={{ border: "2px solid hsl(207, 89%, 48%)", position: "relative", overflow: "hidden" }}>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, hsl(207, 89%, 48%), hsl(152, 60%, 38%), hsl(45, 100%, 51%))" }} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(207, 89%, 48%), hsl(207, 89%, 38%))" }}>
              <DatabaseZap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold" style={{ color: "hsl(var(--pbi-text-primary))" }}>
                Atualizar Banco de Dados
              </h2>
              <p className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
                Importe um arquivo ZIP de backup para atualizar todas as tabelas do banco de dados de uma só vez
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input ref={updateFileRef} type="file" accept=".zip,.json" onChange={handleUpdateFileSelect} className="hidden" />
            <Button onClick={() => updateFileRef.current?.click()} disabled={updating}
              className="h-11 px-6 text-[13px] font-bold gap-2 w-full sm:w-auto shadow-lg"
              style={{ background: "linear-gradient(135deg, hsl(207, 89%, 48%), hsl(207, 89%, 38%))", color: "white" }}>
              <ArrowUpCircle className="w-5 h-5" />
              Atualizar Banco via ZIP
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: "1px solid hsl(var(--pbi-border))" }}>
          {[
            { label: "Selecione o arquivo ZIP", icon: FileArchive },
            { label: "Confirme a atualização", icon: CheckCircle2 },
            { label: "Banco atualizado automaticamente", icon: DatabaseZap },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: "hsl(207, 89%, 48%)", color: "white" }}>{i + 1}</div>
              <step.icon className="w-3 h-3" style={{ color: "hsl(207, 89%, 48%)" }} />
              <span>{step.label}</span>
              {i < 2 && <span style={{ color: "hsl(var(--pbi-border))" }}>→</span>}
            </div>
          ))}
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
                O banco de dados será atualizado com todos os dados do backup. Registros existentes serão sobrescritos.
              </p>
              <div className="p-3 rounded-md space-y-2" style={{ background: "hsl(var(--pbi-dark))", border: "1px solid hsl(var(--pbi-border))" }}>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span style={{ color: "hsl(var(--pbi-text-secondary))" }}>Criado em:</span><br/><span style={{ color: "hsl(var(--pbi-text-primary))" }}>{new Date(pendingMeta.created_at).toLocaleString("pt-BR")}</span></div>
                  <div><span style={{ color: "hsl(var(--pbi-text-secondary))" }}>Por:</span><br/><span style={{ color: "hsl(var(--pbi-text-primary))" }}>{pendingMeta.created_by}</span></div>
                  <div><span style={{ color: "hsl(var(--pbi-text-secondary))" }}>Versão:</span><br/><span style={{ color: "hsl(var(--pbi-text-primary))" }}>{pendingMeta.version}</span></div>
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

      {/* Update DB confirm dialog */}
      <Dialog open={confirmUpdate} onOpenChange={setConfirmUpdate}>
        <DialogContent className="sm:max-w-md" style={{ background: "hsl(var(--pbi-surface))", border: "2px solid hsl(207, 89%, 48%)" }}>
          <DialogHeader>
            <DialogTitle className="text-[14px] flex items-center gap-2" style={{ color: "hsl(var(--pbi-text-primary))" }}>
              <DatabaseZap className="w-5 h-5" style={{ color: "hsl(207, 89%, 48%)" }} />
              Confirmar Atualização do Banco
            </DialogTitle>
          </DialogHeader>
          {updateMeta && (
            <div className="space-y-4 mt-2">
              <p className="text-[12px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
                Todas as 6 tabelas serão atualizadas com os dados do arquivo importado. Registros existentes serão sobrescritos.
              </p>
              <div className="p-3 rounded-md space-y-2" style={{ background: "hsl(var(--pbi-dark))", border: "1px solid hsl(var(--pbi-border))" }}>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span style={{ color: "hsl(var(--pbi-text-secondary))" }}>Backup de:</span><br/><span style={{ color: "hsl(var(--pbi-text-primary))" }}>{new Date(updateMeta.created_at).toLocaleString("pt-BR")}</span></div>
                  <div><span style={{ color: "hsl(var(--pbi-text-secondary))" }}>Criado por:</span><br/><span style={{ color: "hsl(var(--pbi-text-primary))" }}>{updateMeta.created_by}</span></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] pt-2" style={{ borderTop: "1px solid hsl(var(--pbi-border))" }}>
                  {metaStats.map(s => (
                    <div key={s.key} className="flex items-center gap-1.5">
                      <s.icon className="w-3 h-3" style={{ color: s.color }} />
                      <div>
                        <span className="block font-medium" style={{ color: "hsl(var(--pbi-text-primary))" }}>
                          {(updateMeta.metadata as any)?.[s.key] || 0}
                        </span>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setConfirmUpdate(false)} className="flex-1 h-8 text-[11px] border-none"
                  style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdate} disabled={updating} className="flex-1 h-8 text-[11px] font-semibold gap-2"
                  style={{ background: "linear-gradient(135deg, hsl(207, 89%, 48%), hsl(207, 89%, 38%))", color: "white" }}>
                  {updating ? <><RefreshCw className="w-3 h-3 animate-spin" /> Atualizando...</> : <><DatabaseZap className="w-3.5 h-3.5" /> Atualizar Banco</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
