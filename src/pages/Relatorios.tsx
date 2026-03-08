import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Download, Filter, ArrowUpRight, ArrowDownRight, BarChart3, FileSpreadsheet, History, User, Calendar, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
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

type RelatorioGerado = {
  id: string;
  user_id: string;
  user_name: string;
  tipo: string;
  periodo_inicio: string;
  periodo_fim: string;
  formato: string;
  registros: number;
  observacoes: string | null;
  created_at: string;
};

export default function Relatorios() {
  const { toast } = useToast();
  const { user, profile, isAdmin } = useAuth();
  const [tipo, setTipo] = useState("geral");
  const [dataInicio, setDataInicio] = useState("2026-01-01");
  const [dataFim, setDataFim] = useState("2026-01-31");
  const [historico, setHistorico] = useState<RelatorioGerado[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);

  const fetchHistorico = async () => {
    const { data } = await supabase
      .from("relatorios_gerados")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setHistorico(data as RelatorioGerado[]);
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  const logRelatorio = async (formato: string, observacoes: string) => {
    if (!user) return;
    const tipoLabel = tiposRelatorio.find((t) => t.value === tipo)?.label || tipo;
    await supabase.from("relatorios_gerados").insert({
      user_id: user.id,
      user_name: profile?.full_name || user.email || "Usuário",
      tipo: tipoLabel,
      periodo_inicio: dataInicio,
      periodo_fim: dataFim,
      formato,
      registros: filteredData.length,
      observacoes,
    });
    fetchHistorico();
  };

  const deleteHistorico = async (id: string) => {
    await supabase.from("relatorios_gerados").delete().eq("id", id);
    fetchHistorico();
    toast({ title: "Registro removido" });
  };

  const filteredData = dadosExemplo.filter((d) => {
    if (tipo === "vendas") return d.categoria === "Vendas";
    if (tipo === "despesas") return d.categoria === "Despesas" || d.valor < 0;
    return true;
  });

  const totalReceitas = filteredData.filter((d) => d.valor > 0).reduce((a, d) => a + d.valor, 0);
  const totalDespesas = filteredData.filter((d) => d.valor < 0).reduce((a, d) => a + Math.abs(d.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  const categorias = [...new Set(filteredData.map(d => d.categoria))];

  const exportPDF = async () => {
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

    // Add who generated
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 140);
    doc.text(`Gerado por: ${profile?.full_name || user?.email || "—"}`, 120, 25);
    doc.text(`Data: ${new Date().toLocaleString("pt-BR")}`, 120, 31);

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
    doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")} por ${profile?.full_name || "—"} — ERP San Remo`, 14, 285);
    doc.save(`${tipoLabel.replace(/ /g, "_")}_${dataInicio}_${dataFim}.pdf`);

    await logRelatorio("PDF", `${tipoLabel} com ${filteredData.length} registros`);
    toast({ title: "PDF gerado!", description: `${tipoLabel} exportado com sucesso.` });
  };

  const exportExcel = async () => {
    const tipoLabel = tiposRelatorio.find((t) => t.value === tipo)?.label || "Relatório";
    const wb = XLSX.utils.book_new();
    const geradoPor = profile?.full_name || user?.email || "—";

    // === SHEET 1: Cover / Summary ===
    const coverData = [
      [""],
      ["SAN REMO CONSTRUTORA"],
      ["Sistema ERP — Painel de Gestão"],
      [""],
      [tipoLabel.toUpperCase()],
      [`Período: ${dataInicio} a ${dataFim}`],
      [`Gerado em: ${new Date().toLocaleString("pt-BR")}`],
      [`Gerado por: ${geradoPor}`],
      [""],
      ["RESUMO EXECUTIVO"],
      [""],
      ["Indicador", "Valor (R$)", "Observação"],
      ["Total de Receitas", totalReceitas, "Entradas no período"],
      ["Total de Despesas", totalDespesas, "Saídas no período"],
      ["Saldo Líquido", saldo, saldo >= 0 ? "Positivo" : "Negativo"],
      ["Nº de Registros", filteredData.length, "Lançamentos filtrados"],
      [""],
      ["ANÁLISE POR CATEGORIA"],
      [""],
      ["Categoria", "Total (R$)", "Nº Registros", "% do Total"],
    ];

    const totalAbs = filteredData.reduce((s, d) => s + Math.abs(d.valor), 0);
    categorias.forEach(cat => {
      const items = filteredData.filter(d => d.categoria === cat);
      const total = items.reduce((s, d) => s + d.valor, 0);
      const pct = totalAbs > 0 ? ((Math.abs(total) / totalAbs) * 100).toFixed(1) + "%" : "0%";
      coverData.push([cat, total, items.length, pct] as any);
    });

    const wsCover = XLSX.utils.aoa_to_sheet(coverData);
    wsCover["!cols"] = [{ wch: 28 }, { wch: 20 }, { wch: 18 }, { wch: 14 }];
    wsCover["!merges"] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 3 } },
      { s: { r: 6, c: 0 }, e: { r: 6, c: 3 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 3 } },
      { s: { r: 9, c: 0 }, e: { r: 9, c: 3 } },
      { s: { r: 17, c: 0 }, e: { r: 17, c: 3 } },
    ];
    XLSX.utils.book_append_sheet(wb, wsCover, "Resumo");

    // === SHEET 2: Detailed Data ===
    const detailHeader = [
      ["SAN REMO CONSTRUTORA — DETALHAMENTO DE LANÇAMENTOS"],
      [tipoLabel + ` | Período: ${dataInicio} a ${dataFim} | Gerado por: ${geradoPor}`],
      [""],
      ["#", "Data", "Categoria", "Descrição", "Valor (R$)", "Tipo"],
    ];
    const detailRows = filteredData.map((d, i) => [i + 1, d.data, d.categoria, d.descricao, d.valor, d.valor >= 0 ? "Receita" : "Despesa"]);
    const totalRow = ["", "", "", "TOTAL", filteredData.reduce((s, d) => s + d.valor, 0), ""];
    const allDetailData = [...detailHeader, ...detailRows, [""], totalRow as any];
    const wsDetail = XLSX.utils.aoa_to_sheet(allDetailData);
    wsDetail["!cols"] = [{ wch: 5 }, { wch: 12 }, { wch: 16 }, { wch: 45 }, { wch: 18 }, { wch: 10 }];
    wsDetail["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    ];
    const startRow = 4;
    for (let i = 0; i < detailRows.length; i++) {
      const cell = wsDetail[XLSX.utils.encode_cell({ r: startRow + i, c: 4 })];
      if (cell) cell.z = '#,##0.00';
    }
    const totalCell = wsDetail[XLSX.utils.encode_cell({ r: startRow + detailRows.length + 1, c: 4 })];
    if (totalCell) totalCell.z = '#,##0.00';
    XLSX.utils.book_append_sheet(wb, wsDetail, "Detalhamento");

    // === SHEET 3: Category Analysis ===
    const catHeader = [
      ["SAN REMO CONSTRUTORA — ANÁLISE POR CATEGORIA"],
      [`Período: ${dataInicio} a ${dataFim}`],
      [""],
      ["Categoria", "Receitas (R$)", "Despesas (R$)", "Saldo (R$)", "Nº Transações", "Ticket Médio (R$)"],
    ];
    const catRows = categorias.map(cat => {
      const items = filteredData.filter(d => d.categoria === cat);
      const rec = items.filter(d => d.valor > 0).reduce((s, d) => s + d.valor, 0);
      const desp = items.filter(d => d.valor < 0).reduce((s, d) => s + Math.abs(d.valor), 0);
      const total = items.reduce((s, d) => s + d.valor, 0);
      const avg = items.length > 0 ? total / items.length : 0;
      return [cat, rec, desp, total, items.length, Math.round(avg)];
    });
    const allCatData = [...catHeader, ...catRows];
    const wsCat = XLSX.utils.aoa_to_sheet(allCatData);
    wsCat["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 18 }];
    wsCat["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    ];
    XLSX.utils.book_append_sheet(wb, wsCat, "Por Categoria");

    // === SHEET 4: Monthly Summary ===
    const monthHeader = [
      ["SAN REMO CONSTRUTORA — RESUMO MENSAL"],
      [`Período: ${dataInicio} a ${dataFim}`],
      [""],
      ["Mês", "Receitas (R$)", "Despesas (R$)", "Saldo (R$)", "Nº Lançamentos"],
    ];
    const months: Record<string, { rec: number; desp: number; count: number }> = {};
    filteredData.forEach(d => {
      const m = d.data.substring(3, 10);
      if (!months[m]) months[m] = { rec: 0, desp: 0, count: 0 };
      if (d.valor > 0) months[m].rec += d.valor;
      else months[m].desp += Math.abs(d.valor);
      months[m].count++;
    });
    const monthRows = Object.entries(months).map(([m, v]) => [m, v.rec, v.desp, v.rec - v.desp, v.count]);
    const allMonthData = [...monthHeader, ...monthRows];
    const wsMonth = XLSX.utils.aoa_to_sheet(allMonthData);
    wsMonth["!cols"] = [{ wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 16 }];
    wsMonth["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    ];
    XLSX.utils.book_append_sheet(wb, wsMonth, "Mensal");

    const fileName = `${tipoLabel.replace(/ /g, "_")}_${dataInicio}_${dataFim}.xlsx`;
    XLSX.writeFile(wb, fileName);

    await logRelatorio("Excel", `${tipoLabel} — 4 abas, ${filteredData.length} registros`);
    toast({ title: "Excel profissional gerado!", description: `4 abas: Resumo, Detalhamento, Por Categoria e Mensal` });
  };

  return (
    <div className="space-y-4">
      {/* PBI Header */}
      <div className="pbi-header flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <div>
            <h1 className="text-base font-semibold text-white">Relatórios</h1>
            <p className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Gere e exporte relatórios analíticos em PDF e Excel</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowHistorico(!showHistorico)}
            variant="outline"
            className="h-8 text-[12px] font-semibold gap-1.5 border-none"
            style={{ background: showHistorico ? "hsl(var(--pbi-yellow) / 0.2)" : "hsl(var(--pbi-surface))", color: "hsl(var(--pbi-text-primary))" }}
          >
            <History className="w-3.5 h-3.5" /> Histórico
          </Button>
          <Button onClick={exportExcel} className="h-8 text-[12px] font-semibold gap-1.5" style={{ background: "hsl(152, 60%, 38%)", color: "white" }}>
            <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar Excel
          </Button>
          <Button onClick={exportPDF} className="h-8 text-[12px] font-semibold gap-1.5" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>
            <Download className="w-3.5 h-3.5" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* Histórico de Relatórios */}
      {showHistorico && (
        <div className="pbi-tile space-y-3" style={{ borderLeft: "3px solid hsl(var(--pbi-yellow))" }}>
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4" style={{ color: "hsl(var(--pbi-yellow))" }} />
            <p className="text-[12px] font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Histórico de Relatórios Gerados</p>
          </div>

          {historico.length === 0 ? (
            <p className="text-[11px] py-4 text-center" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
              Nenhum relatório gerado ainda. Exporte um PDF ou Excel para registrar no histórico.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--pbi-border))" }}>
                    <th className="text-left py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Data/Hora</th>
                    <th className="text-left py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Gerado por</th>
                    <th className="text-left py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Tipo</th>
                    <th className="text-left py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Formato</th>
                    <th className="text-left py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Período</th>
                    <th className="text-center py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Registros</th>
                    <th className="text-left py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Observações</th>
                    {isAdmin && <th className="text-center py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {historico.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: "1px solid hsl(var(--pbi-border) / 0.5)" }}>
                      <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-primary))" }}>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 shrink-0" style={{ color: "hsl(var(--pbi-text-secondary))" }} />
                          {new Date(r.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-primary))" }}>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 shrink-0" style={{ color: "hsl(var(--pbi-yellow))" }} />
                          {r.user_name}
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "hsl(var(--pbi-yellow) / 0.15)", color: "hsl(var(--pbi-yellow))" }}>
                          {r.tipo}
                        </span>
                      </td>
                      <td className="py-1.5 px-2">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: r.formato === "PDF" ? "hsl(0, 72%, 51%, 0.15)" : "hsl(152, 60%, 38%, 0.15)",
                            color: r.formato === "PDF" ? "hsl(0, 72%, 51%)" : "hsl(152, 60%, 38%)",
                          }}
                        >
                          {r.formato}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
                        {r.periodo_inicio} → {r.periodo_fim}
                      </td>
                      <td className="py-1.5 px-2 text-center font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>
                        {r.registros}
                      </td>
                      <td className="py-1.5 px-2 text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
                        {r.observacoes || "—"}
                      </td>
                      {isAdmin && (
                        <td className="py-1.5 px-2 text-center">
                          <button onClick={() => deleteHistorico(r.id)} className="opacity-40 hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" style={{ color: "hsl(0, 72%, 51%)" }} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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

      {/* Excel preview info */}
      <div className="pbi-tile flex items-center gap-4" style={{ borderLeft: "3px solid hsl(152, 60%, 38%)" }}>
        <FileSpreadsheet className="w-5 h-5 shrink-0" style={{ color: "hsl(152, 60%, 38%)" }} />
        <div className="flex-1">
          <p className="text-[12px] font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Relatório Excel Profissional</p>
          <p className="text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>4 abas: Resumo Executivo · Detalhamento Completo · Análise por Categoria · Resumo Mensal</p>
        </div>
        <div className="flex gap-4 text-center">
          {[
            { label: "Registros", value: filteredData.length },
            { label: "Categorias", value: categorias.length },
            { label: "Abas", value: 4 },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-lg font-bold" style={{ color: "hsl(var(--pbi-text-primary))" }}>{s.value}</p>
              <p className="text-[9px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{s.label}</p>
            </div>
          ))}
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
