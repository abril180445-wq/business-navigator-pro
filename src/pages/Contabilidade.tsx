import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download, DollarSign, CreditCard, FileText, TrendingUp } from "lucide-react";

const invoices = [
  { id: "NF-2026-0142", cliente: "Res. Vila Serena — Unid. 302", valor: 385000, status: "pago", data: "15/02/2026", vencimento: "15/03/2026" },
  { id: "NF-2026-0141", cliente: "Ed. Monte Carlo — Unid. 1201", valor: 520000, status: "pendente", data: "14/02/2026", vencimento: "14/03/2026" },
  { id: "NF-2026-0140", cliente: "Cond. Jardim Real — Lote 15", valor: 180000, status: "atrasado", data: "10/02/2026", vencimento: "10/03/2026" },
  { id: "NF-2026-0139", cliente: "Res. Vila Serena — Unid. 501", valor: 395000, status: "pago", data: "08/02/2026", vencimento: "08/03/2026" },
  { id: "NF-2026-0138", cliente: "Concreteira Central — CT-042", valor: 145000, status: "pendente", data: "05/02/2026", vencimento: "05/03/2026" },
  { id: "NF-2026-0137", cliente: "Aço Forte Ltda — CT-041", valor: 278000, status: "pago", data: "03/02/2026", vencimento: "03/03/2026" },
  { id: "NF-2026-0136", cliente: "Ed. Torre Dourada — Sinal", valor: 85000, status: "cancelado", data: "01/02/2026", vencimento: "01/03/2026" },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pago: { label: "Pago", variant: "default" },
  pendente: { label: "Pendente", variant: "secondary" },
  atrasado: { label: "Atrasado", variant: "destructive" },
  cancelado: { label: "Cancelado", variant: "outline" },
};

const summaryCards = [
  { title: "Faturamento Mensal", value: "R$ 2,1M", icon: DollarSign, change: "+14.8%" },
  { title: "Contas a Receber", value: "R$ 1,85M", icon: CreditCard, change: "+8.2%" },
  { title: "Notas Emitidas", value: "67", icon: FileText, change: "+15%" },
  { title: "Margem de Obra", value: "28.4%", icon: TrendingUp, change: "+1.6%" },
];

export default function Contabilidade() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Faturamento, contas e fluxo de caixa das obras</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1.5" /> Filtrar</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1.5" /> Exportar</Button>
          <Button size="sm"><Plus className="w-4 h-4 mr-1.5" /> Nova NF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="erp-card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xl font-bold text-card-foreground mt-2">{card.value}</p>
                <p className="text-xs text-success font-medium mt-1">{card.change} vs mês anterior</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="erp-card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Notas Fiscais e Pagamentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => {
                const status = statusConfig[inv.status];
                return (
                  <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium text-primary">{inv.id}</TableCell>
                    <TableCell>{inv.cliente}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.data}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.vencimento}</TableCell>
                    <TableCell className="text-right font-medium">R$ {inv.valor.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
