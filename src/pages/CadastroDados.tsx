import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataEntry {
  id: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  responsavel: string;
}

const categorias = [
  "Vendas",
  "Compras",
  "Despesas",
  "Receitas",
  "Produção",
  "Estoque",
  "RH",
  "Projetos",
];

const responsaveis = ["João", "Maria", "Carlos", "Ana"];

export default function CadastroDados() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [form, setForm] = useState({
    categoria: "",
    descricao: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    responsavel: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoria || !form.descricao || !form.valor) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha categoria, descrição e valor.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: DataEntry = {
      id: Date.now().toString(),
      categoria: form.categoria,
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      data: form.data,
      responsavel: form.responsavel,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setForm({
      categoria: "",
      descricao: "",
      valor: "",
      data: new Date().toISOString().split("T")[0],
      responsavel: "",
    });

    toast({
      title: "Dado registrado!",
      description: `${newEntry.categoria}: ${newEntry.descricao}`,
    });
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cadastro de Dados</h1>
        <p className="text-sm text-muted-foreground mt-1 font-sans">
          Insira dados de forma rápida pelo celular ou computador
        </p>
      </div>

      {/* Formulário */}
      <Card className="erp-card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent" />
            Novo Registro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-sans text-sm">Categoria *</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-sans text-sm">Responsável</Label>
                <Select value={form.responsavel} onValueChange={(v) => setForm({ ...form, responsavel: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {responsaveis.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-sans text-sm">Descrição *</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descreva o dado..."
                className="resize-none h-20"
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-sans text-sm">Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-sans text-sm">Data</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-gold-dark font-sans font-semibold">
              <Save className="w-4 h-4 mr-2" />
              Salvar Registro
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de registros recentes */}
      {entries.length > 0 && (
        <Card className="erp-card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Registros Recentes ({entries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent font-sans">
                        {entry.categoria}
                      </span>
                      {entry.responsavel && (
                        <span className="text-xs text-muted-foreground font-sans">{entry.responsavel}</span>
                      )}
                    </div>
                    <p className="text-sm text-foreground mt-1 font-sans">{entry.descricao}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-foreground font-sans">
                        R$ {entry.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-muted-foreground font-sans">
                        {new Date(entry.data).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeEntry(entry.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
