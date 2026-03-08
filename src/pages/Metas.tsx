import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Target, TrendingUp, Award, Plus, X, Pencil, Check, Filter, Calendar,
  ChevronDown, AlertTriangle, Zap, BarChart3, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, XCircle, Flame, Trophy,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, RadialBarChart, RadialBar, PieChart, Pie, Cell,
  AreaChart, Area, ComposedChart, Treemap,
} from "recharts";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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

const coresMeta = [
  "hsl(207, 89%, 48%)", "hsl(45, 100%, 51%)", "hsl(152, 60%, 38%)",
  "hsl(174, 62%, 47%)", "hsl(0, 72%, 51%)", "hsl(28, 87%, 55%)",
  "hsl(270, 60%, 55%)", "hsl(330, 70%, 50%)",
];

const categorias = ["Financeiro", "Vendas", "Operacional", "Qualidade", "RH", "Engenharia"];
const responsaveis = ["Carlos Silva", "Ana Souza", "Pedro Lima", "Maria Santos", "João Costa"];

const initialMetas: Meta[] = [
  { id: "1", nome: "Faturamento Mensal", atual: 2100000, objetivo: 3000000, unidade: "R$", cor: coresMeta[0], categoria: "Financeiro", responsavel: "Carlos Silva", prazo: "2025-12-31", prioridade: "alta" },
  { id: "2", nome: "Obras Entregues no Ano", atual: 2, objetivo: 5, unidade: "obras", cor: coresMeta[1], categoria: "Operacional", responsavel: "Pedro Lima", prazo: "2025-12-31", prioridade: "alta" },
  { id: "3", nome: "Unidades Vendidas", atual: 145, objetivo: 200, unidade: "unidades", cor: coresMeta[2], categoria: "Vendas", responsavel: "Ana Souza", prazo: "2025-12-31", prioridade: "alta" },
  { id: "4", nome: "Satisfação do Cliente", atual: 92, objetivo: 95, unidade: "%", cor: coresMeta[3], categoria: "Qualidade", responsavel: "Maria Santos", prazo: "2025-06-30", prioridade: "media" },
  { id: "5", nome: "Redução de Custos", atual: 18, objetivo: 25, unidade: "%", cor: coresMeta[4], categoria: "Financeiro", responsavel: "Carlos Silva", prazo: "2025-12-31", prioridade: "media" },
  { id: "6", nome: "Treinamentos Segurança", atual: 30, objetivo: 40, unidade: "horas", cor: coresMeta[5], categoria: "RH", responsavel: "João Costa", prazo: "2025-09-30", prioridade: "baixa" },
  { id: "7", nome: "Margem de Lucro", atual: 22, objetivo: 30, unidade: "%", cor: coresMeta[6], categoria: "Financeiro", responsavel: "Carlos Silva", prazo: "2025-12-31", prioridade: "alta" },
  { id: "8", nome: "Novos Contratos", atual: 8, objetivo: 12, unidade: "contratos", cor: coresMeta[7], categoria: "Vendas", responsavel: "Ana Souza", prazo: "2025-12-31", prioridade: "media" },
];

const evolucaoMensal = [
  { mes: "Jan", realizado: 850, meta: 3000, vendas: 8, custos: 620 },
  { mes: "Fev", realizado: 1200, meta: 3000, vendas: 12, custos: 680 },
  { mes: "Mar", realizado: 1550, meta: 3000, vendas: 15, custos: 590 },
  { mes: "Abr", realizado: 1800, meta: 3000, vendas: 18, custos: 750 },
  { mes: "Mai", realizado: 1950, meta: 3000, vendas: 20, custos: 700 },
  { mes: "Jun", realizado: 2050, meta: 3000, vendas: 22, custos: 820 },
  { mes: "Jul", realizado: 2100, meta: 3000, vendas: 25, custos: 890 },
  { mes: "Ago", realizado: 2300, meta: 3000, vendas: 28, custos: 860 },
  { mes: "Set", realizado: 2500, meta: 3000, vendas: 30, custos: 950 },
];

const comparativoPeriodos = [
  { periodo: "Q1", anterior: 480, atual: 580 },
  { periodo: "Q2", anterior: 560, atual: 650 },
  { periodo: "Q3", anterior: 620, atual: 720 },
  { periodo: "Q4", anterior: 700, atual: 0 },
];

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
  const [metas, setMetas] = useState<Meta[]>(initialMetas);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ atual: string; objetivo: string }>({ atual: "", objetivo: "" });
  const [newMeta, setNewMeta] = useState({ nome: "", atual: "", objetivo: "", unidade: "R$", categoria: "Financeiro", responsavel: "Carlos Silva", prioridade: "media" as Meta["prioridade"] });
  const [activeTab, setActiveTab] = useState<"editor" | "analytics" | "ranking">("editor");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroPrioridade, setFiltroPrioridade] = useState("Todas");

  const addMeta = () => {
    if (!newMeta.nome || !newMeta.objetivo) {
      toast({ title: "Preencha nome e objetivo", variant: "destructive" });
      return;
    }
    const meta: Meta = {
      id: Date.now().toString(),
      nome: newMeta.nome,
      atual: parseFloat(newMeta.atual) || 0,
      objetivo: parseFloat(newMeta.objetivo),
      unidade: newMeta.unidade,
      cor: coresMeta[metas.length % coresMeta.length],
      categoria: newMeta.categoria,
      responsavel: newMeta.responsavel,
      prazo: "2025-12-31",
      prioridade: newMeta.prioridade,
    };
    setMetas((prev) => [...prev, meta]);
    setNewMeta({ nome: "", atual: "", objetivo: "", unidade: "R$", categoria: "Financeiro", responsavel: "Carlos Silva", prioridade: "media" });
    setDialogOpen(false);
    toast({ title: "Meta criada!", description: meta.nome });
  };

  const startEdit = (meta: Meta) => {
    setEditingId(meta.id);
    setEditValues({ atual: meta.atual.toString(), objetivo: meta.objetivo.toString() });
  };

  const saveEdit = (id: string) => {
    setMetas((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, atual: parseFloat(editValues.atual) || 0, objetivo: parseFloat(editValues.objetivo) || m.objetivo }
          : m
      )
    );
    setEditingId(null);
    toast({ title: "Meta atualizada!" });
  };

  const removeMeta = (id: string) => {
    setMetas((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Meta removida" });
  };

  // Filtered metas
  const filteredMetas = metas.filter((m) => {
    if (filtroCategoria !== "Todas" && m.categoria !== filtroCategoria) return false;
    if (filtroPrioridade !== "Todas" && m.prioridade !== filtroPrioridade) return false;
    return true;
  });

  // Analytics
  const totalProgress = metas.reduce((acc, m) => acc + (m.atual / m.objetivo) * 100, 0) / metas.length;
  const metasAtingidas = metas.filter((m) => m.atual >= m.objetivo).length;
  const metasEmRisco = metas.filter((m) => (m.atual / m.objetivo) < 0.5).length;
  const metasNoPrazo = metas.filter((m) => (m.atual / m.objetivo) >= 0.7).length;

  // Category breakdown
  const categoriasData = categorias.map((cat) => {
    const catMetas = metas.filter((m) => m.categoria === cat);
    if (catMetas.length === 0) return null;
    const avg = catMetas.reduce((a, m) => a + (m.atual / m.objetivo) * 100, 0) / catMetas.length;
    return { name: cat, progresso: Math.round(avg), count: catMetas.length };
  }).filter(Boolean) as { name: string; progresso: number; count: number }[];

  // Responsible breakdown
  const responsaveisData = responsaveis.map((resp) => {
    const respMetas = metas.filter((m) => m.responsavel === resp);
    if (respMetas.length === 0) return null;
    const avg = respMetas.reduce((a, m) => a + (m.atual / m.objetivo) * 100, 0) / respMetas.length;
    const atingidas = respMetas.filter((m) => m.atual >= m.objetivo).length;
    return { name: resp.split(" ")[0], progresso: Math.round(avg), total: respMetas.length, atingidas };
  }).filter(Boolean) as { name: string; progresso: number; total: number; atingidas: number }[];

  // Priority pie
  const prioridadeData = [
    { name: "Alta", value: metas.filter((m) => m.prioridade === "alta").length, color: "hsl(0, 72%, 51%)" },
    { name: "Média", value: metas.filter((m) => m.prioridade === "media").length, color: "hsl(45, 100%, 51%)" },
    { name: "Baixa", value: metas.filter((m) => m.prioridade === "baixa").length, color: "hsl(207, 89%, 48%)" },
  ].filter((d) => d.value > 0);

  // Status pie
  const statusData = [
    { name: "Atingida", value: metasAtingidas, color: "hsl(152, 60%, 38%)" },
    { name: "No Prazo", value: metasNoPrazo - metasAtingidas, color: "hsl(207, 89%, 48%)" },
    { name: "Em Risco", value: metasEmRisco, color: "hsl(0, 72%, 51%)" },
    { name: "Em Andamento", value: metas.length - metasAtingidas - metasEmRisco - (metasNoPrazo - metasAtingidas), color: "hsl(45, 100%, 51%)" },
  ].filter((d) => d.value > 0);

  const radialData = metas.slice(0, 6).map((m) => ({
    name: m.nome.length > 18 ? m.nome.slice(0, 18) + "…" : m.nome,
    value: Math.round((m.atual / m.objetivo) * 100),
    fill: m.cor,
  }));

  // Ranking sorted by %
  const rankingMetas = [...metas].sort((a, b) => (b.atual / b.objetivo) - (a.atual / a.objetivo));

  const formatVal = (v: number, unidade: string) =>
    unidade === "R$" ? `R$ ${v.toLocaleString("pt-BR")}` : `${v} ${unidade}`;

  const tabs = [
    { key: "editor" as const, label: "Editor de Metas", icon: Pencil },
    { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { key: "ranking" as const, label: "Ranking & Status", icon: Trophy },
  ];

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="pbi-filter-bar rounded-sm px-4 py-2.5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">Filtros</span>
        </div>
        <div className="h-4 w-px bg-border" />

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary text-[12px] font-medium text-foreground hover:bg-secondary/80 transition-colors">
          <Calendar className="w-3 h-3" />
          Ano: 2025
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Categoria filter */}
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-3 py-1.5 rounded bg-secondary text-[12px] font-medium text-foreground border-none outline-none cursor-pointer"
        >
          <option value="Todas">Todas Categorias</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Prioridade filter */}
        <select
          value={filtroPrioridade}
          onChange={(e) => setFiltroPrioridade(e.target.value)}
          className="px-3 py-1.5 rounded bg-secondary text-[12px] font-medium text-foreground border-none outline-none cursor-pointer"
        >
          <option value="Todas">Todas Prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>

        <div className="flex-1" />

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
                  <Input value={newMeta.unidade} onChange={(e) => setNewMeta({ ...newMeta, unidade: e.target.value })} placeholder="R$, %" className="h-8 text-[12px] border-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }} />
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
                  <select value={newMeta.responsavel} onChange={(e) => setNewMeta({ ...newMeta, responsavel: e.target.value })} className="w-full h-8 rounded text-[12px] px-2 border-none outline-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }}>
                    {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
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
              <Button onClick={addMeta} className="w-full h-8 text-[12px] font-semibold" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>
                Criar Meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 p-1 rounded" style={{ background: "hsl(var(--pbi-surface))", border: "1px solid hsl(var(--pbi-border))" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded text-[12px] font-medium transition-all"
              style={{
                background: isActive ? "hsl(var(--pbi-yellow))" : "transparent",
                color: isActive ? "hsl(var(--pbi-dark))" : "hsl(var(--pbi-text-secondary))",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* KPI summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <PBITile>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded" style={{ backgroundColor: "hsl(207, 89%, 48%, 0.12)" }}>
              <Target className="w-4 h-4" style={{ color: "hsl(207, 89%, 48%)" }} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Metas</p>
              <p className="text-xl font-bold text-foreground">{metas.length}</p>
            </div>
          </div>
        </PBITile>
        <PBITile>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded" style={{ backgroundColor: "hsl(152, 60%, 38%, 0.12)" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "hsl(152, 60%, 38%)" }} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Progresso Médio</p>
              <p className="text-xl font-bold" style={{ color: "hsl(152, 60%, 38%)" }}>{Math.round(totalProgress)}%</p>
            </div>
          </div>
        </PBITile>
        <PBITile>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded" style={{ backgroundColor: "hsl(45, 100%, 51%, 0.12)" }}>
              <Award className="w-4 h-4" style={{ color: "hsl(45, 100%, 51%)" }} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Atingidas</p>
              <p className="text-xl font-bold" style={{ color: "hsl(45, 100%, 51%)" }}>{metasAtingidas}/{metas.length}</p>
            </div>
          </div>
        </PBITile>
        <PBITile>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded" style={{ backgroundColor: "hsl(0, 72%, 51%, 0.12)" }}>
              <AlertTriangle className="w-4 h-4" style={{ color: "hsl(0, 72%, 51%)" }} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Em Risco</p>
              <p className="text-xl font-bold" style={{ color: "hsl(0, 72%, 51%)" }}>{metasEmRisco}</p>
            </div>
          </div>
        </PBITile>
        <PBITile>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded" style={{ backgroundColor: "hsl(174, 62%, 47%, 0.12)" }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(174, 62%, 47%)" }} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">No Prazo</p>
              <p className="text-xl font-bold" style={{ color: "hsl(174, 62%, 47%)" }}>{metasNoPrazo}</p>
            </div>
          </div>
        </PBITile>
      </div>

      {/* =================== EDITOR TAB =================== */}
      {activeTab === "editor" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <PBITile title="Progresso Individual" className="lg:col-span-2">
              <div className="space-y-2.5">
                {filteredMetas.map((meta) => {
                  const pct = Math.min(Math.round((meta.atual / meta.objetivo) * 100), 100);
                  const isEditing = editingId === meta.id;
                  const pCfg = prioridadeConfig[meta.prioridade];

                  return (
                    <div key={meta.id} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-foreground">{meta.nome}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: pCfg.bg, color: pCfg.color }}>{pCfg.label}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{meta.categoria}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <Input type="number" value={editValues.atual} onChange={(e) => setEditValues({ ...editValues, atual: e.target.value })} className="h-6 w-20 text-[11px] px-1.5" />
                              <span className="text-[11px] text-muted-foreground">/</span>
                              <Input type="number" value={editValues.objetivo} onChange={(e) => setEditValues({ ...editValues, objetivo: e.target.value })} className="h-6 w-20 text-[11px] px-1.5" />
                              <button onClick={() => saveEdit(meta.id)} className="p-1 rounded hover:bg-success/10 text-success"><Check className="w-3 h-3" /></button>
                              <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X className="w-3 h-3" /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground">{meta.responsavel.split(" ")[0]}</span>
                              <span className="text-[11px] text-muted-foreground">{formatVal(meta.atual, meta.unidade)} / {formatVal(meta.objetivo, meta.unidade)}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${meta.cor}18`, color: meta.cor }}>{pct}%</span>
                              <button onClick={() => startEdit(meta)} className="p-1 rounded hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="w-3 h-3" /></button>
                              <button onClick={() => removeMeta(meta.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: meta.cor }} />
                      </div>
                    </div>
                  );
                })}
                {filteredMetas.length === 0 && (
                  <p className="text-[12px] text-muted-foreground text-center py-8">Nenhuma meta encontrada com os filtros selecionados</p>
                )}
              </div>
            </PBITile>

            <PBITile title="Gauges de Desempenho">
              <ResponsiveContainer width="100%" height={280}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="15%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
                  <RadialBar label={{ position: "insideStart", fill: "#fff", fontSize: 9 }} background dataKey="value" />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Progresso"]} contentStyle={{ borderRadius: "4px", fontSize: 11 }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </PBITile>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <PBITile title="Evolução Faturamento vs Meta">
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={evolucaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 88%)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 60%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 60%)" tickFormatter={(v) => `${v}k`} />
                  <Tooltip formatter={(value: number) => [`R$ ${value}k`, ""]} contentStyle={{ borderRadius: "4px", fontSize: 12 }} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="realizado" fill="hsl(207, 89%, 48%, 0.15)" stroke="hsl(207, 89%, 48%)" strokeWidth={2} name="Realizado" />
                  <Line type="monotone" dataKey="meta" stroke="hsl(0, 0%, 70%)" strokeWidth={2} strokeDasharray="6 4" dot={false} name="Meta" />
                </ComposedChart>
              </ResponsiveContainer>
            </PBITile>

            <PBITile title="Comparação entre Períodos">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={comparativoPeriodos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 88%)" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 60%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 60%)" tickFormatter={(v) => `${v}k`} />
                  <Tooltip formatter={(value: number) => [`R$ ${value}k`, ""]} contentStyle={{ borderRadius: "4px", fontSize: 12 }} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="anterior" fill="hsl(0, 0%, 75%)" radius={[2, 2, 0, 0]} barSize={22} name="Ano Anterior" />
                  <Bar dataKey="atual" fill="hsl(207, 89%, 48%)" radius={[2, 2, 0, 0]} barSize={22} name="Ano Atual" />
                </BarChart>
              </ResponsiveContainer>
            </PBITile>
          </div>
        </>
      )}

      {/* =================== ANALYTICS TAB =================== */}
      {activeTab === "analytics" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <PBITile title="Progresso por Categoria">
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
            </PBITile>

            <PBITile title="Distribuição por Prioridade">
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
            </PBITile>

            <PBITile title="Status das Metas">
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
            </PBITile>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <PBITile title="Desempenho por Responsável">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={responsaveisData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 88%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 60%)" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 60%)" tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number, name: string) => [name === "progresso" ? `${value}%` : value, name === "progresso" ? "Progresso" : "Metas"]} contentStyle={{ borderRadius: "4px", fontSize: 11 }} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="progresso" fill="hsl(207, 89%, 48%)" radius={[4, 4, 0, 0]} barSize={24} name="Progresso %" />
                  <Bar dataKey="total" fill="hsl(45, 100%, 51%)" radius={[4, 4, 0, 0]} barSize={24} name="Total Metas" />
                </BarChart>
              </ResponsiveContainer>
            </PBITile>

            <PBITile title="Evolução Vendas Mensal">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={evolucaoMensal}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 88%)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 60%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 60%)" />
                  <Tooltip contentStyle={{ borderRadius: "4px", fontSize: 12 }} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="vendas" stroke="hsl(174, 62%, 47%)" fill="url(#colorVendas)" strokeWidth={2} name="Vendas" />
                  <Area type="monotone" dataKey="custos" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%, 0.08)" strokeWidth={2} name="Custos (k)" />
                </AreaChart>
              </ResponsiveContainer>
            </PBITile>
          </div>
        </>
      )}

      {/* =================== RANKING TAB =================== */}
      {activeTab === "ranking" && (
        <>
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
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{meta.responsavel}</span>
                          <span className="text-[10px] text-muted-foreground">· {meta.categoria}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-bold" style={{ color: pct >= 100 ? "hsl(152, 60%, 38%)" : pct >= 70 ? "hsl(207, 89%, 48%)" : pct >= 50 ? "hsl(45, 100%, 51%)" : "hsl(0, 72%, 51%)" }}>{pct}%</p>
                        <p className="text-[9px] text-muted-foreground">{formatVal(meta.atual, meta.unidade)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PBITile>

            <div className="space-y-3">
              <PBITile title="Detalhamento por Responsável">
                <div className="space-y-3">
                  {responsaveisData.map((resp) => {
                    const barColor = resp.progresso >= 80 ? "hsl(152, 60%, 38%)" : resp.progresso >= 50 ? "hsl(207, 89%, 48%)" : "hsl(0, 72%, 51%)";
                    return (
                      <div key={resp.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: `${barColor}20`, color: barColor }}>
                              {resp.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[11px] font-medium text-foreground">{resp.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">{resp.atingidas}/{resp.total} metas</span>
                            <span className="text-[11px] font-bold" style={{ color: barColor }}>{resp.progresso}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${resp.progresso}%`, backgroundColor: barColor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PBITile>

              <PBITile title="Metas em Risco 🚨">
                {metas.filter((m) => (m.atual / m.objetivo) < 0.5).length === 0 ? (
                  <div className="flex items-center justify-center py-6 gap-2">
                    <CheckCircle2 className="w-5 h-5" style={{ color: "hsl(152, 60%, 38%)" }} />
                    <p className="text-[12px]" style={{ color: "hsl(152, 60%, 38%)" }}>Nenhuma meta em risco!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {metas.filter((m) => (m.atual / m.objetivo) < 0.5).map((meta) => {
                      const pct = Math.round((meta.atual / meta.objetivo) * 100);
                      return (
                        <div key={meta.id} className="flex items-center gap-3 p-2 rounded" style={{ background: "hsl(0, 72%, 51%, 0.06)", border: "1px solid hsl(0, 72%, 51%, 0.15)" }}>
                          <XCircle className="w-4 h-4 shrink-0" style={{ color: "hsl(0, 72%, 51%)" }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-foreground truncate">{meta.nome}</p>
                            <p className="text-[10px] text-muted-foreground">{meta.responsavel} · {meta.categoria}</p>
                          </div>
                          <span className="text-[12px] font-bold" style={{ color: "hsl(0, 72%, 51%)" }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </PBITile>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
