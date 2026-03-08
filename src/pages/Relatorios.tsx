import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Download, Filter, ChevronDown, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const dadosExemplo = [
  { data: "01/01/2026", categoria: "Vendas", descricao: "Venda Unid. 302 — Res. Vila Serena", valor: 385000 },
  { data: "05/01/2026", categoria: "Compras", descricao: "Cimento e aço — Canteiro Monte Carlo", valor: -125000 },
  { data: "10/01/2026", categoria: "Vendas", descricao: "Venda Lote 15 — Cond. Jardim Real", valor: 180000 },
  { data: "12/01/2026", categoria: "Despesas", descricao: "Folha de pagamento — Engenharia", valor: -185000 },
  { data: "15/01/2026", categoria: "Vendas", descricao: "Sinal Unid. 1201 — Ed. Monte Carlo", valor: 156000 },
  { data: "18/01/2026", categoria: "Compras", descricao: "Concreto usinado — Concreteira Central", valor: -92000 },
  { data: "22/01/2026", categoria: "Receitas", descricao: "Parcela financiamento — Vila Serena", valor: 195000 },
  { data: "25/01/2026", categoria: "Despesas", descricao: "Aluguel de equipamentos pesados", valor: -48000 },
  { data: "28/01/2026", categoria: "Vendas", descricao: "Venda Unid. 501 — Res. Vila Serena", valor: 395000 },
  { data: "30/01/2026", categoria: "Despesas", descricao: "Impostos e encargos trabalhistas", valor: -65000 },
];

const tiposRelatorio = [
  { value: "geral", label: "Relatório Geral" },
  { value: "vendas", label: "Relatório de Vendas" },
  { value: "despesas", label: "Relatório de Custos" },
  { value: "metas", label: "Relatório de Metas" },
];

const chartData = [
  { cat: "Vendas", valor: 1116000 },
  { cat: "Receitas", valor: 195000 },
  { cat: "Compras", valor: 217000 },
  { cat: "Despesas", valor: 298000 },
];

export default function Relatorios() {
  const { toast } = useToast();
  const [tipo, setTipo] = useState("geral");
  const [dataInicio, setDataInicio] = useState("2026-01-01");
  const [dataFim, setDataFim] = useState("2026-01-31");

  const filteredData = dadosExemplo.filter((d) => {
    if (tipo === "vendas") return d.categoria === "Vendas";
    if (tipo === "despesas") return d.categoria === "Despesas" || d.valor < 0;
    return true;
  });

  const totalReceitas = filteredData.filter((d) => d.valor > 0).reduce((a, d) => a + d.valor, 0);
  const totalDespesas = filteredData.filter((d) => d.valor < 0).reduce((a, d) => a + Math.abs(d.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  const exportPDF = () => {
    const doc = new jsPDF();
    const tipoLabel = tiposRelatorio.find((t) => t.value === tipo)?.label || "Relatório";
    doc.setFillColor(30, 41, 66);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(207, 172, 93);
    doc.setFontSize(18);
    doc.text("San Remo Construtora", 14, 16);
    doc.setFontSize(11);
    doc.setTextColor(180, 180, 200);
    doc.text(tipoLabel, 14, 25);
    doc.text(`Período: ${dataInicio} a ${dataFim}`, 14, 31);
    autoTable(doc, {
      startY: 42,
      head: [["Data", "Categoria", "Descrição", "Valor (R$)"]],
      body: filteredData.map((d) => [d.data, d.categoria, d.descricao, d.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })]),
      headStyles: { fillColor: [30, 41, 66], textColor: [207, 172, 93], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Receitas: R$ ${totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 14, finalY);
    doc.text(`Total Despesas: R$ ${totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 14, finalY + 6);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")} — ERP San Remo`, 14, 285);
    doc.save(`${tipoLabel.replace(/ /g, "_")}_${dataInicio}_${dataFim}.pdf`);
    toast({ title: "PDF gerado!", description: `${tipoLabel} exportado com sucesso.` });
  };

  return (
    <div className="space-y-4">
      {/* PBI Header */}
      <div className="pbi-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <div>
            <h1 className="text-base font-semibold text-white">Relatórios</h1>
            <p className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Gere e exporte relatórios analíticos em PDF</p>
          </div>
        </div>
        <Button onClick={exportPDF} className="h-8 text-[12px] font-semibold gap-1.5" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>
          <Download className="w-3.5 h-3.5" /> Exportar PDF
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap" style={{ background: "hsl(var(--pbi-surface))", borderRadius: "6px", padding: "8px 12px", border: "1px solid hsl(var(--pbi-border))" }}>
        <Filter className="w-3.5 h-3.5" style={{ color: "hsl(var(--pbi-text-secondary))" }} />
        <div className="flex items-center gap-2">
          <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Tipo:</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="h-7 text-[11px] w-[160px] border-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tiposRelatorio.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>De:</Label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="h-7 text-[11px] w-[130px] border-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }} />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Até:</Label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="h-7 text-[11px] w-[130px] border-none" style={{ background: "hsl(var(--pbi-dark))", color: "hsl(var(--pbi-text-primary))" }} />
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="pbi-tile">
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Receitas</p>
          <p className="text-xl font-bold" style={{ color: "hsl(152, 60%, 38%)" }}>R$ {(totalReceitas / 1000).toFixed(0)}k</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" style={{ color: "hsl(152, 60%, 38%)" }} />
            <span className="text-[10px]" style={{ color: "hsl(152, 60%, 38%)" }}>+14.8%</span>
          </div>
        </div>
        <div className="pbi-tile">
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Despesas</p>
          <p className="text-xl font-bold" style={{ color: "hsl(0, 72%, 51%)" }}>R$ {(totalDespesas / 1000).toFixed(0)}k</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowDownRight className="w-3 h-3" style={{ color: "hsl(0, 72%, 51%)" }} />
            <span className="text-[10px]" style={{ color: "hsl(0, 72%, 51%)" }}>+6.2%</span>
          </div>
        </div>
        <div className="pbi-tile">
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Saldo</p>
          <p className="text-xl font-bold" style={{ color: "hsl(var(--pbi-yellow))" }}>R$ {(saldo / 1000).toFixed(0)}k</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" style={{ color: "hsl(var(--pbi-yellow))" }} />
            <span className="text-[10px]" style={{ color: "hsl(var(--pbi-yellow))" }}>Positivo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="pbi-tile">
          <p className="text-[11px] font-semibold mb-3" style={{ color: "hsl(var(--pbi-text-primary))" }}>Distribuição por Categoria</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 25%)" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 10 }} axisLine={false} />
              <YAxis type="category" dataKey="cat" tick={{ fill: "hsl(220, 15%, 70%)", fontSize: 10 }} axisLine={false} width={70} />
              <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} contentStyle={{ background: "hsl(222, 30%, 18%)", border: "1px solid hsl(220, 20%, 30%)", borderRadius: "6px", fontSize: "11px", color: "#fff" }} />
              <Bar dataKey="valor" fill="hsl(207, 89%, 48%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 pbi-tile">
          <p className="text-[11px] font-semibold mb-3" style={{ color: "hsl(var(--pbi-text-primary))" }}>Detalhamento</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--pbi-border))" }}>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Data</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Categoria</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Descrição</th>
                  <th className="text-right py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((d, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors" style={{ borderBottom: "1px solid hsl(var(--pbi-border) / 0.5)" }}>
                    <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-primary))" }}>{d.data}</td>
                    <td className="py-1.5 px-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "hsl(var(--pbi-yellow) / 0.15)", color: "hsl(var(--pbi-yellow))" }}>
                        {d.categoria}
                      </span>
                    </td>
                    <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-primary))" }}>{d.descricao}</td>
                    <td className="py-1.5 px-2 text-right font-semibold" style={{ color: d.valor >= 0 ? "hsl(152, 60%, 38%)" : "hsl(0, 72%, 51%)" }}>
                      R$ {Math.abs(d.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
