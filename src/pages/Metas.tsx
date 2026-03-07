import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Award, Plus, X, Pencil, Check, Filter, Calendar, ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Meta {
  id: string;
  nome: string;
  atual: number;
  objetivo: number;
  unidade: string;
  cor: string;
}

const coresMeta = [
  "hsl(207, 89%, 48%)",
  "hsl(45, 100%, 51%)",
  "hsl(152, 60%, 38%)",
  "hsl(174, 62%, 47%)",
  "hsl(0, 72%, 51%)",
  "hsl(28, 87%, 55%)",
];

const initialMetas: Meta[] = [
  { id: "1", nome: "Faturamento Mensal", atual: 2100000, objetivo: 3000000, unidade: "R$", cor: coresMeta[0] },
  { id: "2", nome: "Obras Entregues no Ano", atual: 2, objetivo: 5, unidade: "obras", cor: coresMeta[1] },
  { id: "3", nome: "Unidades Vendidas", atual: 145, objetivo: 200, unidade: "unidades", cor: coresMeta[2] },
  { id: "4", nome: "Satisfação do Cliente", atual: 92, objetivo: 95, unidade: "%", cor: coresMeta[3] },
  { id: "5", nome: "Redução de Custos de Obra", atual: 18, objetivo: 25, unidade: "%", cor: coresMeta[4] },
  { id: "6", nome: "Treinamentos Segurança", atual: 30, objetivo: 40, unidade: "horas", cor: coresMeta[5] },
];

const evolucaoMensal = [
  { mes: "Jan", faturamento: 850, meta: 3000 },
  { mes: "Fev", faturamento: 1200, meta: 3000 },
  { mes: "Mar", faturamento: 1550, meta: 3000 },
  { mes: "Abr", faturamento: 1800, meta: 3000 },
  { mes: "Mai", faturamento: 1950, meta: 3000 },
  { mes: "Jun", faturamento: 2050, meta: 3000 },
  { mes: "Jul", faturamento: 2100, meta: 3000 },
];

const comparativoPeriodos = [
  { periodo: "Q1", anterior: 480, atual: 580 },
  { periodo: "Q2", anterior: 560, atual: 650 },
  { periodo: "Q3", anterior: 620, atual: 720 },
  { periodo: "Q4", anterior: 700, atual: 0 },
];

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
  const [newMeta, setNewMeta] = useState({ nome: "", atual: "", objetivo: "", unidade: "R$" });

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
    };
    setMetas((prev) => [...prev, meta]);
    setNewMeta({ nome: "", atual: "", objetivo: "", unidade: "R$" });
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

  const totalProgress = metas.reduce((acc, m) => acc + (m.atual / m.objetivo) * 100, 0) / metas.length;
  const metasAtingidas = metas.filter((m) => m.atual >= m.objetivo).length;

  const radialData = metas.slice(0, 4).map((m) => ({
    name: m.nome,
    value: Math.round((m.atual / m.objetivo) * 100),
    fill: m.cor,
  }));

  const formatVal = (v: number, unidade: string) =>
    unidade === "R$" ? `R$ ${v.toLocaleString("pt-BR")}` : `${v} ${unidade}`;

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
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary text-[12px] font-medium text-foreground hover:bg-secondary/80 transition-colors">
          Todas as Metas
          <ChevronDown className="w-3 h-3" />
        </button>

        <div className="flex-1" />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 text-[12px] bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-3 h-3 mr-1" /> Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nome da Meta</Label>
                <Input value={newMeta.nome} onChange={(e) => setNewMeta({ ...newMeta, nome: e.target.value })} placeholder="Ex: Faturamento Mensal" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Atual</Label>
                  <Input type="number" value={newMeta.atual} onChange={(e) => setNewMeta({ ...newMeta, atual: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Objetivo</Label>
                  <Input type="number" value={newMeta.objetivo} onChange={(e) => setNewMeta({ ...newMeta, objetivo: e.target.value })} placeholder="100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input value={newMeta.unidade} onChange={(e) => setNewMeta({ ...newMeta, unidade: e.target.value })} placeholder="R$, %, obras..." />
              </div>
              <Button onClick={addMeta} className="w-full">Criar Meta</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI summary row */}
      <div className="grid grid-cols-3 gap-3">
        <PBITile>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded" style={{ backgroundColor: "hsl(207, 89%, 48%, 0.12)" }}>
              <Target className="w-4 h-4" style={{ color: "hsl(207, 89%, 48%)" }} />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Total de Metas</p>
              <p className="text-2xl font-bold text-foreground">{metas.length}</p>
            </div>
          </div>
        </PBITile>
        <PBITile>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded" style={{ backgroundColor: "hsl(152, 60%, 38%, 0.12)" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "hsl(152, 60%, 38%)" }} />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Progresso Médio</p>
              <p className="text-2xl font-bold" style={{ color: "hsl(152, 60%, 38%)" }}>{Math.round(totalProgress)}%</p>
            </div>
          </div>
        </PBITile>
        <PBITile>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded" style={{ backgroundColor: "hsl(45, 100%, 51%, 0.12)" }}>
              <Award className="w-4 h-4" style={{ color: "hsl(45, 100%, 51%)" }} />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Metas Atingidas</p>
              <p className="text-2xl font-bold" style={{ color: "hsl(45, 100%, 51%)" }}>{metasAtingidas}/{metas.length}</p>
            </div>
          </div>
        </PBITile>
      </div>

      {/* Editable progress table + radial chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <PBITile title="Progresso Individual" className="lg:col-span-2">
          <div className="space-y-2.5">
            {metas.map((meta) => {
              const pct = Math.min(Math.round((meta.atual / meta.objetivo) * 100), 100);
              const isEditing = editingId === meta.id;

              return (
                <div key={meta.id} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-foreground">{meta.nome}</span>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            value={editValues.atual}
                            onChange={(e) => setEditValues({ ...editValues, atual: e.target.value })}
                            className="h-6 w-20 text-[11px] px-1.5"
                          />
                          <span className="text-[11px] text-muted-foreground">/</span>
                          <Input
                            type="number"
                            value={editValues.objetivo}
                            onChange={(e) => setEditValues({ ...editValues, objetivo: e.target.value })}
                            className="h-6 w-20 text-[11px] px-1.5"
                          />
                          <button onClick={() => saveEdit(meta.id)} className="p-1 rounded hover:bg-success/10 text-success">
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground">
                            {formatVal(meta.atual, meta.unidade)} / {formatVal(meta.objetivo, meta.unidade)}
                          </span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${meta.cor}18`,
                              color: meta.cor,
                            }}
                          >
                            {pct}%
                          </span>
                          <button onClick={() => startEdit(meta)} className="p-1 rounded hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeMeta(meta.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: meta.cor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </PBITile>

        <PBITile title="Indicadores de Desempenho">
          <ResponsiveContainer width="100%" height={260}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="85%" data={radialData} startAngle={180} endAngle={0}>
              <RadialBar
                label={{ position: "insideStart", fill: "#fff", fontSize: 10 }}
                background
                dataKey="value"
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number) => [`${value}%`, "Progresso"]} contentStyle={{ borderRadius: "4px", fontSize: 11 }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </PBITile>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <PBITile title="Evolução do Faturamento vs Meta">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 88%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 60%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 60%)" tickFormatter={(v) => `${v}k`} />
              <Tooltip formatter={(value: number) => [`R$ ${value}k`, ""]} contentStyle={{ borderRadius: "4px", fontSize: 12 }} />
              <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="faturamento" stroke="hsl(207, 89%, 48%)" strokeWidth={2.5} dot={{ r: 3 }} name="Realizado" />
              <Line type="monotone" dataKey="meta" stroke="hsl(0, 0%, 70%)" strokeWidth={2} strokeDasharray="6 4" dot={false} name="Meta" />
            </LineChart>
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
    </div>
  );
}
