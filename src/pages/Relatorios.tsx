import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Download, Calendar, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  { value: "vendas", label: "Relatório de Vendas de Unidades" },
  { value: "despesas", label: "Relatório de Custos de Obra" },
  { value: "metas", label: "Relatório de Metas" },
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

  const exportPDF = () => {
    const doc = new jsPDF();
    const tipoLabel = tiposRelatorio.find((t) => t.value === tipo)?.label || "Relatório";

    // Header
    doc.setFillColor(30, 41, 66);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(207, 172, 93);
    doc.setFontSize(18);
    doc.text("San Remo Construtora", 14, 16);
    doc.setFontSize(11);
    doc.setTextColor(180, 180, 200);
    doc.text(tipoLabel, 14, 25);
    doc.text(`Período: ${dataInicio} a ${dataFim}`, 14, 31);

    // Table
    autoTable(doc, {
      startY: 42,
      head: [["Data", "Categoria", "Descrição", "Valor (R$)"]],
      body: filteredData.map((d) => [
        d.data,
        d.categoria,
        d.descricao,
        d.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
      ]),
      headStyles: { fillColor: [30, 41, 66], textColor: [207, 172, 93], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Receitas: R$ ${totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 14, finalY);
    doc.text(`Total Despesas: R$ ${totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 14, finalY + 6);
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 66);
    doc.text(
      `Saldo: R$ ${(totalReceitas - totalDespesas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      14,
      finalY + 14
    );

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")} — ERP San Remo`, 14, 285);

    doc.save(`${tipoLabel.replace(/ /g, "_")}_${dataInicio}_${dataFim}.pdf`);
    toast({ title: "PDF gerado!", description: `${tipoLabel} exportado com sucesso.` });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1 font-sans">Gere e exporte relatórios em PDF</p>
      </div>

      {/* Filtros */}
      <Card className="erp-card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="font-sans text-sm">Tipo de Relatório</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposRelatorio.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-sans text-sm">Data Início</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="font-sans text-sm">Data Fim</Label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="erp-card-shadow">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" /> Pré-visualização
          </CardTitle>
          <Button onClick={exportPDF} className="bg-accent text-accent-foreground hover:bg-gold-dark font-sans font-semibold">
            <Download className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
        </CardHeader>
        <CardContent>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-success/10 text-center">
              <p className="text-xs text-muted-foreground font-sans">Receitas</p>
              <p className="text-lg font-bold text-success font-sans">
                R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 text-center">
              <p className="text-xs text-muted-foreground font-sans">Despesas</p>
              <p className="text-lg font-bold text-destructive font-sans">
                R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-accent/10 text-center">
              <p className="text-xs text-muted-foreground font-sans">Saldo</p>
              <p className="text-lg font-bold text-accent font-sans">
                R$ {(totalReceitas - totalDespesas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Data</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Categoria</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Descrição</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((d, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-3 text-foreground">{d.data}</td>
                    <td className="py-2 px-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
                        {d.categoria}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-foreground">{d.descricao}</td>
                    <td className={`py-2 px-3 text-right font-semibold ${d.valor >= 0 ? "text-success" : "text-destructive"}`}>
                      R$ {Math.abs(d.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
