import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
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
  { month: "Jan", receita: 45000, despesa: 32000 },
  { month: "Fev", receita: 52000, despesa: 34000 },
  { month: "Mar", receita: 48000, despesa: 31000 },
  { month: "Abr", receita: 61000, despesa: 37000 },
  { month: "Mai", receita: 55000, despesa: 35000 },
  { month: "Jun", receita: 67000, despesa: 38000 },
  { month: "Jul", receita: 72000, despesa: 41000 },
  { month: "Ago", receita: 69000, despesa: 39000 },
  { month: "Set", receita: 78000, despesa: 43000 },
  { month: "Out", receita: 82000, despesa: 45000 },
  { month: "Nov", receita: 88000, despesa: 47000 },
  { month: "Dez", receita: 95000, despesa: 50000 },
];

const ordersByModule = [
  { name: "Vendas", value: 340 },
  { name: "Compras", value: 210 },
  { name: "Manufatura", value: 125 },
  { name: "Projetos", value: 85 },
];

const topProducts = [
  { name: "Produto A", vendas: 1250 },
  { name: "Produto B", vendas: 980 },
  { name: "Produto C", vendas: 870 },
  { name: "Produto D", vendas: 650 },
  { name: "Produto E", vendas: 520 },
];

const COLORS = [
  "hsl(210, 8%, 25%)",
  "hsl(210, 6%, 40%)",
  "hsl(185, 55%, 42%)",
  "hsl(210, 5%, 55%)",
];

const recentActivities = [
  { action: "Pedido de Venda #PV-2024-0891 criado", time: "Há 5 min", type: "sale" },
  { action: "Pagamento de R$ 12.500 recebido", time: "Há 15 min", type: "payment" },
  { action: "Ordem de Produção #OP-0234 finalizada", time: "Há 32 min", type: "production" },
  { action: "Novo fornecedor cadastrado: Tech Parts Ltda", time: "Há 1h", type: "supplier" },
  { action: "Inventário do Armazém Central atualizado", time: "Há 2h", type: "stock" },
  { action: "Nota Fiscal #NF-8821 emitida", time: "Há 3h", type: "invoice" },
];

const kpis = [
  {
    title: "Receita Mensal",
    value: "R$ 95.420",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
    color: "text-success",
  },
  {
    title: "Pedidos Ativos",
    value: "342",
    change: "+8.2%",
    trend: "up" as const,
    icon: ShoppingCart,
    color: "text-info",
  },
  {
    title: "Itens em Estoque",
    value: "1.284",
    change: "-3.1%",
    trend: "down" as const,
    icon: Package,
    color: "text-warning",
  },
  {
    title: "Clientes Ativos",
    value: "856",
    change: "+5.7%",
    trend: "up" as const,
    icon: Users,
    color: "text-primary",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral — Gabi ERP</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="erp-card-shadow hover:erp-card-shadow-hover transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                    <p className="text-2xl font-bold text-card-foreground">{kpi.value}</p>
                    <div className="flex items-center gap-1">
                      {kpi.trend === "up" ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                      )}
                      <span className={`text-xs font-medium ${kpi.trend === "up" ? "text-success" : "text-destructive"}`}>
                        {kpi.change}
                      </span>
                      <span className="text-xs text-muted-foreground">vs mês anterior</span>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-lg bg-muted ${kpi.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 erp-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Receita vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210, 8%, 25%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(210, 8%, 25%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210, 6%, 45%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(210, 6%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 6%, 86%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(210, 4%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(210, 4%, 46%)" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, ""]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid hsl(210, 6%, 86%)", fontSize: 13 }}
                />
                <Area type="monotone" dataKey="receita" stroke="hsl(210, 8%, 25%)" fill="url(#colorReceita)" strokeWidth={2} name="Receita" />
                <Area type="monotone" dataKey="despesa" stroke="hsl(210, 6%, 45%)" fill="url(#colorDespesa)" strokeWidth={2} name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="erp-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Pedidos por Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={ordersByModule} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {ordersByModule.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, "pedidos"]} contentStyle={{ borderRadius: "8px", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ordersByModule.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-semibold text-card-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card className="erp-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 6%, 86%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(210, 4%, 46%)" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(210, 4%, 46%)" width={80} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: 13 }} />
                <Bar dataKey="vendas" fill="hsl(210, 8%, 30%)" radius={[0, 4, 4, 0]} barSize={20} name="Vendas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="erp-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
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
