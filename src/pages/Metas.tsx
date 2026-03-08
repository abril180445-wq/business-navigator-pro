import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Target, TrendingUp, Award, Plus, X, Pencil, Check, Filter, Calendar,
  ChevronDown, AlertTriangle, BarChart3, Clock, CheckCircle2, XCircle,
  Flame, Trophy, ListChecks, Eye, RefreshCw, Trash2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, RadialBarChart, RadialBar, PieChart, Pie, Cell,
  AreaChart, Area, ComposedChart,
} from "recharts";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

interface Meta {
  id: string;
  nome: string;
  atual: number;
  objetivo: number;
  unidade: string;
  cor: string;
  categoria: string;
  responsavel: string;
  prazo: string;
  prioridade: "alta" | "media" | "baixa";
}

interface AcaoMeta {
  id: string;
  meta_id: string;
  descricao: string;
  concluida: boolean;
  responsavel: string | null;
  prazo: string | null;
}

const coresMeta = [
  "hsl(207, 89%, 48%)", "hsl(45, 100%, 51%)", "hsl(152, 60%, 38%)",
  "hsl(174, 62%, 47%)", "hsl(0, 72%, 51%)", "hsl(28, 87%, 55%)",
  "hsl(270, 60%, 55%)", "hsl(330, 70%, 50%)",
];

const categorias = ["Financeiro", "Vendas", "Operacional", "Qualidade", "RH", "Engenharia"];

const prioridadeConfig = {
  alta: { label: "Alta", color: "hsl(0, 72%, 51%)", bg: "hsl(0, 72%, 51%, 0.12)", icon: Flame },
  media: { label: "Média", color: "hsl(45, 100%, 51%)", bg: "hsl(45, 100%, 51%, 0.12)", icon: AlertTriangle },
  baixa: { label: "Baixa", color: "hsl(207, 89%, 48%)", bg: "hsl(207, 89%, 48%, 0.12)", icon: Clock },
};

const PBITile = ({ children, title, className = "", actions }: { children: React.ReactNode; title?: string; className?: string; actions?: React.ReactNode }) => (
  <div className={`pbi-tile p-4 ${className}`}>
    {(title || actions) && (
      <div className="flex items-center justify-between mb-3">
        {title && <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>}
        {actions}
      </div>
    )}
    {children}
  </div>
);

export default function Metas() {
  const { toast } = useToast();
  const { user, canEditMetas, userRole } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [acoes, setAcoes] = useState<AcaoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [acaoDialogOpen, setAcaoDialogOpen] = useState(false);
  const [acaoMetaId, setAcaoMetaId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ atual: "", objetivo: "" });
  const [newMeta, setNewMeta] = useState({ nome: "", atual: "", objetivo: "", unidade: "R$", categoria: "Financeiro", responsavel: "", prioridade: "media" as Meta["prioridade"] });
  const [newAcao, setNewAcao] = useState({ descricao: "", responsavel: "", prazo: "" });
  const [activeTab, setActiveTab] = useState<"editor" | "analytics" | "ranking" | "acoes">(canEditMetas ? "editor" : "acoes");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroPrioridade, setFiltroPrioridade] = useState("Todas");

  const fetchMetas = useCallback(async () => {
    const { data, error } = await supabase.from("metas").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setMetas(data.map((m: any) => ({
        id: m.id,
        nome: m.nome,
        atual: Number(m.atual),
        objetivo: Number(m.objetivo),
        unidade: m.unidade,
        cor: m.cor,
        categoria: m.categoria,
        responsavel: m.responsavel,
        prazo: m.prazo,
        prioridade: m.prioridade as Meta["prioridade"],
      })));
    }
    setLoading(false);
  }, []);

  const fetchAcoes = useCallback(async () => {
    const { data } = await supabase.from("acoes_meta").select("*").order("created_at");
    if (data) setAcoes(data as AcaoMeta[]);
  }, []);

  useEffect(() => { fetchMetas(); fetchAcoes(); }, [fetchMetas, fetchAcoes]);
  useRealtimeTable("metas", fetchMetas);
  useRealtimeTable("acoes_meta", fetchAcoes);

  // Set default tab based on role
  useEffect(() => {
    if (!canEditMetas) setActiveTab("acoes");
  }, [canEditMetas]);

  const addMeta = async () => {
    if (!newMeta.nome || !newMeta.objetivo) {
      toast({ title: "Preencha nome e objetivo", variant: "destructive" });
      return;
    }
    const cor = coresMeta[metas.length % coresMeta.length];
    const { error } = await supabase.from("metas").insert({
      nome: newMeta.nome,
      atual: parseFloat(newMeta.atual) || 0,
      objetivo: parseFloat(newMeta.objetivo),
      unidade: newMeta.unidade,
      cor,
      categoria: newMeta.categoria,
      responsavel: newMeta.responsavel,
      prioridade: newMeta.prioridade,
      created_by: user?.id,
    });
    if (error) {
      toast({ title: "Erro ao criar meta", description: error.message, variant: "destructive" });
      return;
    }
    setNewMeta({ nome: "", atual: "", objetivo: "", unidade: "R$", categoria: "Financeiro", responsavel: "", prioridade: "media" });
    setDialogOpen(false);
    toast({ title: "Meta criada!" });
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("metas").update({
      atual: parseFloat(editValues.atual) || 0,
      objetivo: parseFloat(editValues.objetivo) || 1,
    }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setEditingId(null);
    toast({ title: "Meta atualizada!" });
  };

  const removeMeta = async (id: string) => {
    if (!confirm("Excluir esta meta?")) return;
    await supabase.from("metas").delete().eq("id", id);
    toast({ title: "Meta removida" });
  };

  const addAcao = async () => {
    if (!newAcao.descricao || !acaoMetaId) return;
    const { error } = await supabase.from("acoes_meta").insert({
      meta_id: acaoMetaId,
      descricao: newAcao.descricao,
      responsavel: newAcao.responsavel || null,
      prazo: newAcao.prazo || null,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setNewAcao({ descricao: "", responsavel: "", prazo: "" });
    setAcaoDialogOpen(false);
    toast({ title: "Ação adicionada!" });
  };

  const removeAcao = async (id: string) => {
    await supabase.from("acoes_meta").delete().eq("id", id);
  };

  // Filtered metas
  const filteredMetas = metas.filter((m) => {
    if (filtroCategoria !== "Todas" && m.categoria !== filtroCategoria) return false;
    if (filtroPrioridade !== "Todas" && m.prioridade !== filtroPrioridade) return false;
    return true;
  });

  // Analytics
  const totalProgress = metas.length > 0 ? metas.reduce((acc, m) => acc + (m.atual / m.objetivo) * 100, 0) / metas.length : 0;
  const metasAtingidas = metas.filter((m) => m.atual >= m.objetivo).length;
  const metasEmRisco = metas.filter((m) => (m.atual / m.objetivo) < 0.5).length;
  const metasNoPrazo = metas.filter((m) => (m.atual / m.objetivo) >= 0.7).length;

  const categoriasData = categorias.map((cat) => {
    const catMetas = metas.filter((m) => m.categoria === cat);
    if (catMetas.length === 0) return null;
    const avg = catMetas.reduce((a, m) => a + (m.atual / m.objetivo) * 100, 0) / catMetas.length;
    return { name: cat, progresso: Math.round(avg), count: catMetas.length };
  }).filter(Boolean) as { name: string; progresso: number; count: number }[];

  const prioridadeData = [
    { name: "Alta", value: metas.filter((m) => m.prioridade === "alta").length, color: "hsl(0, 72%, 51%)" },
    { name: "Média", value: metas.filter((m) => m.prioridade === "media").length, color: "hsl(45, 100%, 51%)" },
    { name: "Baixa", value: metas.filter((m) => m.prioridade === "baixa").length, color: "hsl(207, 89%, 48%)" },
  ].filter((d) => d.value > 0);

  const statusData = [
    { name: "Atingida", value: metasAtingidas, color: "hsl(152, 60%, 38%)" },
    { name: "No Prazo", value: Math.max(0, metasNoPrazo - metasAtingidas), color: "hsl(207, 89%, 48%)" },
    { name: "Em Risco", value: metasEmRisco, color: "hsl(0, 72%, 51%)" },
    { name: "Em Andamento", value: Math.max(0, metas.length - metasAtingidas - metasEmRisco - Math.max(0, metasNoPrazo - metasAtingidas)), color: "hsl(45, 100%, 51%)" },
  ].filter((d) => d.value > 0);

  const radialData = metas.slice(0, 6).map((m) => ({
    name: m.nome.length > 18 ? m.nome.slice(0, 18) + "…" : m.nome,
    value: Math.round((m.atual / m.objetivo) * 100),
    fill: m.cor,
  }));

  const rankingMetas = [...metas].sort((a, b) => (b.atual / b.objetivo) - (a.atual / a.objetivo));

  const formatVal = (v: number, unidade: string) =>
    unidade === "R$" ? `R$ ${v.toLocaleString("pt-BR")}` : `${v} ${unidade}`;

  const editorTabs = canEditMetas
    ? [
        { key: "editor" as const, label: "Editor de Metas", icon: Pencil },
        { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
        { key: "ranking" as const, label: "Ranking", icon: Trophy },
        { key: "acoes" as const, label: "Plano de Ação", icon: ListChecks },
      ]
    : [
        { key: "acoes" as const, label: "Plano de Ação", icon: ListChecks },
        { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
        { key: "ranking" as const, label: "Ranking", icon: Trophy },
      ];

  const roleLabel = userRole === "admin" ? "Administrador" : userRole === "master" ? "Editor Premium" : "Visualizador";
  const roleBadgeColor = userRole === "admin" ? "hsl(0, 72%, 51%)" : userRole === "master" ? "hsl(45, 100%, 51%)" : "hsl(207, 89%, 48%)";

  return (
    <div className="space-y-3">
      {/* Header with role badge */}
      <div className="pbi-filter-bar rounded-sm px-4 py-2.5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">Filtros</span>
        </div>
        <div className="h-4 w-px bg-border" />

        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="px-3 py-1.5 rounded bg-secondary text-[12px] font-medium text-foreground border-none outline-none cursor-pointer">
          <option value="Todas">Todas Categorias</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)} className="px-3 py-1.5 rounded bg-secondary text-[12px] font-medium text-foreground border-none outline-none cursor-pointer">
          <option value="Todas">Todas Prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>

        <div className="flex-1" />

        <span className="text-[10px] px-2 py-1 rounded-full font-semibold" style={{ background: `${roleBadgeColor}18`, color: roleBadgeColor }}>
          {canEditMetas ? <Pencil className="w-3 h-3 inline mr-1" /> : <Eye className="w-3 h-3 inline mr-1" />}
          {roleLabel}
        </span>

        {canEditMetas && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-[12px] bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-3 h-3 mr-1" /> Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg" style={{ background: "hsl(var(--pbi-surface))", border: "1px solid hsl(var(--pbi-border))" }}>
              <DialogHeader>
                <DialogTitle className="text-[14px]" style={{ color: "hsl(var(--pbi-text-primary))" }}>Criar Nova Meta</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Nome da Meta *</Label>
                  <Input value={newMeta.nome} onChange={(e) => setNewMeta({ ...newMeta, nome: e.target.value })} placeholder="Ex: Faturamento Mensal" className="h-8 text-[12px] border-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Valor Atual</Label>
                    <Input type="number" value={newMeta.atual} onChange={(e) => setNewMeta({ ...newMeta, atual: e.target.value })} placeholder="0" className="h-8 text-[12px] border-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Objetivo *</Label>
                    <Input type="number" value={newMeta.objetivo} onChange={(e) => setNewMeta({ ...newMeta, objetivo: e.target.value })} placeholder="100" className="h-8 text-[12px] border-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Unidade</Label>
                    <Input value={newMeta.unidade} onChange={(e) => setNewMeta({ ...newMeta, unidade: e.target.value })} placeholder="R$" className="h-8 text-[12px] border-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Categoria</Label>
                    <select value={newMeta.categoria} onChange={(e) => setNewMeta({ ...newMeta, categoria: e.target.value })} className="w-full h-8 rounded text-[12px] px-2 border-none outline-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }}>
                      {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Responsável</Label>
                    <Input value={newMeta.responsavel} onChange={(e) => setNewMeta({ ...newMeta, responsavel: e.target.value })} placeholder="Nome" className="h-8 text-[12px] border-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Prioridade</Label>
                    <select value={newMeta.prioridade} onChange={(e) => setNewMeta({ ...newMeta, prioridade: e.target.value as Meta["prioridade"] })} className="w-full h-8 rounded text-[12px] px-2 border-none outline-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }}>
                      <option value="alta">Alta</option>
                      <option value="media">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </div>
                </div>
                <Button onClick={addMeta} className="w-full h-8 text-[12px] font-semibold" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>Criar Meta</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded" style={{ background: "hsl(var(--pbi-surface))", border: "1px solid hsl(var(--pbi-border))" }}>
        {editorTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex items-center gap-1.5 px-4 py-2 rounded text-[12px] font-medium transition-all" style={{ background: isActive ? "hsl(var(--pbi-yellow))" : "transparent", color: isActive ? "hsl(var(--pbi-dark))" : "hsl(var(--pbi-text-secondary))" }}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Metas", value: metas.length, color: "hsl(207, 89%, 48%)", icon: Target },
          { label: "Progresso Médio", value: `${Math.round(totalProgress)}%`, color: "hsl(152, 60%, 38%)", icon: TrendingUp },
          { label: "Atingidas", value: `${metasAtingidas}/${metas.length}`, color: "hsl(45, 100%, 51%)", icon: Award },
          { label: "Em Risco", value: metasEmRisco, color: "hsl(0, 72%, 51%)", icon: AlertTriangle },
          { label: "No Prazo", value: metasNoPrazo, color: "hsl(174, 62%, 47%)", icon: CheckCircle2 },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <PBITile key={kpi.label}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded" style={{ backgroundColor: `${kpi.color}1F` }}><Icon className="w-4 h-4" style={{ color: kpi.color }} /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                  <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                </div>
              </div>
            </PBITile>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* ========== EDITOR TAB (admin/master only) ========== */}
      {activeTab === "editor" && canEditMetas && !loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <PBITile title="Progresso Individual" className="lg:col-span-2">
              <div className="space-y-2.5">
                {filteredMetas.map((meta) => {
                  const pct = Math.min(Math.round((meta.atual / meta.objetivo) * 100), 100);
                  const isEditing = editingId === meta.id;
                  const pCfg = prioridadeConfig[meta.prioridade];
                  const metaAcoes = acoes.filter((a) => a.meta_id === meta.id);

                  return (
                    <div key={meta.id} className="group">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-foreground">{meta.nome}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: pCfg.bg, color: pCfg.color }}>{pCfg.label}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{meta.categoria}</span>
                          {metaAcoes.length > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                              <ListChecks className="w-3 h-3 inline mr-0.5" />{metaAcoes.filter((a) => a.concluida).length}/{metaAcoes.length}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isEditing ? (
                            <>
                              <Input type="number" value={editValues.atual} onChange={(e) => setEditValues({ ...editValues, atual: e.target.value })} className="h-6 w-20 text-[11px] px-1.5" />
                              <span className="text-[11px] text-muted-foreground">/</span>
                              <Input type="number" value={editValues.objetivo} onChange={(e) => setEditValues({ ...editValues, objetivo: e.target.value })} className="h-6 w-20 text-[11px] px-1.5" />
                              <button onClick={() => saveEdit(meta.id)} className="p-1 rounded hover:bg-success/10 text-success"><Check className="w-3 h-3" /></button>
                              <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X className="w-3 h-3" /></button>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] text-muted-foreground">{meta.responsavel}</span>
                              <span className="text-[11px] text-muted-foreground">{formatVal(meta.atual, meta.unidade)} / {formatVal(meta.objetivo, meta.unidade)}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${meta.cor}18`, color: meta.cor }}>{pct}%</span>
                              <button onClick={() => { setEditingId(meta.id); setEditValues({ atual: meta.atual.toString(), objetivo: meta.objetivo.toString() }); }} className="p-1 rounded hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="w-3 h-3" /></button>
                              <button onClick={() => { setAcaoMetaId(meta.id); setAcaoDialogOpen(true); }} className="p-1 rounded hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" title="Adicionar ação"><ListChecks className="w-3 h-3" /></button>
                              <button onClick={() => removeMeta(meta.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: meta.cor }} />
                      </div>
                    </div>
                  );
                })}
                {filteredMetas.length === 0 && !loading && (
                  <p className="text-[12px] text-muted-foreground text-center py-8">Nenhuma meta encontrada. Crie a primeira!</p>
                )}
              </div>
            </PBITile>

            <PBITile title="Gauges de Desempenho">
              {radialData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="15%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
                    <RadialBar label={{ position: "insideStart", fill: "#fff", fontSize: 9 }} background dataKey="value" />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                    <Tooltip formatter={(value: number) => [`${value}%`, "Progresso"]} contentStyle={{ borderRadius: "4px", fontSize: 11 }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[12px] text-muted-foreground text-center py-12">Sem dados</p>
              )}
            </PBITile>
          </div>
        </>
      )}

      {/* ========== PLANO DE AÇÃO TAB (all users) ========== */}
      {activeTab === "acoes" && !loading && (
        <div className="space-y-3">
          {!canEditMetas && (
            <div className="pbi-tile p-4" style={{ borderLeft: "4px solid hsl(207, 89%, 48%)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4" style={{ color: "hsl(207, 89%, 48%)" }} />
                <p className="text-[13px] font-semibold text-foreground">Modo Visualização</p>
              </div>
              <p className="text-[11px] text-muted-foreground">Você pode visualizar as metas e o plano de ação. Para editar, solicite acesso ao administrador.</p>
            </div>
          )}

          {filteredMetas.map((meta) => {
            const pct = Math.min(Math.round((meta.atual / meta.objetivo) * 100), 100);
            const metaAcoes = acoes.filter((a) => a.meta_id === meta.id);
            const pCfg = prioridadeConfig[meta.prioridade];
            const barColor = pct >= 80 ? "hsl(152, 60%, 38%)" : pct >= 50 ? "hsl(207, 89%, 48%)" : pct >= 30 ? "hsl(45, 100%, 51%)" : "hsl(0, 72%, 51%)";

            return (
              <PBITile key={meta.id}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" style={{ color: meta.cor }} />
                    <span className="text-[13px] font-semibold text-foreground">{meta.nome}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: pCfg.bg, color: pCfg.color }}>{pCfg.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{meta.categoria}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground">{formatVal(meta.atual, meta.unidade)} / {formatVal(meta.objetivo, meta.unidade)}</span>
                    <span className="text-[14px] font-bold" style={{ color: barColor }}>{pct}%</span>
                    {canEditMetas && (
                      <button onClick={() => { setAcaoMetaId(meta.id); setAcaoDialogOpen(true); }} className="text-[10px] px-2 py-1 rounded font-medium" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>
                        <Plus className="w-3 h-3 inline mr-0.5" /> Ação
                      </button>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>

                {meta.responsavel && (
                  <p className="text-[10px] text-muted-foreground mb-2">Responsável: <span className="text-foreground font-medium">{meta.responsavel}</span></p>
                )}

                {metaAcoes.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5" style={{ color: "hsl(var(--pbi-yellow))" }} />
                      O que fazer para cumprir esta meta:
                    </p>
                    {metaAcoes.map((acao) => (
                      <div key={acao.id} className="flex items-center gap-2 py-1.5 px-2 rounded" style={{ background: acao.concluida ? "hsl(152, 60%, 38%, 0.06)" : "hsl(var(--pbi-dark) / 0.3)", border: `1px solid ${acao.concluida ? "hsl(152, 60%, 38%, 0.15)" : "hsl(var(--pbi-border))"}` }}>
                        {acao.concluida ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(152, 60%, 38%)" }} />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 shrink-0" style={{ borderColor: "hsl(var(--pbi-text-secondary))" }} />
                        )}
                        <span className={`text-[11px] flex-1 ${acao.concluida ? "line-through text-muted-foreground" : "text-foreground"}`}>{acao.descricao}</span>
                        {acao.responsavel && <span className="text-[9px] text-muted-foreground">{acao.responsavel}</span>}
                        {acao.prazo && <span className="text-[9px] text-muted-foreground">{new Date(acao.prazo).toLocaleDateString("pt-BR")}</span>}
                        {canEditMetas && (
                          <button onClick={() => removeAcao(acao.id)} className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground"><X className="w-3 h-3" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">Nenhuma ação definida para esta meta ainda.</p>
                )}
              </PBITile>
            );
          })}

          {filteredMetas.length === 0 && (
            <PBITile>
              <p className="text-[12px] text-muted-foreground text-center py-8">Nenhuma meta encontrada.</p>
            </PBITile>
          )}
        </div>
      )}

      {/* ========== ANALYTICS TAB ========== */}
      {activeTab === "analytics" && !loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <PBITile title="Progresso por Categoria">
              {categoriasData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoriasData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 88%)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 60%)" tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 60%)" width={80} />
                    <Tooltip formatter={(value: number) => [`${value}%`, "Progresso"]} contentStyle={{ borderRadius: "4px", fontSize: 11 }} />
                    <Bar dataKey="progresso" radius={[0, 4, 4, 0]} barSize={18}>
                      {categoriasData.map((entry, i) => (
                        <Cell key={i} fill={entry.progresso >= 80 ? "hsl(152, 60%, 38%)" : entry.progresso >= 50 ? "hsl(207, 89%, 48%)" : "hsl(0, 72%, 51%)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-[12px] text-muted-foreground text-center py-12">Sem dados</p>}
            </PBITile>

            <PBITile title="Distribuição por Prioridade">
              {prioridadeData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={prioridadeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {prioridadeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, "metas"]} contentStyle={{ borderRadius: "4px", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {prioridadeData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-[11px]">
                        <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground flex-1">{item.name}</span>
                        <span className="font-bold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p className="text-[12px] text-muted-foreground text-center py-12">Sem dados</p>}
            </PBITile>

            <PBITile title="Status das Metas">
              {statusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, "metas"]} contentStyle={{ borderRadius: "4px", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {statusData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-[11px]">
                        <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground flex-1">{item.name}</span>
                        <span className="font-bold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p className="text-[12px] text-muted-foreground text-center py-12">Sem dados</p>}
            </PBITile>
          </div>
        </>
      )}

      {/* ========== RANKING TAB ========== */}
      {activeTab === "ranking" && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <PBITile title="🏆 Ranking de Metas (% Atingido)">
            <div className="space-y-2">
              {rankingMetas.map((meta, idx) => {
                const pct = Math.min(Math.round((meta.atual / meta.objetivo) * 100), 100);
                const medalColors = ["hsl(45, 100%, 51%)", "hsl(0, 0%, 75%)", "hsl(28, 87%, 55%)"];
                const pCfg = prioridadeConfig[meta.prioridade];
                return (
                  <div key={meta.id} className="flex items-center gap-3 py-2 px-3 rounded transition-colors hover:bg-white/5" style={{ borderBottom: "1px solid hsl(var(--pbi-border) / 0.3)" }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{
                      background: idx < 3 ? `${medalColors[idx]}20` : "hsl(var(--pbi-surface))",
                      color: idx < 3 ? medalColors[idx] : "hsl(var(--pbi-text-secondary))",
                      border: idx < 3 ? `2px solid ${medalColors[idx]}` : "1px solid hsl(var(--pbi-border))",
                    }}>
                      {idx + 1}º
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-foreground truncate">{meta.nome}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: pCfg.bg, color: pCfg.color }}>{pCfg.label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{meta.responsavel} · {meta.categoria}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-bold" style={{ color: pct >= 100 ? "hsl(152, 60%, 38%)" : pct >= 70 ? "hsl(207, 89%, 48%)" : pct >= 50 ? "hsl(45, 100%, 51%)" : "hsl(0, 72%, 51%)" }}>{pct}%</p>
                    </div>
                  </div>
                );
              })}
              {rankingMetas.length === 0 && <p className="text-[12px] text-muted-foreground text-center py-8">Sem metas</p>}
            </div>
          </PBITile>

          <PBITile title="Metas em Risco 🚨">
            {metasEmRisco === 0 ? (
              <div className="flex items-center justify-center py-12 gap-2">
                <CheckCircle2 className="w-5 h-5" style={{ color: "hsl(152, 60%, 38%)" }} />
                <p className="text-[12px]" style={{ color: "hsl(152, 60%, 38%)" }}>Nenhuma meta em risco!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {metas.filter((m) => (m.atual / m.objetivo) < 0.5).map((meta) => {
                  const pct = Math.round((meta.atual / meta.objetivo) * 100);
                  const metaAcoes = acoes.filter((a) => a.meta_id === meta.id);
                  return (
                    <div key={meta.id} className="p-3 rounded" style={{ background: "hsl(0, 72%, 51%, 0.06)", border: "1px solid hsl(0, 72%, 51%, 0.15)" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 shrink-0" style={{ color: "hsl(0, 72%, 51%)" }} />
                        <span className="text-[11px] font-medium text-foreground flex-1">{meta.nome}</span>
                        <span className="text-[12px] font-bold" style={{ color: "hsl(0, 72%, 51%)" }}>{pct}%</span>
                      </div>
                      {metaAcoes.length > 0 && (
                        <div className="ml-6 mt-1 space-y-0.5">
                          <p className="text-[10px] text-muted-foreground font-semibold">Ações pendentes:</p>
                          {metaAcoes.filter((a) => !a.concluida).map((a) => (
                            <p key={a.id} className="text-[10px] text-muted-foreground">• {a.descricao}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </PBITile>
        </div>
      )}

      {/* Add Action Dialog */}
      <Dialog open={acaoDialogOpen} onOpenChange={setAcaoDialogOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: "hsl(var(--pbi-surface))", border: "1px solid hsl(var(--pbi-border))" }}>
          <DialogHeader>
            <DialogTitle className="text-[14px]" style={{ color: "hsl(var(--pbi-text-primary))" }}>
              Adicionar Ação — {metas.find((m) => m.id === acaoMetaId)?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>O que precisa ser feito? *</Label>
              <Input value={newAcao.descricao} onChange={(e) => setNewAcao({ ...newAcao, descricao: e.target.value })} placeholder="Descrição da ação" className="h-8 text-[12px] border-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Responsável</Label>
                <Input value={newAcao.responsavel} onChange={(e) => setNewAcao({ ...newAcao, responsavel: e.target.value })} placeholder="Nome" className="h-8 text-[12px] border-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Prazo</Label>
                <Input type="date" value={newAcao.prazo} onChange={(e) => setNewAcao({ ...newAcao, prazo: e.target.value })} className="h-8 text-[12px] border-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }} />
              </div>
            </div>
            <Button onClick={addAcao} className="w-full h-8 text-[12px] font-semibold" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>Adicionar Ação</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
