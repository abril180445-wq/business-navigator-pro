import {
  DollarSign,
  Building2,
  HardHat,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const revenueData = [
  { month: "Jan", receita: 850000, despesa: 620000 },
  { month: "Fev", receita: 920000, despesa: 680000 },
  { month: "Mar", receita: 780000, despesa: 590000 },
  { month: "Abr", receita: 1100000, despesa: 750000 },
  { month: "Mai", receita: 950000, despesa: 700000 },
  { month: "Jun", receita: 1250000, despesa: 820000 },
  { month: "Jul", receita: 1400000, despesa: 890000 },
  { month: "Ago", receita: 1300000, despesa: 860000 },
  { month: "Set", receita: 1550000, despesa: 950000 },
  { month: "Out", receita: 1680000, despesa: 1020000 },
  { month: "Nov", receita: 1820000, despesa: 1100000 },
  { month: "Dez", receita: 2100000, despesa: 1250000 },
];

const obrasPorStatus = [
  { name: "Em andamento", value: 8 },
  { name: "Planejamento", value: 3 },
  { name: "Concluídas", value: 12 },
  { name: "Paralisadas", value: 1 },
];

const topEmpreendimentos = [
  { name: "Res. Vila Serena", vendas: 42 },
  { name: "Ed. Monte Carlo", vendas: 35 },
  { name: "Cond. Jardim Real", vendas: 28 },
  { name: "Res. Bela Vista", vendas: 22 },
  { name: "Ed. Torre Dourada", vendas: 18 },
];

const COLORS = [
  "hsl(220, 60%, 18%)",
  "hsl(42, 70%, 50%)",
  "hsl(42, 65%, 65%)",
  "hsl(220, 45%, 28%)",
];

const recentActivities = [
  { action: "Vistoria concluída — Res. Vila Serena, Bloco C", time: "Há 5 min" },
  { action: "Pagamento de R$ 185.000 recebido — Ed. Monte Carlo", time: "Há 15 min" },
  { action: "Ordem de serviço #OS-0234 finalizada — Fundação Bloco D", time: "Há 32 min" },
  { action: "Novo contrato assinado — Terraplanagem Lote 22", time: "Há 1h" },
  { action: "Entrega de materiais — Cimento e aço, Armazém Central", time: "Há 2h" },
  { action: "Alvará aprovado — Cond. Jardim Real, Fase 2", time: "Há 3h" },
];

const kpis = [
  {
    title: "Faturamento Mensal",
    value: "R$ 2,1M",
    change: "+14.8%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Obras Ativas",
    value: "8",
    change: "+2",
    trend: "up" as const,
    icon: Building2,
  },
  {
    title: "Unidades Vendidas",
    value: "145",
    change: "+12.3%",
    trend: "up" as const,
    icon: HardHat,
  },
  {
    title: "Clientes Ativos",
    value: "312",
    change: "+8.1%",
    trend: "up" as const,
    icon: Users,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard — San Remo Construtora</h1>
        <p className="text-sm text-muted-foreground mt-1 font-sans">
          Visão geral das obras, vendas e finanças.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="erp-card-shadow hover:erp-card-shadow-hover transition-shadow border-t-2 border-t-accent">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium font-sans">{kpi.title}</p>
                    <p className="text-2xl font-bold text-card-foreground font-sans">{kpi.value}</p>
                    <div className="flex items-center gap-1">
                      {kpi.trend === "up" ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                      )}
                      <span className={`text-xs font-medium font-sans ${kpi.trend === "up" ? "text-success" : "text-destructive"}`}>
                        {kpi.change}
                      </span>
                      <span className="text-xs text-muted-foreground font-sans">vs mês anterior</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 erp-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Faturamento vs Custos de Obra</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220, 60%, 18%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(220, 60%, 18%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(42, 70%, 50%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(42, 70%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, ""]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220, 15%, 88%)", fontSize: 13 }}
                />
                <Area type="monotone" dataKey="receita" stroke="hsl(220, 60%, 18%)" fill="url(#colorReceita)" strokeWidth={2} name="Faturamento" />
                <Area type="monotone" dataKey="despesa" stroke="hsl(42, 70%, 50%)" fill="url(#colorDespesa)" strokeWidth={2} name="Custos" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="erp-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Obras por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={obrasPorStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {obrasPorStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, "obras"]} contentStyle={{ borderRadius: "8px", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {obrasPorStatus.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-xs font-sans">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-semibold text-card-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="erp-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Empreendimentos — Unidades Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topEmpreendimentos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" width={120} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: 13 }} />
                <Bar dataKey="vendas" fill="hsl(42, 70%, 50%)" radius={[0, 4, 4, 0]} barSize={20} name="Unidades" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="erp-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground font-sans">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-sans">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
