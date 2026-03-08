import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import {
  DollarSign, Building2, HardHat, Users, ArrowUpRight, ArrowDownRight,
  TrendingUp, Calendar, Filter, ChevronDown,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart, Line,
} from "recharts";

const PBITile = ({ children, title, className = "" }: { children: React.ReactNode; title?: string; className?: string }) => (
  <div className={`pbi-tile ${className}`}>
    {title && <h3 className="text-[13px] font-semibold text-foreground mb-3">{title}</h3>}
    {children}
  </div>
);

export default function Dashboard() {
  const [periodo, setPeriodo] = useState("2026");
  const { userRole, profile, isAdmin } = useAuth();
  const { theme } = useTheme();
  const isNormal = userRole === "normal";

  // Real data states
  const [metaStats, setMetaStats] = useState({ total: 0, atingidas: 0, emRisco: 0 });
  const [faturamentoTotal, setFaturamentoTotal] = useState(0);
  const [obrasAtivas, setObrasAtivas] = useState(0);
  const [unidadesVendidas, setUnidadesVendidas] = useState(0);
  const [contratosAtivos, setContratosAtivos] = useState(0);
  const [obrasPorStatus, setObrasPorStatus] = useState<{ name: string; value: number; color: string }[]>([]);
  const [fluxoData, setFluxoData] = useState<{ month: string; receita: number; custo: number }[]>([]);
  const [progressoObras, setProgressoObras] = useState<{ obra: string; progresso: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

      const [metas, fat, cp, emp, cont] = await Promise.all([
        supabase.from("metas").select("status"),
        supabase.from("faturamento").select("valor,data_emissao"),
        supabase.from("contas_pagar").select("valor,data_emissao"),
        supabase.from("empreendimentos").select("nome,status,unidades,vendidas,fase"),
        supabase.from("contratos").select("status"),
      ]);

      // Metas
      if (metas.data) {
        setMetaStats({
          total: metas.data.length,
          atingidas: metas.data.filter(m => m.status === "atingida").length,
          emRisco: metas.data.filter(m => m.status === "em_risco").length,
        });
      }

      // Faturamento total
      const fatData = (fat.data || []) as any[];
      setFaturamentoTotal(fatData.reduce((s: number, f: any) => s + Number(f.valor), 0));

      // Fluxo de caixa
      const fluxoMap: Record<string, { receita: number; custo: number }> = {};
      fatData.forEach((f: any) => {
        const m = monthNames[new Date(f.data_emissao).getMonth()];
        if (!fluxoMap[m]) fluxoMap[m] = { receita: 0, custo: 0 };
        fluxoMap[m].receita += Number(f.valor) / 1000;
      });
      ((cp.data || []) as any[]).forEach((c: any) => {
        const m = monthNames[new Date(c.data_emissao).getMonth()];
        if (!fluxoMap[m]) fluxoMap[m] = { receita: 0, custo: 0 };
        fluxoMap[m].custo += Number(c.valor) / 1000;
      });
      setFluxoData(monthNames.filter(m => fluxoMap[m]).map(m => ({ month: m, ...fluxoMap[m] })));

      // Empreendimentos
      const empData = (emp.data || []) as any[];
      const ativos = empData.filter((e: any) => e.status !== "concluído");
      setObrasAtivas(ativos.length);
      setUnidadesVendidas(empData.reduce((s: number, e: any) => s + Number(e.vendidas || 0), 0));

      // Obras por status
      const statusMap: Record<string, number> = {};
      empData.forEach((e: any) => { statusMap[e.status] = (statusMap[e.status] || 0) + 1; });
      const statusColors: Record<string, string> = {
        "em andamento": "hsl(207, 89%, 48%)", planejamento: "hsl(45, 100%, 51%)",
        "concluído": "hsl(152, 60%, 38%)",
      };
      setObrasPorStatus(Object.entries(statusMap).map(([name, value]) => ({
        name, value, color: statusColors[name] || "hsl(0, 0%, 50%)",
      })));

      // Progresso (simulated from fase)
      const faseProgress: Record<string, number> = { Projeto: 10, Fundação: 30, Estrutura: 55, Acabamento: 80, Entregue: 100 };
      setProgressoObras(empData.slice(0, 5).map((e: any) => ({
        obra: e.nome, progresso: faseProgress[e.fase] || 0,
      })));

      // Contratos
      setContratosAtivos(((cont.data || []) as any[]).filter((c: any) => c.status === "ativo").length);
    };
    load();
  }, []);

  const kpis = [
    { title: "Faturamento", value: `R$ ${(faturamentoTotal / 1000).toFixed(0)}k`, trend: "up" as const, icon: DollarSign, color: "hsl(207, 89%, 48%)" },
    { title: "Obras Ativas", value: String(obrasAtivas), trend: "up" as const, icon: Building2, color: "hsl(45, 100%, 51%)" },
    { title: "Unidades Vendidas", value: String(unidadesVendidas), trend: "up" as const, icon: HardHat, color: "hsl(174, 62%, 47%)" },
    { title: "Contratos Ativos", value: String(contratosAtivos), trend: "up" as const, icon: Users, color: "hsl(28, 87%, 55%)" },
  ];

  const gridColor = theme === "dark" ? "hsl(0, 0%, 25%)" : "hsl(0, 0%, 88%)";
  const axisColor = theme === "dark" ? "hsl(0, 0%, 45%)" : "hsl(0, 0%, 60%)";
  const tooltipBg = theme === "dark" ? "hsl(0, 0%, 18%)" : "#fff";
  const tooltipBorder = theme === "dark" ? "hsl(0, 0%, 30%)" : "hsl(0, 0%, 88%)";
  const tooltipStyle = { borderRadius: "4px", border: `1px solid ${tooltipBorder}`, fontSize: 12, backgroundColor: tooltipBg, color: theme === "dark" ? "#e8e8e8" : "#222" };

  return (
    <div className="space-y-3">
      {isNormal && (
        <div className="pbi-tile" style={{ borderLeft: "3px solid hsl(207, 89%, 48%)" }}>
          <p className="text-[12px] font-medium" style={{ color: "hsl(var(--pbi-text-primary))" }}>
            Bem-vindo, <strong style={{ color: "hsl(var(--pbi-yellow))" }}>{profile?.full_name}</strong>!
            Você está no modo <strong>visualização</strong>. Para editar metas ou gerar relatórios, solicite acesso ao administrador.
          </p>
        </div>
      )}

      <div className="pbi-filter-bar rounded-sm px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">Filtros</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary text-[12px] font-medium text-foreground hover:bg-secondary/80 transition-colors">
          <Calendar className="w-3 h-3" /> Ano: {periodo} <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <PBITile key={kpi.title}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{kpi.title}</p>
                  <p className="pbi-kpi-value mt-1" style={{ color: kpi.color }}>{kpi.value}</p>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: `${kpi.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
              </div>
            </PBITile>
          );
        })}
      </div>

      {/* Charts */}
      {!isNormal && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <PBITile title="Faturamento vs Custos (R$ mil)" className="lg:col-span-2">
            {fluxoData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={fluxoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
                  <YAxis tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
                  <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(0)}k`, ""]} contentStyle={tooltipStyle} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="receita" fill="hsl(207, 89%, 48%)" radius={[2, 2, 0, 0]} barSize={18} name="Faturamento" />
                  <Line type="monotone" dataKey="custo" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 3 }} name="Custos" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[11px] text-muted-foreground text-center py-12">Cadastre faturamentos e contas para ver o gráfico.</p>
            )}
          </PBITile>

          <PBITile title="Obras por Status">
            {obrasPorStatus.length > 0 ? (
              <>
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
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground text-center py-12">Cadastre empreendimentos para ver o gráfico.</p>
            )}
          </PBITile>
        </div>
      )}

      {/* Progress */}
      {progressoObras.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
                      <div className="h-full rounded-full transition-all" style={{ width: `${item.progresso}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </PBITile>

          <PBITile title="Resumo de Metas">
            <div className="space-y-3 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Total de Metas</span>
                <span className="text-lg font-bold text-foreground">{metaStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Atingidas</span>
                <span className="text-lg font-bold" style={{ color: "hsl(152, 60%, 38%)" }}>{metaStats.atingidas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Em Risco</span>
                <span className="text-lg font-bold" style={{ color: "hsl(0, 72%, 51%)" }}>{metaStats.emRisco}</span>
              </div>
            </div>
          </PBITile>
        </div>
      )}
    </div>
  );
}
