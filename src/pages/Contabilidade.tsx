import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download, DollarSign, CreditCard, FileText, TrendingUp, ChevronDown, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
  return (
    <div className="space-y-4">
      {/* PBI Header */}
      <div className="pbi-header flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <div>
            <h1 className="text-base font-semibold text-white">Financeiro</h1>
            <p className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Faturamento, contas e fluxo de caixa</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-[11px] border-none gap-1" style={{ background: "hsl(var(--pbi-surface))", color: "hsl(var(--pbi-text-primary))" }}>
            <Filter className="w-3 h-3" /> Filtrar
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px] border-none gap-1" style={{ background: "hsl(var(--pbi-surface))", color: "hsl(var(--pbi-text-primary))" }}>
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
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{card.title}</p>
                <Icon className="w-3.5 h-3.5" style={{ color: "hsl(var(--pbi-text-secondary))" }} />
              </div>
              <p className="text-xl font-bold" style={{ color: "hsl(var(--pbi-text-primary))" }}>{card.value}</p>
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
          <p className="text-[11px] font-semibold mb-3" style={{ color: "hsl(var(--pbi-text-primary))" }}>Fluxo de Caixa (R$ mil)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={fluxoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 25%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(222, 30%, 18%)", border: "1px solid hsl(220, 20%, 30%)", borderRadius: "6px", fontSize: "11px", color: "#fff" }} />
              <Area type="monotone" dataKey="entrada" stroke="hsl(152, 60%, 38%)" fill="hsl(152, 60%, 38%)" fillOpacity={0.2} />
              <Area type="monotone" dataKey="saida" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice table */}
        <div className="lg:col-span-2 pbi-tile">
          <p className="text-[11px] font-semibold mb-3" style={{ color: "hsl(var(--pbi-text-primary))" }}>Notas Fiscais e Pagamentos</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--pbi-border))" }}>
                  {["Número", "Referência", "Emissão", "Vencimento", "Valor", "Status"].map((h) => (
                    <th key={h} className={`py-2 px-2 font-medium ${h === "Valor" ? "text-right" : "text-left"}`} style={{ color: "hsl(var(--pbi-text-secondary))" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const st = statusConfig[inv.status];
                  return (
                    <tr key={inv.id} className="hover:bg-white/5 cursor-pointer transition-colors" style={{ borderBottom: "1px solid hsl(var(--pbi-border) / 0.5)" }}>
                      <td className="py-1.5 px-2 font-medium" style={{ color: "hsl(207, 89%, 48%)" }}>{inv.id}</td>
                      <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-primary))" }}>{inv.cliente}</td>
                      <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{inv.data}</td>
                      <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{inv.vencimento}</td>
                      <td className="py-1.5 px-2 text-right font-medium" style={{ color: "hsl(var(--pbi-text-primary))" }}>R$ {inv.valor.toLocaleString()}</td>
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
