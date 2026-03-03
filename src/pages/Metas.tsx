import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, TrendingUp, Award, Plus, X } from "lucide-react";
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
  RadialBarChart,
  RadialBar,
  Legend,
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
  "hsl(42, 70%, 50%)",
  "hsl(220, 60%, 18%)",
  "hsl(152, 60%, 38%)",
  "hsl(205, 80%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(280, 60%, 50%)",
];

const initialMetas: Meta[] = [
  { id: "1", nome: "Faturamento Mensal", atual: 720000, objetivo: 1000000, unidade: "R$", cor: coresMeta[0] },
  { id: "2", nome: "Obras Entregues", atual: 8, objetivo: 12, unidade: "obras", cor: coresMeta[1] },
  { id: "3", nome: "Novos Clientes", atual: 15, objetivo: 20, unidade: "clientes", cor: coresMeta[2] },
  { id: "4", nome: "Satisfação do Cliente", atual: 92, objetivo: 95, unidade: "%", cor: coresMeta[3] },
  { id: "5", nome: "Redução de Custos", atual: 18, objetivo: 25, unidade: "%", cor: coresMeta[4] },
  { id: "6", nome: "Treinamentos", atual: 30, objetivo: 40, unidade: "horas", cor: coresMeta[5] },
];

const evolucaoMensal = [
  { mes: "Jan", faturamento: 480, meta: 1000 },
  { mes: "Fev", faturamento: 520, meta: 1000 },
  { mes: "Mar", faturamento: 580, meta: 1000 },
  { mes: "Abr", faturamento: 610, meta: 1000 },
  { mes: "Mai", faturamento: 650, meta: 1000 },
  { mes: "Jun", faturamento: 690, meta: 1000 },
  { mes: "Jul", faturamento: 720, meta: 1000 },
];

const comparativoPeriodos = [
  { periodo: "Q1", anterior: 480, atual: 580 },
  { periodo: "Q2", anterior: 560, atual: 650 },
  { periodo: "Q3", anterior: 620, atual: 720 },
  { periodo: "Q4", anterior: 700, atual: 0 },
];

export default function Metas() {
  const { toast } = useToast();
  const [metas, setMetas] = useState<Meta[]>(initialMetas);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const removeMeta = (id: string) => {
    setMetas((prev) => prev.filter((m) => m.id !== id));
  };

  const totalProgress = metas.reduce((acc, m) => acc + (m.atual / m.objetivo) * 100, 0) / metas.length;

  const radialData = metas.slice(0, 4).map((m) => ({
    name: m.nome,
    value: Math.round((m.atual / m.objetivo) * 100),
    fill: m.cor,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Acompanhamento de Metas</h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">Monitore o progresso dos objetivos da San Remo</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-gold-dark font-sans font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="font-sans">Nome da Meta</Label>
                <Input value={newMeta.nome} onChange={(e) => setNewMeta({ ...newMeta, nome: e.target.value })} placeholder="Ex: Faturamento Mensal" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-sans">Valor Atual</Label>
                  <Input type="number" value={newMeta.atual} onChange={(e) => setNewMeta({ ...newMeta, atual: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Objetivo</Label>
                  <Input type="number" value={newMeta.objetivo} onChange={(e) => setNewMeta({ ...newMeta, objetivo: e.target.value })} placeholder="100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-sans">Unidade</Label>
                <Input value={newMeta.unidade} onChange={(e) => setNewMeta({ ...newMeta, unidade: e.target.value })} placeholder="R$, %, obras..." />
              </div>
              <Button onClick={addMeta} className="w-full bg-accent text-accent-foreground hover:bg-gold-dark font-sans font-semibold">
                Criar Meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo geral */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="erp-card-shadow border-t-2 border-t-accent">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-sans">Total de Metas</p>
              <p className="text-2xl font-bold text-foreground font-sans">{metas.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="erp-card-shadow border-t-2 border-t-success">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-sans">Progresso Médio</p>
              <p className="text-2xl font-bold text-foreground font-sans">{Math.round(totalProgress)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="erp-card-shadow border-t-2 border-t-primary">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-sans">Metas Atingidas</p>
              <p className="text-2xl font-bold text-foreground font-sans">
                {metas.filter((m) => m.atual >= m.objetivo).length}/{metas.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso de cada meta */}
      <Card className="erp-card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Progresso Individual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {metas.map((meta) => {
              const pct = Math.min(Math.round((meta.atual / meta.objetivo) * 100), 100);
              const formatVal = (v: number) =>
                meta.unidade === "R$"
                  ? `R$ ${v.toLocaleString("pt-BR")}`
                  : `${v} ${meta.unidade}`;
              return (
                <div key={meta.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground font-sans">{meta.nome}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-sans">
                        {formatVal(meta.atual)} / {formatVal(meta.objetivo)}
                      </span>
                      <span
                        className={`text-xs font-bold font-sans px-1.5 py-0.5 rounded ${
                          pct >= 100
                            ? "bg-success/15 text-success"
                            : pct >= 70
                            ? "bg-accent/15 text-accent"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {pct}%
                      </span>
                      <button onClick={() => removeMeta(meta.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2.5" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Evolução ao longo do tempo */}
        <Card className="erp-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Evolução do Faturamento vs Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" tickFormatter={(v) => `${v}k`} />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value}k`, ""]}
                  contentStyle={{ borderRadius: "8px", fontSize: 13 }}
                />
                <Line type="monotone" dataKey="faturamento" stroke="hsl(42, 70%, 50%)" strokeWidth={2.5} dot={{ r: 4 }} name="Realizado" />
                <Line type="monotone" dataKey="meta" stroke="hsl(220, 60%, 18%)" strokeWidth={2} strokeDasharray="6 4" dot={false} name="Meta" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Comparação entre períodos */}
        <Card className="erp-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Comparação entre Períodos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comparativoPeriodos}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="periodo" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" tickFormatter={(v) => `${v}k`} />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value}k`, ""]}
                  contentStyle={{ borderRadius: "8px", fontSize: 13 }}
                />
                <Bar dataKey="anterior" fill="hsl(220, 45%, 28%)" radius={[4, 4, 0, 0]} barSize={28} name="Ano Anterior" />
                <Bar dataKey="atual" fill="hsl(42, 70%, 50%)" radius={[4, 4, 0, 0]} barSize={28} name="Ano Atual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores radiais */}
      <Card className="erp-card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Indicadores de Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
              <RadialBar
                label={{ position: "insideStart", fill: "#fff", fontSize: 11 }}
                background
                dataKey="value"
              />
              <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
              <Tooltip formatter={(value: number) => [`${value}%`, "Progresso"]} />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
