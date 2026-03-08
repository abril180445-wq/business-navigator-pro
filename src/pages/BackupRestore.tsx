import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  HardDrive, Download, Upload, RefreshCw, Shield, Clock, Database,
  CheckCircle2, AlertTriangle, FileJson, Target, ListChecks, BarChart3,
  FileText, Users, FileArchive, ArrowRight,
} from "lucide-react";
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

      const zip = new JSZip();
      const dateStr = new Date().toISOString().split("T")[0];

      const { sql_dump, ...backupWithoutSQL } = backup;
      zip.file("backup_completo.json", JSON.stringify(backupWithoutSQL, null, 2));

      if (sql_dump) {
        zip.file("backup_supabase.sql", sql_dump);
      }

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

      zip.file("LEIAME.txt", [
        `=== BACKUP SAN REMO v3.0 ===`,
        `Data: ${new Date(backup.created_at).toLocaleString("pt-BR")}`,
        `Criado por: ${backup.created_by}`,
        ``,
        `=== ARQUIVOS ===`,
        `backup_completo.json — Restauração via sistema`,
        `backup_supabase.sql — SQL Editor / psql`,
        `tabelas/*.csv — Abrir no Excel`,
        `tabelas/*.json — Dados por tabela`,
      ].join("\n"));

      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_sanremo_${dateStr}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      const total = Object.values(backup.metadata).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
      toast({ title: "✅ Backup exportado!", description: `${total} registros exportados com sucesso` });
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
      toast({ title: "✅ Restauração concluída!", description: `${total} registros restaurados` });
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
    <div className="space-y-5">
      {/* Header */}
      <div className="pbi-header flex items-center gap-3">
        <HardDrive className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
        <div>
          <h1 className="text-base font-semibold text-white">Backup & Restauração</h1>
          <p className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
            Exporte ou restaure o banco de dados completo do sistema
          </p>
        </div>
      </div>

      {/* Two main actions — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ─── EXPORTAR ─── */}
        <div className="pbi-tile flex flex-col" style={{ borderTop: "3px solid hsl(152, 60%, 38%)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "hsl(152, 60%, 38%)", color: "white" }}>
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Exportar Backup</h2>
              <p className="text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Baixa um ZIP com todos os dados</p>
            </div>
          </div>

          <p className="text-[11px] mb-4 leading-relaxed" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
            O arquivo ZIP contém o backup completo em múltiplos formatos para diferentes usos:
          </p>

          <div className="space-y-2.5 mb-5 flex-1">
            {[
              { label: "SQL compatível com Supabase", desc: "Colar no SQL Editor ou psql", icon: Database, color: "hsl(207, 89%, 48%)" },
              { label: "JSON para restauração", desc: "Reimportar nesta mesma tela", icon: FileJson, color: "hsl(152, 60%, 38%)" },
              { label: "CSV por tabela", desc: "Abrir e analisar no Excel", icon: FileArchive, color: "hsl(45, 100%, 51%)" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-md" style={{ background: "hsl(var(--pbi-dark))" }}>
                <item.icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                <div>
                  <span className="text-[11px] font-semibold block" style={{ color: "hsl(var(--pbi-text-primary))" }}>{item.label}</span>
                  <span className="text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleExport} disabled={exporting}
            className="w-full h-10 text-[12px] font-bold gap-2 mt-auto"
            style={{ background: "hsl(152, 60%, 38%)", color: "white" }}>
            {exporting
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Exportando...</>
              : <><Download className="w-4 h-4" /> Exportar Backup</>
            }
          </Button>

          {/* Last backup summary */}
          {lastBackup && (
            <div className="mt-4 p-3 rounded-md" style={{ background: "hsl(var(--pbi-dark))", border: "1px solid hsl(var(--pbi-border))" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Último backup</span>
                <span className="text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
                  {new Date(lastBackup.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {metaStats.map(s => (
                  <div key={s.key} className="flex items-center gap-1.5 text-[10px]">
                    <s.icon className="w-3 h-3" style={{ color: s.color }} />
                    <span className="font-bold" style={{ color: "hsl(var(--pbi-text-primary))" }}>
                      {(lastBackup.metadata as any)[s.key] || 0}
                    </span>
                    <span style={{ color: "hsl(var(--pbi-text-secondary))" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── RESTAURAR ─── */}
        <div className="pbi-tile flex flex-col" style={{ borderTop: "3px solid hsl(207, 89%, 48%)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "hsl(207, 89%, 48%)", color: "white" }}>
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Restaurar Backup</h2>
              <p className="text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Importa um arquivo e atualiza o banco</p>
            </div>
          </div>

          <p className="text-[11px] mb-4 leading-relaxed" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
            Selecione um arquivo de backup exportado anteriormente. O banco de dados será atualizado automaticamente.
          </p>

          {/* Steps */}
          <div className="space-y-3 mb-5 flex-1">
            {[
              { step: 1, label: "Selecione o arquivo", desc: "ZIP ou JSON exportado pelo sistema" },
              { step: 2, label: "Revise os dados", desc: "Confira o resumo antes de confirmar" },
              { step: 3, label: "Confirme a restauração", desc: "O banco será atualizado automaticamente" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 p-2.5 rounded-md" style={{ background: "hsl(var(--pbi-dark))" }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                  style={{ background: "hsl(207, 89%, 48%)", color: "white" }}>
                  {item.step}
                </div>
                <div>
                  <span className="text-[11px] font-semibold block" style={{ color: "hsl(var(--pbi-text-primary))" }}>{item.label}</span>
                  <span className="text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Warnings */}
          <div className="flex items-center gap-2 mb-4 p-2.5 rounded-md" style={{ background: "hsl(45, 100%, 51%, 0.08)", border: "1px solid hsl(45, 100%, 51%, 0.2)" }}>
            <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "hsl(45, 100%, 51%)" }} />
            <span className="text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
              Registros existentes serão sobrescritos. Faça um backup antes de restaurar.
            </span>
          </div>

          <input ref={fileRef} type="file" accept=".zip,.json" onChange={handleFileSelect} className="hidden" />
          <Button onClick={() => fileRef.current?.click()}
            className="w-full h-10 text-[12px] font-bold gap-2 mt-auto"
            style={{ background: "hsl(207, 89%, 48%)", color: "white" }}>
            <Upload className="w-4 h-4" /> Selecionar Arquivo
          </Button>
        </div>
      </div>

      {/* Info footer */}
      <div className="pbi-tile">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <span className="text-[11px] font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Tabelas incluídas no backup</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Perfis", "Roles", "Metas", "Ações", "Check-ins", "Relatórios", "Usuários Auth"].map((t) => (
            <span key={t} className="text-[10px] px-2.5 py-1 rounded-full font-medium"
              style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-secondary))", border: "1px solid hsl(var(--pbi-border))" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Confirm restore dialog */}
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
                O banco será atualizado com os dados abaixo. Registros existentes serão sobrescritos.
              </p>
              <div className="p-3 rounded-md space-y-3" style={{ background: "hsl(var(--pbi-dark))", border: "1px solid hsl(var(--pbi-border))" }}>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Data</span>
                    <span style={{ color: "hsl(var(--pbi-text-primary))" }}>{new Date(pendingMeta.created_at).toLocaleString("pt-BR")}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Criado por</span>
                    <span style={{ color: "hsl(var(--pbi-text-primary))" }}>{pendingMeta.created_by}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Versão</span>
                    <span style={{ color: "hsl(var(--pbi-text-primary))" }}>{pendingMeta.version}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] pt-2" style={{ borderTop: "1px solid hsl(var(--pbi-border))" }}>
                  {metaStats.map(s => (
                    <div key={s.key} className="flex items-center gap-1.5">
                      <s.icon className="w-3 h-3" style={{ color: s.color }} />
                      <span className="font-bold" style={{ color: "hsl(var(--pbi-text-primary))" }}>
                        {(pendingMeta.metadata as any)?.[s.key] || 0}
                      </span>
                      <span style={{ color: "hsl(var(--pbi-text-secondary))" }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setConfirmRestore(false)} className="flex-1 h-9 text-[11px] border-none"
                  style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }}>
                  Cancelar
                </Button>
                <Button onClick={handleRestore} disabled={importing} className="flex-1 h-9 text-[11px] font-bold gap-1.5"
                  style={{ background: "hsl(0, 72%, 51%)", color: "white" }}>
                  {importing
                    ? <><RefreshCw className="w-3 h-3 animate-spin" /> Restaurando...</>
                    : <><CheckCircle2 className="w-3.5 h-3.5" /> Confirmar Restauração</>
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
