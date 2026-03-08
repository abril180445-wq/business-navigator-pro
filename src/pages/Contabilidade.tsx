import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download, DollarSign, CreditCard, FileText, TrendingUp, ChevronDown, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useTheme } from "@/hooks/useTheme";

const invoices = [
  { id: "NF-2026-0142", cliente: "Res. Vila Serena — Unid. 302", valor: 385000, status: "pago", data: "15/02/2026", vencimento: "15/03/2026" },
  { id: "NF-2026-0141", cliente: "Ed. Monte Carlo — Unid. 1201", valor: 520000, status: "pendente", data: "14/02/2026", vencimento: "14/03/2026" },
  { id: "NF-2026-0140", cliente: "Cond. Jardim Real — Lote 15", valor: 180000, status: "atrasado", data: "10/02/2026", vencimento: "10/03/2026" },
  { id: "NF-2026-0139", cliente: "Res. Vila Serena — Unid. 501", valor: 395000, status: "pago", data: "08/02/2026", vencimento: "08/03/2026" },
  { id: "NF-2026-0138", cliente: "Concreteira Central — CT-042", valor: 145000, status: "pendente", data: "05/02/2026", vencimento: "05/03/2026" },
  { id: "NF-2026-0137", cliente: "Aço Forte Ltda — CT-041", valor: 278000, status: "pago", data: "03/02/2026", vencimento: "03/03/2026" },
  { id: "NF-2026-0136", cliente: "Ed. Torre Dourada — Sinal", valor: 85000, status: "cancelado", data: "01/02/2026", vencimento: "01/03/2026" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pago: { label: "Pago", color: "hsl(152, 60%, 38%)", bg: "hsl(152, 60%, 38%, 0.15)" },
  pendente: { label: "Pendente", color: "hsl(45, 100%, 51%)", bg: "hsl(45, 100%, 51%, 0.15)" },
  atrasado: { label: "Atrasado", color: "hsl(0, 72%, 51%)", bg: "hsl(0, 72%, 51%, 0.15)" },
  cancelado: { label: "Cancelado", color: "hsl(220, 15%, 55%)", bg: "hsl(220, 15%, 55%, 0.15)" },
};

const summaryCards = [
  { title: "Faturamento Mensal", value: "R$ 2,1M", icon: DollarSign, change: "+14.8%", positive: true },
  { title: "Contas a Receber", value: "R$ 1,85M", icon: CreditCard, change: "+8.2%", positive: true },
  { title: "Notas Emitidas", value: "67", icon: FileText, change: "+15%", positive: true },
  { title: "Margem de Obra", value: "28.4%", icon: TrendingUp, change: "+1.6%", positive: true },
];

const fluxoData = [
  { month: "Jan", entrada: 1200, saida: 850 },
  { month: "Fev", entrada: 1450, saida: 920 },
  { month: "Mar", entrada: 980, saida: 780 },
  { month: "Abr", entrada: 1600, saida: 1050 },
  { month: "Mai", entrada: 1350, saida: 900 },
  { month: "Jun", entrada: 1800, saida: 1100 },
];

export default function Contabilidade() {
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "hsl(0, 0%, 25%)" : "hsl(0, 0%, 85%)";
  const axisColor = theme === "dark" ? "hsl(0, 0%, 55%)" : "hsl(0, 0%, 50%)";
  const tooltipStyle = {
    background: theme === "dark" ? "hsl(0, 0%, 18%)" : "#fff",
    border: `1px solid ${theme === "dark" ? "hsl(0, 0%, 30%)" : "hsl(0, 0%, 85%)"}`,
    borderRadius: "6px",
    fontSize: "11px",
    color: theme === "dark" ? "#e8e8e8" : "#222",
  };

  return (
    <div className="space-y-4">
      {/* PBI Header */}
      <div className="pbi-header flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <div>
            <h1 className="text-base font-semibold text-white">Financeiro</h1>
            <p className="text-[11px]" style={{ color: "hsl(0, 0%, 72%)" }}>Faturamento, contas e fluxo de caixa</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-[11px] border-none gap-1 bg-secondary text-foreground hover:bg-secondary/80">
            <Filter className="w-3 h-3" /> Filtrar
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px] border-none gap-1 bg-secondary text-foreground hover:bg-secondary/80">
            <Download className="w-3 h-3" /> Exportar
          </Button>
          <Button size="sm" className="h-7 text-[11px] font-semibold gap-1" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>
            <Plus className="w-3 h-3" /> Nova NF
          </Button>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="pbi-tile">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{card.title}</p>
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" style={{ color: "hsl(152, 60%, 38%)" }} />
                <span className="text-[10px]" style={{ color: "hsl(152, 60%, 38%)" }}>{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fluxo chart */}
        <div className="pbi-tile">
          <p className="text-[11px] font-semibold mb-3 text-foreground">Fluxo de Caixa (R$ mil)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={fluxoData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="entrada" stroke="hsl(152, 60%, 38%)" fill="hsl(152, 60%, 38%)" fillOpacity={0.2} />
              <Area type="monotone" dataKey="saida" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice table */}
        <div className="lg:col-span-2 pbi-tile">
          <p className="text-[11px] font-semibold mb-3 text-foreground">Notas Fiscais e Pagamentos</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border">
                  {["Número", "Referência", "Emissão", "Vencimento", "Valor", "Status"].map((h) => (
                    <th key={h} className={`py-2 px-2 font-medium text-muted-foreground ${h === "Valor" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const st = statusConfig[inv.status];
                  return (
                    <tr key={inv.id} className="pbi-row-hover cursor-pointer transition-colors border-b border-border/50">
                      <td className="py-1.5 px-2 font-medium" style={{ color: "hsl(207, 89%, 48%)" }}>{inv.id}</td>
                      <td className="py-1.5 px-2 text-foreground">{inv.cliente}</td>
                      <td className="py-1.5 px-2 text-muted-foreground">{inv.data}</td>
                      <td className="py-1.5 px-2 text-muted-foreground">{inv.vencimento}</td>
                      <td className="py-1.5 px-2 text-right font-medium text-foreground">R$ {inv.valor.toLocaleString()}</td>
                      <td className="py-1.5 px-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
