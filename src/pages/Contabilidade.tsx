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
  { id: "NF-2024-0891", cliente: "Tech Solutions Ltda", valor: 12500, status: "pago", data: "15/12/2024", vencimento: "15/01/2025" },
  { id: "NF-2024-0890", cliente: "Indústria Beta S.A.", valor: 34200, status: "pendente", data: "14/12/2024", vencimento: "14/01/2025" },
  { id: "NF-2024-0889", cliente: "Comércio Alfa ME", valor: 8750, status: "atrasado", data: "10/12/2024", vencimento: "10/01/2025" },
  { id: "NF-2024-0888", cliente: "Global Parts Ltda", valor: 19300, status: "pago", data: "08/12/2024", vencimento: "08/01/2025" },
  { id: "NF-2024-0887", cliente: "Distribuidora Central", valor: 45600, status: "pendente", data: "05/12/2024", vencimento: "05/01/2025" },
  { id: "NF-2024-0886", cliente: "Metalúrgica Norte", valor: 27800, status: "pago", data: "03/12/2024", vencimento: "03/01/2025" },
  { id: "NF-2024-0885", cliente: "Solar Energia S.A.", valor: 15400, status: "cancelado", data: "01/12/2024", vencimento: "01/01/2025" },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pago: { label: "Pago", variant: "default" },
  pendente: { label: "Pendente", variant: "secondary" },
  atrasado: { label: "Atrasado", variant: "destructive" },
  cancelado: { label: "Cancelado", variant: "outline" },
};

const summaryCards = [
  { title: "Total Faturado", value: "R$ 163.550", icon: DollarSign, change: "+18.3%" },
  { title: "A Receber", value: "R$ 79.800", icon: CreditCard, change: "+5.2%" },
  { title: "Notas Emitidas", value: "42", icon: FileText, change: "+12%" },
  { title: "Margem Líquida", value: "32.4%", icon: TrendingUp, change: "+2.1%" },
];

export default function Contabilidade() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contabilidade</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão financeira e faturamento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-1.5" /> Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1.5" /> Exportar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Nova Nota Fiscal
          </Button>
        </div>
      </div>

      {/* Summary */}
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

      {/* Table */}
      <Card className="erp-card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Notas Fiscais Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
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
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
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
