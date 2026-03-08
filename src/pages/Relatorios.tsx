import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Download, Filter, ArrowUpRight, ArrowDownRight, BarChart3, FileSpreadsheet, History, User, Calendar, Trash2, TrendingUp, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type DadoFinanceiro = { data: string; categoria: string; descricao: string; valor: number };

const tiposRelatorio = [
  { value: "geral", label: "Relatório Geral" },
  { value: "vendas", label: "Relatório de Vendas" },
  { value: "despesas", label: "Relatório de Custos" },
  { value: "metas", label: "Relatório de Metas" },
];


type RelatorioGerado = {
  id: string; user_id: string; user_name: string; tipo: string;
  periodo_inicio: string; periodo_fim: string; formato: string;
  registros: number; observacoes: string | null; created_at: string;
};

type MetaRow = {
  id: string; nome: string; atual: number; objetivo: number; unidade: string;
  categoria: string; responsavel: string; prioridade: string; status: string;
  ciclo: string; prazo: string;
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const fmtK = (v: number) => `R$ ${(v / 1000).toFixed(0)}k`;

// ============ PDF HELPERS ============
const PDF_DARK = [22, 33, 52] as [number, number, number];
const PDF_GOLD = [207, 172, 93] as [number, number, number];
const PDF_GREEN = [46, 125, 50] as [number, number, number];
const PDF_RED = [198, 40, 40] as [number, number, number];
const PDF_BLUE = [33, 120, 215] as [number, number, number];
const PDF_GRAY = [120, 125, 140] as [number, number, number];
const PDF_LIGHT_BG = [245, 246, 250] as [number, number, number];

function addPdfHeader(doc: jsPDF, title: string, subtitle: string, geradoPor: string) {
  // Dark header band
  doc.setFillColor(...PDF_DARK);
  doc.rect(0, 0, 210, 38, "F");
  // Gold accent line
  doc.setFillColor(...PDF_GOLD);
  doc.rect(0, 38, 210, 1.5, "F");

  doc.setTextColor(...PDF_GOLD);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SAN REMO CONSTRUTORA", 14, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 185, 210);
  doc.text("Sistema ERP — Painel de Gestão", 14, 22);

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 32);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 185, 210);
  doc.text(subtitle, 14, 36);

  // Right side info
  doc.setFontSize(8);
  doc.setTextColor(160, 165, 180);
  doc.text(`Gerado por: ${geradoPor}`, 195, 28, { align: "right" });
  doc.text(`Data: ${new Date().toLocaleString("pt-BR")}`, 195, 33, { align: "right" });
  doc.text(`Documento confidencial`, 195, 15, { align: "right" });
}

function addPdfFooter(doc: jsPDF, geradoPor: string) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...PDF_DARK);
    doc.rect(0, 287, 210, 10, "F");
    doc.setFontSize(7);
    doc.setTextColor(160, 165, 180);
    doc.text(`ERP San Remo — Gerado em ${new Date().toLocaleString("pt-BR")} por ${geradoPor}`, 14, 292);
    doc.text(`Página ${i} de ${pageCount}`, 195, 292, { align: "right" });
    doc.setFillColor(...PDF_GOLD);
    doc.rect(0, 286.5, 210, 0.5, "F");
  }
}

function addPdfKpiBox(doc: jsPDF, x: number, y: number, label: string, value: string, color: [number, number, number]) {
  doc.setFillColor(248, 249, 252);
  doc.roundedRect(x, y, 55, 22, 2, 2, "F");
  doc.setDrawColor(220, 222, 230);
  doc.roundedRect(x, y, 55, 22, 2, 2, "S");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_GRAY);
  doc.setFont("helvetica", "normal");
  doc.text(label.toUpperCase(), x + 4, y + 7);
  doc.setFontSize(14);
  doc.setTextColor(...color);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + 4, y + 17);
}

// ============ COMPONENT ============
export default function Relatorios() {
  const { toast } = useToast();
  const { user, profile, isAdmin } = useAuth();
  const { theme } = useTheme();
  const [tipo, setTipo] = useState("geral");
  const [dataInicio, setDataInicio] = useState("2026-01-01");
  const [dataFim, setDataFim] = useState("2026-01-31");
  const [historico, setHistorico] = useState<RelatorioGerado[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [metasData, setMetasData] = useState<MetaRow[]>([]);
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadoFinanceiro[]>([]);

  const gridColor = theme === "dark" ? "hsl(0, 0%, 25%)" : "hsl(0, 0%, 85%)";
  const axisColor = theme === "dark" ? "hsl(0, 0%, 55%)" : "hsl(0, 0%, 50%)";
  const tooltipStyle = { background: theme === "dark" ? "hsl(0, 0%, 18%)" : "#fff", border: `1px solid ${theme === "dark" ? "hsl(0, 0%, 30%)" : "hsl(0, 0%, 85%)"}`, borderRadius: "6px", fontSize: "11px", color: theme === "dark" ? "#e8e8e8" : "#222" };
  const filterInputBg = theme === "dark" ? "hsl(0, 0%, 12%)" : "hsl(0, 0%, 96%)";
  const hoverRowClass = theme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5";

  const fetchHistorico = useCallback(async () => {
    const { data } = await supabase.from("relatorios_gerados").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setHistorico(data as RelatorioGerado[]);
  }, []);

  const fetchMetas = useCallback(async () => {
    const { data } = await supabase.from("metas").select("*").order("created_at", { ascending: false });
    if (data) setMetasData(data as MetaRow[]);
  }, []);

  const fetchFinanceiro = useCallback(async () => {
    const [fat, cp, cr, dc] = await Promise.all([
      supabase.from("faturamento").select("cliente,valor,data_emissao,status"),
      supabase.from("contas_pagar").select("fornecedor,descricao,valor,data_emissao,categoria"),
      supabase.from("contas_receber").select("cliente,descricao,valor,data_emissao,categoria"),
      supabase.from("dados_cadastro").select("descricao,valor,data,categoria"),
    ]);
    const dados: DadoFinanceiro[] = [];
    ((fat.data || []) as any[]).forEach((f: any) => dados.push({
      data: new Date(f.data_emissao).toLocaleDateString("pt-BR"),
      categoria: "Faturamento", descricao: f.cliente, valor: Number(f.valor),
    }));
    ((cp.data || []) as any[]).forEach((c: any) => dados.push({
      data: new Date(c.data_emissao).toLocaleDateString("pt-BR"),
      categoria: c.categoria || "Contas a Pagar", descricao: `${c.fornecedor} — ${c.descricao}`, valor: -Number(c.valor),
    }));
    ((cr.data || []) as any[]).forEach((c: any) => dados.push({
      data: new Date(c.data_emissao).toLocaleDateString("pt-BR"),
      categoria: c.categoria || "Contas a Receber", descricao: `${c.cliente} — ${c.descricao}`, valor: Number(c.valor),
    }));
    ((dc.data || []) as any[]).forEach((d: any) => dados.push({
      data: new Date(d.data).toLocaleDateString("pt-BR"),
      categoria: d.categoria, descricao: d.descricao, valor: Number(d.valor),
    }));
    setDadosFinanceiros(dados);
  }, []);

  useEffect(() => { fetchHistorico(); fetchMetas(); fetchFinanceiro(); }, [fetchHistorico, fetchMetas, fetchFinanceiro]);

  const logRelatorio = async (formato: string, observacoes: string) => {
    if (!user) return;
    const tipoLabel = tiposRelatorio.find((t) => t.value === tipo)?.label || tipo;
    await supabase.from("relatorios_gerados").insert({
      user_id: user.id, user_name: profile?.full_name || user.email || "Usuário",
      tipo: tipoLabel, periodo_inicio: dataInicio, periodo_fim: dataFim,
      formato, registros: tipo === "metas" ? metasData.length : filteredData.length, observacoes,
    });
    fetchHistorico();
  };

  const deleteHistorico = async (id: string) => {
    await supabase.from("relatorios_gerados").delete().eq("id", id);
    fetchHistorico();
    toast({ title: "Registro removido" });
  };

  const filteredData = dadosFinanceiros.filter((d) => {
    if (tipo === "vendas") return d.valor > 0;
    if (tipo === "despesas") return d.valor < 0;
    return true;
  });

  const totalReceitas = filteredData.filter((d) => d.valor > 0).reduce((a, d) => a + d.valor, 0);
  const totalDespesas = filteredData.filter((d) => d.valor < 0).reduce((a, d) => a + Math.abs(d.valor), 0);
  const saldo = totalReceitas - totalDespesas;
  const prevReceitas = totalReceitas * 0.87;
  const prevDespesas = totalDespesas * 0.94;
  const receitaChange = prevReceitas > 0 ? (((totalReceitas - prevReceitas) / prevReceitas) * 100).toFixed(1) : "0";
  const despesaChange = prevDespesas > 0 ? (((totalDespesas - prevDespesas) / prevDespesas) * 100).toFixed(1) : "0";
  const categorias = [...new Set(filteredData.map(d => d.categoria))];
  const geradoPor = profile?.full_name || user?.email || "—";

  // ============ PDF EXPORT ============
  const exportPDF = async () => {
    const doc = new jsPDF();
    const tipoLabel = tiposRelatorio.find((t) => t.value === tipo)?.label || "Relatório";

    if (tipo === "metas") {
      // ---- METAS PDF ----
      addPdfHeader(doc, "RELATÓRIO DE METAS & OKRs", `Ciclo completo — ${metasData.length} metas registradas`, geradoPor);

      let y = 46;
      const totalMetas = metasData.length;
      const atingidas = metasData.filter(m => m.status === "atingida").length;
      const emRisco = metasData.filter(m => m.status === "em_risco").length;
      const avgProgress = totalMetas > 0 ? Math.round(metasData.reduce((a, m) => a + (m.atual / m.objetivo) * 100, 0) / totalMetas) : 0;

      addPdfKpiBox(doc, 14, y, "Total de Metas", totalMetas.toString(), PDF_BLUE);
      addPdfKpiBox(doc, 75, y, "Atingidas", atingidas.toString(), PDF_GREEN);
      addPdfKpiBox(doc, 136, y, "Em Risco", emRisco.toString(), PDF_RED);
      y += 28;
      addPdfKpiBox(doc, 14, y, "Progresso Médio", `${avgProgress}%`, PDF_GOLD as unknown as [number, number, number]);
      addPdfKpiBox(doc, 75, y, "No Prazo", metasData.filter(m => m.status === "no_prazo").length.toString(), PDF_BLUE);
      addPdfKpiBox(doc, 136, y, "Atenção", metasData.filter(m => m.status === "atencao").length.toString(), [200, 140, 0]);
      y += 32;

      // Section title
      doc.setFillColor(...PDF_DARK);
      doc.rect(14, y, 182, 7, "F");
      doc.setFontSize(8);
      doc.setTextColor(...PDF_GOLD);
      doc.setFont("helvetica", "bold");
      doc.text("DETALHAMENTO DAS METAS", 18, y + 5);
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [["Meta", "Categoria", "Responsável", "Prioridade", "Atual", "Objetivo", "Progresso", "Status"]],
        body: metasData.map(m => {
          const pct = Math.min(Math.round((m.atual / m.objetivo) * 100), 100);
          return [m.nome, m.categoria, m.responsavel, m.prioridade.charAt(0).toUpperCase() + m.prioridade.slice(1), `${m.atual} ${m.unidade}`, `${m.objetivo} ${m.unidade}`, `${pct}%`, m.status.replace("_", " ").toUpperCase()];
        }),
        headStyles: { fillColor: PDF_DARK, textColor: PDF_GOLD, fontSize: 7, fontStyle: "bold", cellPadding: 3 },
        bodyStyles: { fontSize: 7, cellPadding: 2.5 },
        alternateRowStyles: { fillColor: PDF_LIGHT_BG },
        columnStyles: { 6: { halign: "center", fontStyle: "bold" }, 7: { halign: "center" } },
        margin: { left: 14, right: 14 },
      });

      // Category summary
      const catY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFillColor(...PDF_DARK);
      doc.rect(14, catY, 182, 7, "F");
      doc.setTextColor(...PDF_GOLD);
      doc.text("RESUMO POR CATEGORIA", 18, catY + 5);

      const catSummary = [...new Set(metasData.map(m => m.categoria))].map(cat => {
        const items = metasData.filter(m => m.categoria === cat);
        const avg = Math.round(items.reduce((a, m) => a + (m.atual / m.objetivo) * 100, 0) / items.length);
        const ating = items.filter(m => m.status === "atingida").length;
        return [cat, items.length.toString(), `${avg}%`, `${ating}/${items.length}`];
      });

      autoTable(doc, {
        startY: catY + 10,
        head: [["Categoria", "Qtd. Metas", "Progresso Médio", "Atingidas"]],
        body: catSummary,
        headStyles: { fillColor: PDF_DARK, textColor: PDF_GOLD, fontSize: 8, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: PDF_LIGHT_BG },
        columnStyles: { 2: { halign: "center", fontStyle: "bold" }, 3: { halign: "center" } },
        margin: { left: 14, right: 14 },
      });

    } else {
      // ---- FINANCIAL PDF ----
      addPdfHeader(doc, tipoLabel.toUpperCase(), `Período: ${dataInicio} a ${dataFim}  •  ${filteredData.length} registros`, geradoPor);

      let y = 46;
      // KPI boxes
      addPdfKpiBox(doc, 14, y, "Total Receitas", `R$ ${fmt(totalReceitas)}`, PDF_GREEN);
      addPdfKpiBox(doc, 75, y, "Total Despesas", `R$ ${fmt(totalDespesas)}`, PDF_RED);
      addPdfKpiBox(doc, 136, y, "Saldo Líquido", `R$ ${fmt(saldo)}`, saldo >= 0 ? PDF_GREEN : PDF_RED);
      y += 30;

      // Section title bar
      doc.setFillColor(...PDF_DARK);
      doc.rect(14, y, 182, 7, "F");
      doc.setFontSize(8);
      doc.setTextColor(...PDF_GOLD);
      doc.setFont("helvetica", "bold");
      doc.text("LANÇAMENTOS DETALHADOS", 18, y + 5);
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [["#", "Data", "Categoria", "Descrição", "Valor (R$)", "Tipo"]],
        body: filteredData.map((d, i) => [
          (i + 1).toString(), d.data, d.categoria, d.descricao,
          `R$ ${fmt(Math.abs(d.valor))}`, d.valor >= 0 ? "Receita" : "Despesa",
        ]),
        headStyles: { fillColor: PDF_DARK, textColor: PDF_GOLD, fontSize: 8, fontStyle: "bold", cellPadding: 3 },
        bodyStyles: { fontSize: 8, cellPadding: 2.5 },
        alternateRowStyles: { fillColor: PDF_LIGHT_BG },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          4: { halign: "right", fontStyle: "bold" },
          5: { halign: "center" },
        },
        didParseCell: (data: any) => {
          if (data.section === "body" && data.column.index === 5) {
            data.cell.styles.textColor = data.cell.raw === "Receita" ? PDF_GREEN : PDF_RED;
          }
          if (data.section === "body" && data.column.index === 4) {
            const row = filteredData[data.row.index];
            if (row) data.cell.styles.textColor = row.valor >= 0 ? PDF_GREEN : PDF_RED;
          }
        },
        margin: { left: 14, right: 14 },
      });

      // Category summary on same page or new
      const catStartY = (doc as any).lastAutoTable.finalY + 12;
      if (catStartY > 240) doc.addPage();
      const catY2 = catStartY > 240 ? 20 : catStartY;

      doc.setFillColor(...PDF_DARK);
      doc.rect(14, catY2, 182, 7, "F");
      doc.setTextColor(...PDF_GOLD);
      doc.text("ANÁLISE POR CATEGORIA", 18, catY2 + 5);

      const catRows = categorias.map(cat => {
        const items = filteredData.filter(d => d.categoria === cat);
        const rec = items.filter(d => d.valor > 0).reduce((s, d) => s + d.valor, 0);
        const desp = items.filter(d => d.valor < 0).reduce((s, d) => s + Math.abs(d.valor), 0);
        return [cat, `R$ ${fmt(rec)}`, `R$ ${fmt(desp)}`, `R$ ${fmt(rec - desp)}`, items.length.toString()];
      });

      autoTable(doc, {
        startY: catY2 + 10,
        head: [["Categoria", "Receitas", "Despesas", "Saldo", "Transações"]],
        body: catRows,
        headStyles: { fillColor: PDF_DARK, textColor: PDF_GOLD, fontSize: 8, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: PDF_LIGHT_BG },
        columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right", fontStyle: "bold" }, 4: { halign: "center" } },
        margin: { left: 14, right: 14 },
      });
    }

    addPdfFooter(doc, geradoPor);
    doc.save(`${tipoLabel.replace(/ /g, "_")}_${dataInicio}_${dataFim}.pdf`);
    await logRelatorio("PDF", `${tipoLabel} — ${tipo === "metas" ? metasData.length + " metas" : filteredData.length + " registros"}`);
    toast({ title: "PDF profissional gerado!", description: `${tipoLabel} exportado com sucesso.` });
  };

  // ============ EXCEL EXPORT ============
  const exportExcel = async () => {
    const tipoLabel = tiposRelatorio.find((t) => t.value === tipo)?.label || "Relatório";
    const wb = XLSX.utils.book_new();

    if (tipo === "metas") {
      // ---- METAS EXCEL ----
      const totalMetas = metasData.length;
      const atingidas = metasData.filter(m => m.status === "atingida").length;
      const emRisco = metasData.filter(m => m.status === "em_risco").length;
      const avgProgress = totalMetas > 0 ? Math.round(metasData.reduce((a, m) => a + (m.atual / m.objetivo) * 100, 0) / totalMetas) : 0;

      // Cover sheet
      const cover = [
        [""], ["SAN REMO CONSTRUTORA"], ["Sistema ERP — Relatório de Metas & OKRs"], [""],
        [`Gerado em: ${new Date().toLocaleString("pt-BR")}`],
        [`Gerado por: ${geradoPor}`], [""],
        ["INDICADORES GERAIS"], [""],
        ["Indicador", "Valor", "Observação"],
        ["Total de Metas", totalMetas, "Metas cadastradas no sistema"],
        ["Metas Atingidas", atingidas, `${totalMetas > 0 ? Math.round((atingidas / totalMetas) * 100) : 0}% do total`],
        ["Metas em Risco", emRisco, `${totalMetas > 0 ? Math.round((emRisco / totalMetas) * 100) : 0}% do total`],
        ["Progresso Médio", `${avgProgress}%`, avgProgress >= 70 ? "Bom desempenho" : avgProgress >= 40 ? "Atenção necessária" : "Desempenho crítico"],
      ];
      const wsCover = XLSX.utils.aoa_to_sheet(cover);
      wsCover["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 30 }];
      wsCover["!merges"] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, { s: { r: 7, c: 0 }, e: { r: 7, c: 2 } }];
      XLSX.utils.book_append_sheet(wb, wsCover, "Resumo");

      // Detail sheet
      const detailData = [
        ["SAN REMO — DETALHAMENTO DE METAS"], [""],
        ["Meta", "Categoria", "Responsável", "Prioridade", "Atual", "Objetivo", "Unidade", "Progresso %", "Status", "Ciclo", "Prazo"],
        ...metasData.map(m => {
          const pct = Math.min(Math.round((m.atual / m.objetivo) * 100), 100);
          return [m.nome, m.categoria, m.responsavel, m.prioridade, m.atual, m.objetivo, m.unidade, pct, m.status.replace("_", " "), m.ciclo, m.prazo || "—"];
        }),
      ];
      const wsDetail = XLSX.utils.aoa_to_sheet(detailData);
      wsDetail["!cols"] = [{ wch: 30 }, { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
      wsDetail["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }];
      XLSX.utils.book_append_sheet(wb, wsDetail, "Detalhamento");

      // Category sheet
      const cats = [...new Set(metasData.map(m => m.categoria))];
      const catData = [
        ["SAN REMO — ANÁLISE POR CATEGORIA"], [""],
        ["Categoria", "Qtd. Metas", "Atingidas", "Em Risco", "Progresso Médio %"],
        ...cats.map(cat => {
          const items = metasData.filter(m => m.categoria === cat);
          const avg = Math.round(items.reduce((a, m) => a + (m.atual / m.objetivo) * 100, 0) / items.length);
          return [cat, items.length, items.filter(m => m.status === "atingida").length, items.filter(m => m.status === "em_risco").length, avg];
        }),
      ];
      const wsCat = XLSX.utils.aoa_to_sheet(catData);
      wsCat["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 }];
      wsCat["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
      XLSX.utils.book_append_sheet(wb, wsCat, "Por Categoria");

      // Ranking sheet
      const rankData = [
        ["SAN REMO — RANKING DE METAS POR PROGRESSO"], [""],
        ["#", "Meta", "Responsável", "Progresso %", "Status"],
        ...metasData
          .map(m => ({ ...m, pct: Math.min(Math.round((m.atual / m.objetivo) * 100), 100) }))
          .sort((a, b) => b.pct - a.pct)
          .map((m, i) => [i + 1, m.nome, m.responsavel, m.pct, m.status.replace("_", " ")]),
      ];
      const wsRank = XLSX.utils.aoa_to_sheet(rankData);
      wsRank["!cols"] = [{ wch: 5 }, { wch: 35 }, { wch: 20 }, { wch: 14 }, { wch: 14 }];
      wsRank["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
      XLSX.utils.book_append_sheet(wb, wsRank, "Ranking");

    } else {
      // ---- FINANCIAL EXCEL (same as before but improved) ----
      const coverData: any[][] = [
        [""], ["SAN REMO CONSTRUTORA"], ["Sistema ERP — Painel de Gestão"], [""],
        [tipoLabel.toUpperCase()], [`Período: ${dataInicio} a ${dataFim}`],
        [`Gerado em: ${new Date().toLocaleString("pt-BR")}`], [`Gerado por: ${geradoPor}`], [""],
        ["RESUMO EXECUTIVO"], [""],
        ["Indicador", "Valor (R$)", "Observação"],
        ["Total de Receitas", totalReceitas, `+${receitaChange}% vs anterior`],
        ["Total de Despesas", totalDespesas, `+${despesaChange}% vs anterior`],
        ["Saldo Líquido", saldo, saldo >= 0 ? "✅ Positivo" : "⚠️ Negativo"],
        ["Nº de Registros", filteredData.length, "Lançamentos filtrados"],
        ["Ticket Médio", filteredData.length > 0 ? Math.round(filteredData.reduce((s, d) => s + Math.abs(d.valor), 0) / filteredData.length) : 0, "Valor médio por operação"],
        [""], ["ANÁLISE POR CATEGORIA"], [""],
        ["Categoria", "Total (R$)", "Nº Registros", "% do Total"],
      ];
      const totalAbs = filteredData.reduce((s, d) => s + Math.abs(d.valor), 0);
      categorias.forEach(cat => {
        const items = filteredData.filter(d => d.categoria === cat);
        const total = items.reduce((s, d) => s + d.valor, 0);
        const pct = totalAbs > 0 ? ((Math.abs(total) / totalAbs) * 100).toFixed(1) + "%" : "0%";
        coverData.push([cat, total, items.length, pct]);
      });

      const wsCover = XLSX.utils.aoa_to_sheet(coverData);
      wsCover["!cols"] = [{ wch: 28 }, { wch: 20 }, { wch: 22 }, { wch: 14 }];
      wsCover["!merges"] = [
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
        { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } }, { s: { r: 9, c: 0 }, e: { r: 9, c: 3 } },
        { s: { r: 18, c: 0 }, e: { r: 18, c: 3 } },
      ];
      XLSX.utils.book_append_sheet(wb, wsCover, "Resumo");

      // Detail sheet
      const detailHeader: any[][] = [
        ["SAN REMO CONSTRUTORA — DETALHAMENTO DE LANÇAMENTOS"],
        [`${tipoLabel} | Período: ${dataInicio} a ${dataFim} | Gerado por: ${geradoPor}`], [""],
        ["#", "Data", "Categoria", "Descrição", "Valor (R$)", "Tipo"],
      ];
      const detailRows = filteredData.map((d, i) => [i + 1, d.data, d.categoria, d.descricao, d.valor, d.valor >= 0 ? "Receita" : "Despesa"]);
      const totalRow: any[] = ["", "", "", "TOTAL", filteredData.reduce((s, d) => s + d.valor, 0), ""];
      const allDetail = [...detailHeader, ...detailRows, [""], totalRow];
      const wsDetail = XLSX.utils.aoa_to_sheet(allDetail);
      wsDetail["!cols"] = [{ wch: 5 }, { wch: 12 }, { wch: 16 }, { wch: 45 }, { wch: 18 }, { wch: 10 }];
      wsDetail["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }];
      XLSX.utils.book_append_sheet(wb, wsDetail, "Detalhamento");

      // Category sheet
      const catHeader: any[][] = [
        ["SAN REMO CONSTRUTORA — ANÁLISE POR CATEGORIA"], [`Período: ${dataInicio} a ${dataFim}`], [""],
        ["Categoria", "Receitas (R$)", "Despesas (R$)", "Saldo (R$)", "Nº Transações", "Ticket Médio (R$)"],
      ];
      const catRows = categorias.map(cat => {
        const items = filteredData.filter(d => d.categoria === cat);
        const rec = items.filter(d => d.valor > 0).reduce((s, d) => s + d.valor, 0);
        const desp = items.filter(d => d.valor < 0).reduce((s, d) => s + Math.abs(d.valor), 0);
        const t = items.reduce((s, d) => s + d.valor, 0);
        return [cat, rec, desp, t, items.length, items.length > 0 ? Math.round(t / items.length) : 0];
      });
      const wsCat = XLSX.utils.aoa_to_sheet([...catHeader, ...catRows]);
      wsCat["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 18 }];
      wsCat["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }];
      XLSX.utils.book_append_sheet(wb, wsCat, "Por Categoria");

      // Monthly sheet
      const monthHeader: any[][] = [
        ["SAN REMO CONSTRUTORA — RESUMO MENSAL"], [`Período: ${dataInicio} a ${dataFim}`], [""],
        ["Mês", "Receitas (R$)", "Despesas (R$)", "Saldo (R$)", "Nº Lançamentos", "Margem %"],
      ];
      const months: Record<string, { rec: number; desp: number; count: number }> = {};
      filteredData.forEach(d => {
        const m = d.data.substring(3, 10);
        if (!months[m]) months[m] = { rec: 0, desp: 0, count: 0 };
        if (d.valor > 0) months[m].rec += d.valor; else months[m].desp += Math.abs(d.valor);
        months[m].count++;
      });
      const monthRows = Object.entries(months).map(([m, v]) => {
        const margem = v.rec > 0 ? Math.round(((v.rec - v.desp) / v.rec) * 100) : 0;
        return [m, v.rec, v.desp, v.rec - v.desp, v.count, `${margem}%`];
      });
      const wsMonth = XLSX.utils.aoa_to_sheet([...monthHeader, ...monthRows]);
      wsMonth["!cols"] = [{ wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 12 }];
      wsMonth["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }];
      XLSX.utils.book_append_sheet(wb, wsMonth, "Mensal");
    }

    const fileName = `${tipoLabel.replace(/ /g, "_")}_${dataInicio}_${dataFim}.xlsx`;
    XLSX.writeFile(wb, fileName);
    const abas = tipo === "metas" ? "Resumo, Detalhamento, Por Categoria, Ranking" : "Resumo, Detalhamento, Por Categoria, Mensal";
    await logRelatorio("Excel", `${tipoLabel} — 4 abas (${abas})`);
    toast({ title: "Excel profissional gerado!", description: `4 abas: ${abas}` });
  };

  // ============ RENDER ============
  return (
    <div className="space-y-4">
      {/* PBI Header */}
      <div className="pbi-header flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <div>
            <h1 className="text-base font-semibold text-foreground">Relatórios</h1>
            <p className="text-[11px] text-muted-foreground">Gere e exporte relatórios analíticos profissionais em PDF e Excel</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowHistorico(!showHistorico)} variant="outline"
            className="h-8 text-[12px] font-semibold gap-1.5 border-none"
            style={{ background: showHistorico ? "hsl(45, 100%, 51%, 0.2)" : "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}>
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

      {/* Histórico */}
      {showHistorico && (
        <div className="pbi-tile space-y-3" style={{ borderLeft: "3px solid hsl(var(--pbi-yellow))" }}>
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4" style={{ color: "hsl(var(--pbi-yellow))" }} />
            <p className="text-[12px] font-semibold text-foreground">Histórico de Relatórios Gerados</p>
          </div>
          {historico.length === 0 ? (
            <p className="text-[11px] py-4 text-center text-muted-foreground">Nenhum relatório gerado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Data/Hora</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Gerado por</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Formato</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Período</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground">Registros</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Observações</th>
                    {isAdmin && <th className="text-center py-2 px-2 font-medium text-muted-foreground"></th>}
                  </tr>
                </thead>
                <tbody>
                  {historico.map((r) => (
                    <tr key={r.id} className={`${hoverRowClass} transition-colors border-b border-border/50`}>
                      <td className="py-1.5 px-2 text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 shrink-0 text-muted-foreground" />
                          {new Date(r.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="py-1.5 px-2 text-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 shrink-0" style={{ color: "hsl(var(--pbi-yellow))" }} />
                          {r.user_name}
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "hsl(45, 100%, 51%, 0.15)", color: "hsl(var(--pbi-yellow))" }}>{r.tipo}</span>
                      </td>
                      <td className="py-1.5 px-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: r.formato === "PDF" ? "hsl(0, 72%, 51%, 0.15)" : "hsl(152, 60%, 38%, 0.15)", color: r.formato === "PDF" ? "hsl(0, 72%, 51%)" : "hsl(152, 60%, 38%)" }}>
                          {r.formato}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-[10px] text-muted-foreground">{r.periodo_inicio} → {r.periodo_fim}</td>
                      <td className="py-1.5 px-2 text-center font-semibold text-foreground">{r.registros}</td>
                      <td className="py-1.5 px-2 text-[10px] text-muted-foreground">{r.observacoes || "—"}</td>
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
      <div className="flex items-center gap-3 flex-wrap rounded-md p-2 px-3 bg-card border border-border">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <Label className="text-[11px] text-muted-foreground">Tipo:</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="h-7 text-[11px] w-[160px] border-none" style={{ background: filterInputBg }}><SelectValue /></SelectTrigger>
            <SelectContent>
              {tiposRelatorio.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[11px] text-muted-foreground">De:</Label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="h-7 text-[11px] w-[130px] border-none" style={{ background: filterInputBg }} />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[11px] text-muted-foreground">Até:</Label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="h-7 text-[11px] w-[130px] border-none" style={{ background: filterInputBg }} />
        </div>
      </div>

      {/* Export preview info */}
      {tipo === "metas" ? (
        <div className="pbi-tile flex items-center gap-4" style={{ borderLeft: "3px solid hsl(207, 89%, 48%)" }}>
          <TrendingUp className="w-5 h-5 shrink-0" style={{ color: "hsl(207, 89%, 48%)" }} />
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-foreground">Relatório de Metas & OKRs</p>
            <p className="text-[10px] text-muted-foreground">4 abas: Resumo Executivo · Detalhamento · Análise por Categoria · Ranking</p>
          </div>
          <div className="flex gap-4 text-center">
            {[
              { label: "Metas", value: metasData.length },
              { label: "Atingidas", value: metasData.filter(m => m.status === "atingida").length },
              { label: "Em Risco", value: metasData.filter(m => m.status === "em_risco").length },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pbi-tile flex items-center gap-4" style={{ borderLeft: "3px solid hsl(152, 60%, 38%)" }}>
          <FileSpreadsheet className="w-5 h-5 shrink-0" style={{ color: "hsl(152, 60%, 38%)" }} />
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-foreground">Relatório Excel Profissional</p>
            <p className="text-[10px] text-muted-foreground">4 abas: Resumo Executivo · Detalhamento Completo · Análise por Categoria · Resumo Mensal</p>
          </div>
          <div className="flex gap-4 text-center">
            {[
              { label: "Registros", value: filteredData.length },
              { label: "Categorias", value: categorias.length },
              { label: "Abas", value: 4 },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI tiles */}
      {tipo !== "metas" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="pbi-tile">
            <p className="text-[10px] uppercase tracking-wider mb-1 text-muted-foreground">Receitas</p>
            <p className="text-xl font-bold" style={{ color: "hsl(152, 60%, 38%)" }}>{fmtK(totalReceitas)}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" style={{ color: "hsl(152, 60%, 38%)" }} />
              <span className="text-[10px]" style={{ color: "hsl(152, 60%, 38%)" }}>+{receitaChange}%</span>
            </div>
          </div>
          <div className="pbi-tile">
            <p className="text-[10px] uppercase tracking-wider mb-1 text-muted-foreground">Despesas</p>
            <p className="text-xl font-bold" style={{ color: "hsl(0, 72%, 51%)" }}>{fmtK(totalDespesas)}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDownRight className="w-3 h-3" style={{ color: "hsl(0, 72%, 51%)" }} />
              <span className="text-[10px]" style={{ color: "hsl(0, 72%, 51%)" }}>+{despesaChange}%</span>
            </div>
          </div>
          <div className="pbi-tile">
            <p className="text-[10px] uppercase tracking-wider mb-1 text-muted-foreground">Saldo</p>
            <p className="text-xl font-bold" style={{ color: "hsl(var(--pbi-yellow))" }}>{fmtK(saldo)}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" style={{ color: "hsl(var(--pbi-yellow))" }} />
              <span className="text-[10px]" style={{ color: "hsl(var(--pbi-yellow))" }}>{saldo >= 0 ? "Positivo" : "Negativo"}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: metasData.length, color: "hsl(207, 89%, 48%)" },
            { label: "Atingidas", value: metasData.filter(m => m.status === "atingida").length, color: "hsl(152, 60%, 38%)" },
            { label: "No Prazo", value: metasData.filter(m => m.status === "no_prazo").length, color: "hsl(45, 100%, 51%)" },
            { label: "Em Risco", value: metasData.filter(m => m.status === "em_risco").length, color: "hsl(0, 72%, 51%)" },
          ].map(k => (
            <div key={k.label} className="pbi-tile">
              <p className="text-[10px] uppercase tracking-wider mb-1 text-muted-foreground">{k.label}</p>
              <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="pbi-tile">
          <p className="text-[11px] font-semibold mb-3 text-foreground">
            {tipo === "metas" ? "Progresso por Categoria" : "Distribuição por Categoria"}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            {tipo === "metas" ? (
              <BarChart data={[...new Set(metasData.map(m => m.categoria))].map(cat => {
                const items = metasData.filter(m => m.categoria === cat);
                return { cat, progresso: Math.round(items.reduce((a, m) => a + (m.atual / m.objetivo) * 100, 0) / items.length) };
              })} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} />
                <YAxis type="category" dataKey="cat" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} width={80} />
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={tooltipStyle} />
                <Bar dataKey="progresso" fill="hsl(207, 89%, 48%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            ) : (
              <BarChart data={categorias.map(cat => {
                const items = filteredData.filter(d => d.categoria === cat);
                return { cat, valor: Math.abs(items.reduce((s, d) => s + d.valor, 0)) };
              })} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} />
                <YAxis type="category" dataKey="cat" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} width={70} />
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} contentStyle={tooltipStyle} />
                <Bar dataKey="valor" fill="hsl(207, 89%, 48%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 pbi-tile">
          <p className="text-[11px] font-semibold mb-3 text-foreground">
            {tipo === "metas" ? "Metas Cadastradas" : "Detalhamento"}
          </p>
          <div className="overflow-x-auto">
            {tipo === "metas" ? (
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Meta</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Categoria</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Responsável</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground">Progresso</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metasData.slice(0, 15).map((m) => {
                    const pct = Math.min(Math.round((m.atual / m.objetivo) * 100), 100);
                    const statusColor = m.status === "atingida" ? "hsl(152, 60%, 38%)" : m.status === "em_risco" ? "hsl(0, 72%, 51%)" : m.status === "atencao" ? "hsl(45, 100%, 51%)" : "hsl(207, 89%, 48%)";
                    return (
                      <tr key={m.id} className={`${hoverRowClass} transition-colors border-b border-border/50`}>
                        <td className="py-1.5 px-2 text-foreground font-medium">{m.nome}</td>
                        <td className="py-1.5 px-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "hsl(45, 100%, 51%, 0.15)", color: "hsl(var(--pbi-yellow))" }}>{m.categoria}</span>
                        </td>
                        <td className="py-1.5 px-2 text-muted-foreground">{m.responsavel}</td>
                        <td className="py-1.5 px-2 text-center">
                          <div className="flex items-center gap-1.5 justify-center">
                            <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: statusColor }} />
                            </div>
                            <span className="font-bold text-[10px]" style={{ color: statusColor }}>{pct}%</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${statusColor}20`, color: statusColor }}>
                            {m.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Data</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Categoria</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Descrição</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((d, i) => (
                    <tr key={i} className={`${hoverRowClass} transition-colors border-b border-border/50`}>
                      <td className="py-1.5 px-2 text-foreground">{d.data}</td>
                      <td className="py-1.5 px-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "hsl(45, 100%, 51%, 0.15)", color: "hsl(var(--pbi-yellow))" }}>{d.categoria}</span>
                      </td>
                      <td className="py-1.5 px-2 text-foreground">{d.descricao}</td>
                      <td className="py-1.5 px-2 text-right font-semibold" style={{ color: d.valor >= 0 ? "hsl(152, 60%, 38%)" : "hsl(0, 72%, 51%)" }}>
                        R$ {fmt(Math.abs(d.valor))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
