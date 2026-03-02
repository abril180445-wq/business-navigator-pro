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
import { Plus, Filter, ShoppingCart, Package, TrendingUp, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const salesOrders = [
  { id: "PV-2024-0342", cliente: "Tech Solutions", itens: 5, valor: 23400, status: "confirmado", data: "15/12/2024" },
  { id: "PV-2024-0341", cliente: "Indústria Beta", itens: 12, valor: 56700, status: "rascunho", data: "14/12/2024" },
  { id: "PV-2024-0340", cliente: "Comércio Alfa", itens: 3, valor: 8900, status: "entregue", data: "13/12/2024" },
  { id: "PV-2024-0339", cliente: "Global Parts", itens: 8, valor: 34200, status: "confirmado", data: "12/12/2024" },
  { id: "PV-2024-0338", cliente: "Solar Energia", itens: 2, valor: 15600, status: "cancelado", data: "11/12/2024" },
];

const purchaseOrders = [
  { id: "OC-2024-0198", fornecedor: "Fornecedor ABC", itens: 20, valor: 45000, status: "recebido", data: "15/12/2024" },
  { id: "OC-2024-0197", fornecedor: "Parts Global", itens: 8, valor: 12300, status: "enviado", data: "14/12/2024" },
  { id: "OC-2024-0196", fornecedor: "Metal Supply", itens: 15, valor: 28900, status: "pendente", data: "13/12/2024" },
  { id: "OC-2024-0195", fornecedor: "Tech Components", itens: 30, valor: 67800, status: "recebido", data: "12/12/2024" },
];

const stockItems = [
  { codigo: "SKU-001", nome: "Parafuso M8x30", armazem: "Central", qtd: 15000, minimo: 5000, unidade: "un" },
  { codigo: "SKU-002", nome: "Chapa Aço 2mm", armazem: "Central", qtd: 230, minimo: 100, unidade: "m²" },
  { codigo: "SKU-003", nome: "Motor Elétrico 5CV", armazem: "Fábrica", qtd: 12, minimo: 5, unidade: "un" },
  { codigo: "SKU-004", nome: "Rolamento 6205", armazem: "Central", qtd: 450, minimo: 200, unidade: "un" },
  { codigo: "SKU-005", nome: "Tinta Epóxi Cinza", armazem: "Fábrica", qtd: 85, minimo: 50, unidade: "L" },
];

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmado: "default",
  rascunho: "secondary",
  entregue: "default",
  cancelado: "destructive",
  recebido: "default",
  enviado: "secondary",
  pendente: "outline",
};

const summaryCards = [
  { title: "Vendas do Mês", value: "R$ 138.800", icon: ShoppingCart },
  { title: "Compras do Mês", value: "R$ 154.000", icon: Package },
  { title: "Margem Bruta", value: "28.6%", icon: TrendingUp },
  { title: "Clientes Ativos", value: "127", icon: Users },
];

export default function Pedidos() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Pedidos</h1>
          <p className="text-sm text-muted-foreground mt-1">Vendas, compras e controle de estoque</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1.5" /> Filtrar</Button>
          <Button size="sm"><Plus className="w-4 h-4 mr-1.5" /> Novo Pedido</Button>
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="vendas">
        <TabsList>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="compras">Compras</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas">
          <Card className="erp-card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Pedidos de Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium text-primary">{order.id}</TableCell>
                      <TableCell>{order.cliente}</TableCell>
                      <TableCell className="text-muted-foreground">{order.data}</TableCell>
                      <TableCell>{order.itens}</TableCell>
                      <TableCell className="text-right font-medium">R$ {order.valor.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={statusColors[order.status]}>{order.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compras">
          <Card className="erp-card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Ordens de Compra</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium text-primary">{order.id}</TableCell>
                      <TableCell>{order.fornecedor}</TableCell>
                      <TableCell className="text-muted-foreground">{order.data}</TableCell>
                      <TableCell>{order.itens}</TableCell>
                      <TableCell className="text-right font-medium">R$ {order.valor.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={statusColors[order.status]}>{order.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque">
          <Card className="erp-card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Itens em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Armazém</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems.map((item) => (
                    <TableRow key={item.codigo} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium text-primary">{item.codigo}</TableCell>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{item.armazem}</TableCell>
                      <TableCell className="text-right">{item.qtd.toLocaleString()} {item.unidade}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.minimo.toLocaleString()} {item.unidade}</TableCell>
                      <TableCell>
                        <Badge variant={item.qtd > item.minimo * 1.5 ? "default" : item.qtd > item.minimo ? "secondary" : "destructive"}>
                          {item.qtd > item.minimo * 1.5 ? "OK" : item.qtd > item.minimo ? "Baixo" : "Crítico"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
