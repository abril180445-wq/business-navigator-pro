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
import { Plus, Filter, Building2, FileText, TrendingUp, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const empreendimentos = [
  { id: "OBR-001", nome: "Res. Vila Serena", fase: "Acabamento", unidades: 120, vendidas: 98, status: "em andamento", previsao: "08/2026" },
  { id: "OBR-002", nome: "Ed. Monte Carlo", fase: "Estrutura", unidades: 80, vendidas: 52, status: "em andamento", previsao: "03/2027" },
  { id: "OBR-003", nome: "Cond. Jardim Real", fase: "Fundação", unidades: 200, vendidas: 45, status: "em andamento", previsao: "12/2027" },
  { id: "OBR-004", nome: "Res. Bela Vista", fase: "Entregue", unidades: 64, vendidas: 64, status: "concluído", previsao: "01/2026" },
  { id: "OBR-005", nome: "Ed. Torre Dourada", fase: "Projeto", unidades: 96, vendidas: 12, status: "planejamento", previsao: "06/2028" },
];

const contratos = [
  { id: "CT-2026-042", fornecedor: "Concreteira Central", objeto: "Fornecimento de concreto usinado", valor: 890000, status: "ativo", data: "15/01/2026" },
  { id: "CT-2026-041", fornecedor: "Aço Forte Ltda", objeto: "Aço CA-50 e CA-60", valor: 1250000, status: "ativo", data: "10/01/2026" },
  { id: "CT-2026-040", fornecedor: "Terraplan Serviços", objeto: "Terraplanagem Lote 22", valor: 340000, status: "concluído", data: "05/01/2026" },
  { id: "CT-2026-039", fornecedor: "Elétrica Master", objeto: "Instalações elétricas Bloco A-D", valor: 560000, status: "ativo", data: "02/01/2026" },
];

const materiais = [
  { codigo: "MAT-001", nome: "Cimento CP-II 50kg", armazem: "Canteiro Vila Serena", qtd: 2500, minimo: 500, unidade: "sacos" },
  { codigo: "MAT-002", nome: "Aço CA-50 10mm", armazem: "Canteiro Monte Carlo", qtd: 18000, minimo: 5000, unidade: "kg" },
  { codigo: "MAT-003", nome: "Tijolo cerâmico 9 furos", armazem: "Canteiro Vila Serena", qtd: 45000, minimo: 10000, unidade: "un" },
  { codigo: "MAT-004", nome: "Areia média lavada", armazem: "Canteiro Jardim Real", qtd: 120, minimo: 50, unidade: "m³" },
  { codigo: "MAT-005", nome: "Brita nº 1", armazem: "Canteiro Monte Carlo", qtd: 85, minimo: 40, unidade: "m³" },
];

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "em andamento": "default",
  planejamento: "secondary",
  concluído: "default",
  cancelado: "destructive",
  ativo: "default",
  pendente: "outline",
};

const summaryCards = [
  { title: "Empreendimentos Ativos", value: "8", icon: Building2 },
  { title: "Contratos Vigentes", value: "24", icon: FileText },
  { title: "VGV Total", value: "R$ 285M", icon: TrendingUp },
  { title: "Clientes Compradores", value: "312", icon: Users },
];

export default function Pedidos() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Obras</h1>
          <p className="text-sm text-muted-foreground mt-1">Empreendimentos, contratos e materiais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1.5" /> Filtrar</Button>
          <Button size="sm"><Plus className="w-4 h-4 mr-1.5" /> Nova Obra</Button>
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

      <Tabs defaultValue="empreendimentos">
        <TabsList>
          <TabsTrigger value="empreendimentos">Empreendimentos</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
        </TabsList>

        <TabsContent value="empreendimentos">
          <Card className="erp-card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Empreendimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Empreendimento</TableHead>
                    <TableHead>Fase</TableHead>
                    <TableHead>Unidades</TableHead>
                    <TableHead>Vendidas</TableHead>
                    <TableHead>Previsão</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empreendimentos.map((e) => (
                    <TableRow key={e.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium text-primary">{e.id}</TableCell>
                      <TableCell className="font-medium">{e.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{e.fase}</TableCell>
                      <TableCell>{e.unidades}</TableCell>
                      <TableCell>{e.vendidas}</TableCell>
                      <TableCell className="text-muted-foreground">{e.previsao}</TableCell>
                      <TableCell><Badge variant={statusColors[e.status]}>{e.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contratos">
          <Card className="erp-card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Contratos com Fornecedores</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratos.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium text-primary">{c.id}</TableCell>
                      <TableCell>{c.fornecedor}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{c.objeto}</TableCell>
                      <TableCell className="text-muted-foreground">{c.data}</TableCell>
                      <TableCell className="text-right font-medium">R$ {c.valor.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={statusColors[c.status]}>{c.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materiais">
          <Card className="erp-card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Estoque de Materiais</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Canteiro</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materiais.map((item) => (
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
