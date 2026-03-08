import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import {
  DollarSign,
  Building2,
  HardHat,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Calendar,
  Filter,
  ChevronDown,
  Rocket,
  Construction,
  Landmark,
  FolderKanban,
  Headphones,
  Truck,
} from "lucide-react";
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
  LineChart,
  Line,
  Legend,
  ComposedChart,
} from "recharts";

const revenueData = [
  { month: "Jan", receita: 850, custo: 620 },
  { month: "Fev", receita: 920, custo: 680 },
  { month: "Mar", receita: 780, custo: 590 },
  { month: "Abr", receita: 1100, custo: 750 },
  { month: "Mai", receita: 950, custo: 700 },
  { month: "Jun", receita: 1250, custo: 820 },
  { month: "Jul", receita: 1400, custo: 890 },
  { month: "Ago", receita: 1300, custo: 860 },
  { month: "Set", receita: 1550, custo: 950 },
  { month: "Out", receita: 1680, custo: 1020 },
  { month: "Nov", receita: 1820, custo: 1100 },
  { month: "Dez", receita: 2100, custo: 1250 },
];

const obrasPorStatus = [
  { name: "Em andamento", value: 8, color: "hsl(207, 89%, 48%)" },
  { name: "Planejamento", value: 3, color: "hsl(45, 100%, 51%)" },
  { name: "Concluídas", value: 12, color: "hsl(152, 60%, 38%)" },
  { name: "Paralisadas", value: 1, color: "hsl(0, 72%, 51%)" },
];

const topEmpreendimentos = [
  { name: "Res. Vila Serena", vendas: 42, meta: 50 },
  { name: "Ed. Monte Carlo", vendas: 35, meta: 40 },
  { name: "Cond. Jardim Real", vendas: 28, meta: 35 },
  { name: "Res. Bela Vista", vendas: 22, meta: 30 },
  { name: "Ed. Torre Dourada", vendas: 18, meta: 25 },
];

const progressoObras = [
  { obra: "Vila Serena", progresso: 78 },
  { obra: "Monte Carlo", progresso: 45 },
  { obra: "Jardim Real", progresso: 92 },
  { obra: "Bela Vista", progresso: 33 },
  { obra: "Torre Dourada", progresso: 15 },
];

const vendasMensais = [
  { month: "Jan", unidades: 8 },
  { month: "Fev", unidades: 12 },
  { month: "Mar", unidades: 10 },
  { month: "Abr", unidades: 15 },
  { month: "Mai", unidades: 11 },
  { month: "Jun", unidades: 18 },
  { month: "Jul", unidades: 22 },
  { month: "Ago", unidades: 19 },
  { month: "Set", unidades: 25 },
  { month: "Out", unidades: 28 },
  { month: "Nov", unidades: 30 },
  { month: "Dez", unidades: 35 },
];

const kpis = [
  { title: "Faturamento", value: "R$ 2,1M", change: "+14.8%", trend: "up" as const, icon: DollarSign, color: "hsl(207, 89%, 48%)" },
  { title: "Obras Ativas", value: "8", change: "+2", trend: "up" as const, icon: Building2, color: "hsl(45, 100%, 51%)" },
  { title: "Unidades Vendidas", value: "145", change: "+12.3%", trend: "up" as const, icon: HardHat, color: "hsl(174, 62%, 47%)" },
  { title: "Clientes Ativos", value: "312", change: "+8.1%", trend: "up" as const, icon: Users, color: "hsl(28, 87%, 55%)" },
];

const PBITile = ({ children, title, className = "" }: { children: React.ReactNode; title?: string; className?: string }) => (
  <div className={`pbi-tile ${className}`}>
    {title && (
      <h3 className="text-[13px] font-semibold text-foreground mb-3">{title}</h3>
    )}
    {children}
  </div>
);

const pendingModules = [
  { title: "Financeiro", description: "Faturamento, Contas a Pagar/Receber, Impostos", icon: DollarSign, color: "hsl(207, 89%, 48%)" },
  { title: "Obras", description: "Empreendimentos, Contratos, Materiais, Clientes", icon: Building2, color: "hsl(45, 100%, 51%)" },
  { title: "Engenharia", description: "Ordens de Serviço, Cronogramas, Planejamento", icon: HardHat, color: "hsl(28, 87%, 55%)" },
  { title: "Patrimônio", description: "Cadastro de bens, Depreciação, Inventário", icon: Landmark, color: "hsl(174, 62%, 47%)" },
  { title: "Projetos", description: "Kanban, Cronograma, Alocação de recursos", icon: FolderKanban, color: "hsl(262, 60%, 55%)" },
  { title: "RH", description: "Funcionários, Ponto, Férias, Folha de Pagamento", icon: Users, color: "hsl(152, 60%, 38%)" },
  { title: "Suporte", description: "Chamados, SLA, Base de conhecimento", icon: Headphones, color: "hsl(340, 65%, 50%)" },
  { title: "Logística", description: "Entregas, Frota, Rastreamento, Roteirização", icon: Truck, color: "hsl(15, 75%, 50%)" },
];

export default function Dashboard() {
  const [periodo, setPeriodo] = useState("2025");
  const { userRole, profile, isAdmin } = useAuth();
  const { theme } = useTheme();
  const isNormal = userRole === "normal";

  // Theme-adaptive colors
  const gridColor = theme === "dark" ? "hsl(0, 0%, 25%)" : "hsl(0, 0%, 88%)";
  const axisColor = theme === "dark" ? "hsl(0, 0%, 45%)" : "hsl(0, 0%, 60%)";
  const tooltipBg = theme === "dark" ? "hsl(0, 0%, 18%)" : "#fff";
  const tooltipBorder = theme === "dark" ? "hsl(0, 0%, 30%)" : "hsl(0, 0%, 88%)";
  const tooltipStyle = { borderRadius: "4px", border: `1px solid ${tooltipBorder}`, fontSize: 12, backgroundColor: tooltipBg, color: theme === "dark" ? "#e8e8e8" : "#222" };

  return (
    <div className="space-y-3">
      {/* Welcome banner for normal users */}
      {isNormal && (
        <div className="pbi-tile" style={{ borderLeft: "3px solid hsl(207, 89%, 48%)" }}>
          <p className="text-[12px] font-medium" style={{ color: "hsl(var(--pbi-text-primary))" }}>
            Bem-vindo, <strong style={{ color: "hsl(var(--pbi-yellow))" }}>{profile?.full_name}</strong>! 
            Você está no modo <strong>visualização</strong>. Para editar metas ou gerar relatórios, solicite acesso ao administrador.
          </p>
        </div>
      )}
      {/* Filter bar — Power BI style */}
      <div className="pbi-filter-bar rounded-sm px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">Filtros</span>
        </div>
        <div className="h-4 w-px bg-border" />

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary text-[12px] font-medium text-foreground hover:bg-secondary/80 transition-colors">
          <Calendar className="w-3 h-3" />
          Ano: {periodo}
          <ChevronDown className="w-3 h-3" />
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary text-[12px] font-medium text-foreground hover:bg-secondary/80 transition-colors">
          <Building2 className="w-3 h-3" />
          Todas as Obras
          <ChevronDown className="w-3 h-3" />
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary text-[12px] font-medium text-foreground hover:bg-secondary/80 transition-colors">
          Todos os Status
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* KPI Cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <PBITile key={kpi.title}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{kpi.title}</p>
                  <p className="pbi-kpi-value mt-1" style={{ color: kpi.color }}>{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3 text-success" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-destructive" />
                    )}
                    <span className={`text-[11px] font-semibold ${kpi.trend === "up" ? "text-success" : "text-destructive"}`}>
                      {kpi.change}
                    </span>
                    <span className="text-[10px] text-muted-foreground">vs anterior</span>
                  </div>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: `${kpi.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
              </div>
            </PBITile>
          );
        })}
      </div>

      {/* Row 2: Revenue chart + Pie — financial hidden for normal */}
      {!isNormal && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <PBITile title="Faturamento vs Custos (R$ mil)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
              <Tooltip
                formatter={(value: number) => [`R$ ${value}k`, ""]}
                contentStyle={tooltipStyle}
              />
              <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="receita" fill="hsl(207, 89%, 48%)" radius={[2, 2, 0, 0]} barSize={18} name="Faturamento" />
              <Line type="monotone" dataKey="custo" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 3 }} name="Custos" />
            </ComposedChart>
          </ResponsiveContainer>
        </PBITile>

        <PBITile title="Obras por Status">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={obrasPorStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                {obrasPorStatus.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, "obras"]} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {obrasPorStatus.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-[11px]">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground flex-1">{item.name}</span>
                <span className="font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </PBITile>
      </div>
      )}

      {/* Row 3: Bar chart + Progress + Line chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <PBITile title="Vendas por Empreendimento">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topEmpreendimentos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: axisColor }} stroke={axisColor} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: axisColor }} stroke={axisColor} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="square" wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="vendas" fill="hsl(207, 89%, 48%)" radius={[0, 2, 2, 0]} barSize={14} name="Vendas" />
              <Bar dataKey="meta" fill={theme === "dark" ? "hsl(0, 0%, 40%)" : "hsl(0, 0%, 80%)"} radius={[0, 2, 2, 0]} barSize={14} name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </PBITile>

        <PBITile title="Progresso das Obras (%)">
          <div className="space-y-3 mt-1">
            {progressoObras.map((item) => {
              const barColor = item.progresso >= 80 ? "hsl(152, 60%, 38%)" : item.progresso >= 50 ? "hsl(207, 89%, 48%)" : item.progresso >= 30 ? "hsl(45, 100%, 51%)" : "hsl(0, 72%, 51%)";
              return (
                <div key={item.obra}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-foreground font-medium">{item.obra}</span>
                    <span className="text-[11px] font-bold" style={{ color: barColor }}>{item.progresso}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.progresso}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </PBITile>

        <PBITile title="Unidades Vendidas / Mês">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={vendasMensais}>
              <defs>
                <linearGradient id="colorUnidades" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: axisColor }} stroke={axisColor} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} stroke={axisColor} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="unidades" stroke="hsl(174, 62%, 47%)" fill="url(#colorUnidades)" strokeWidth={2} name="Unidades" />
            </AreaChart>
          </ResponsiveContainer>
        </PBITile>
      </div>

      {/* Admin: Modules to implement */}
      {isAdmin && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Construction className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-[13px] font-semibold text-foreground">Módulos para Implementar</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: "hsl(var(--pbi-yellow) / 0.15)", color: "hsl(var(--pbi-yellow))" }}>Admin</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {pendingModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div key={mod.title} className="pbi-tile flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${mod.color}15` }}>
                      <Icon className="w-4 h-4" style={{ color: mod.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-foreground">{mod.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{mod.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-secondary">
                      <div className="h-full rounded-full w-0" style={{ background: mod.color }} />
                    </div>
                    <span className="text-[9px] text-muted-foreground font-medium">0%</span>
                  </div>
                  <button
                    onClick={() => window.alert(`Solicitar implementação do módulo "${mod.title}"`)}
                    className="flex items-center justify-center gap-1.5 w-full h-8 rounded-md text-[11px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    Implementar agora
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
