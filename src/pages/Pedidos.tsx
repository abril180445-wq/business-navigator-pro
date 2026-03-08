import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Filter, Building2, FileText, TrendingUp, Users, ArrowUpRight, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Empreendimento = {
  id: string; codigo: string; nome: string; fase: string; unidades: number;
  vendidas: number; status: string; previsao: string | null; endereco: string;
  created_by: string; created_at: string;
};
type Contrato = {
  id: string; numero: string; fornecedor: string; objeto: string; valor: number;
  status: string; data_inicio: string; data_fim: string | null;
  empreendimento_id: string | null; created_by: string; created_at: string;
};
type Material = {
  id: string; codigo: string; nome: string; canteiro: string; quantidade: number;
  minimo: number; unidade: string; created_by: string; created_at: string;
};

const statusColors: Record<string, { color: string; bg: string }> = {
  "em andamento": { color: "hsl(207, 89%, 48%)", bg: "hsl(207, 89%, 48%, 0.15)" },
  planejamento: { color: "hsl(45, 100%, 51%)", bg: "hsl(45, 100%, 51%, 0.15)" },
  concluído: { color: "hsl(152, 60%, 38%)", bg: "hsl(152, 60%, 38%, 0.15)" },
  ativo: { color: "hsl(207, 89%, 48%)", bg: "hsl(207, 89%, 48%, 0.15)" },
};

type TabKey = "empreendimentos" | "contratos" | "materiais";

export default function Pedidos() {
  const { user, userRole } = useAuth();
  const canEdit = userRole === "admin" || userRole === "master";
  const [activeTab, setActiveTab] = useState<TabKey>("empreendimentos");
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    const [e, c, m] = await Promise.all([
      supabase.from("empreendimentos").select("*").order("created_at", { ascending: false }),
      supabase.from("contratos").select("*").order("created_at", { ascending: false }),
      supabase.from("materiais").select("*").order("created_at", { ascending: false }),
    ]);
    if (e.data) setEmpreendimentos(e.data as any);
    if (c.data) setContratos(c.data as any);
    if (m.data) setMateriais(m.data as any);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async () => {
    if (!user) return;
    try {
      if (activeTab === "empreendimentos") {
        const { error } = await supabase.from("empreendimentos").insert({
          codigo: formData.codigo || "",
          nome: formData.nome || "",
          fase: formData.fase || "Projeto",
          unidades: parseInt(formData.unidades || "0"),
          vendidas: parseInt(formData.vendidas || "0"),
          status: formData.status || "planejamento",
          previsao: formData.previsao || null,
          endereco: formData.endereco || "",
          created_by: user.id,
        } as any);
        if (error) throw error;
      } else if (activeTab === "contratos") {
        const { error } = await supabase.from("contratos").insert({
          numero: formData.numero || "",
          fornecedor: formData.fornecedor || "",
          objeto: formData.objeto || "",
          valor: parseFloat(formData.valor || "0"),
          status: formData.status || "ativo",
          data_inicio: formData.data_inicio || new Date().toISOString().split("T")[0],
          data_fim: formData.data_fim || null,
          created_by: user.id,
        } as any);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("materiais").insert({
          codigo: formData.codigo || "",
          nome: formData.nome || "",
          canteiro: formData.canteiro || "",
          quantidade: parseFloat(formData.quantidade || "0"),
          minimo: parseFloat(formData.minimo || "0"),
          unidade: formData.unidade || "un",
          created_by: user.id,
        } as any);
        if (error) throw error;
      }
      toast.success("Registro adicionado!");
      setFormData({});
      setShowForm(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (table: string, id: string) => {
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Removido!"); loadData(); }
  };

  const totalEmpreendimentos = empreendimentos.filter(e => e.status !== "concluído").length;
  const totalContratos = contratos.filter(c => c.status === "ativo").length;
  const totalUnidades = empreendimentos.reduce((s, e) => s + e.unidades, 0);
  const totalVendidas = empreendimentos.reduce((s, e) => s + e.vendidas, 0);

  const summaryCards = [
    { title: "Empreendimentos Ativos", value: String(totalEmpreendimentos), icon: Building2 },
    { title: "Contratos Vigentes", value: String(totalContratos), icon: FileText },
    { title: "Unidades Totais", value: String(totalUnidades), icon: TrendingUp },
    { title: "Unidades Vendidas", value: String(totalVendidas), icon: Users },
  ];

  const formTitle = activeTab === "empreendimentos" ? "Novo Empreendimento" : activeTab === "contratos" ? "Novo Contrato" : "Novo Material";

  return (
    <div className="space-y-4">
      <div className="pbi-header flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <div>
            <h1 className="text-base font-semibold text-white">Gestão de Obras</h1>
            <p className="text-[11px]" style={{ color: "hsl(0, 0%, 72%)" }}>Empreendimentos, contratos e materiais</p>
          </div>
        </div>
        {canEdit && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-[11px] font-semibold gap-1" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>
                <Plus className="w-3 h-3" /> {formTitle}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{formTitle}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {activeTab === "empreendimentos" ? (
                  <>
                    <Input placeholder="Código (ex: OBR-001)" value={formData.codigo || ""} onChange={e => setFormData(p => ({ ...p, codigo: e.target.value }))} />
                    <Input placeholder="Nome do Empreendimento" value={formData.nome || ""} onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))} />
                    <Select value={formData.fase || "Projeto"} onValueChange={v => setFormData(p => ({ ...p, fase: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Projeto", "Fundação", "Estrutura", "Acabamento", "Entregue"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" placeholder="Unidades" value={formData.unidades || ""} onChange={e => setFormData(p => ({ ...p, unidades: e.target.value }))} />
                      <Input type="number" placeholder="Vendidas" value={formData.vendidas || ""} onChange={e => setFormData(p => ({ ...p, vendidas: e.target.value }))} />
                    </div>
                    <Select value={formData.status || "planejamento"} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planejamento">Planejamento</SelectItem>
                        <SelectItem value="em andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluído">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="date" placeholder="Previsão" value={formData.previsao || ""} onChange={e => setFormData(p => ({ ...p, previsao: e.target.value }))} />
                  </>
                ) : activeTab === "contratos" ? (
                  <>
                    <Input placeholder="Número do contrato" value={formData.numero || ""} onChange={e => setFormData(p => ({ ...p, numero: e.target.value }))} />
                    <Input placeholder="Fornecedor" value={formData.fornecedor || ""} onChange={e => setFormData(p => ({ ...p, fornecedor: e.target.value }))} />
                    <Input placeholder="Objeto" value={formData.objeto || ""} onChange={e => setFormData(p => ({ ...p, objeto: e.target.value }))} />
                    <Input type="number" placeholder="Valor" value={formData.valor || ""} onChange={e => setFormData(p => ({ ...p, valor: e.target.value }))} />
                    <Select value={formData.status || "ativo"} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="concluído">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="date" value={formData.data_inicio || ""} onChange={e => setFormData(p => ({ ...p, data_inicio: e.target.value }))} />
                  </>
                ) : (
                  <>
                    <Input placeholder="Código (ex: MAT-001)" value={formData.codigo || ""} onChange={e => setFormData(p => ({ ...p, codigo: e.target.value }))} />
                    <Input placeholder="Nome do material" value={formData.nome || ""} onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))} />
                    <Input placeholder="Canteiro/Local" value={formData.canteiro || ""} onChange={e => setFormData(p => ({ ...p, canteiro: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" placeholder="Quantidade" value={formData.quantidade || ""} onChange={e => setFormData(p => ({ ...p, quantidade: e.target.value }))} />
                      <Input type="number" placeholder="Mínimo" value={formData.minimo || ""} onChange={e => setFormData(p => ({ ...p, minimo: e.target.value }))} />
                    </div>
                    <Input placeholder="Unidade (un, kg, m³, sacos)" value={formData.unidade || ""} onChange={e => setFormData(p => ({ ...p, unidade: e.target.value }))} />
                  </>
                )}
                <Button onClick={handleAdd} className="w-full">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="pbi-tile">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{card.title}</p>
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="pbi-tabs-scroll bg-card border border-border rounded-md">
        {([
          { key: "empreendimentos" as TabKey, label: "Empreendimentos" },
          { key: "contratos" as TabKey, label: "Contratos" },
          { key: "materiais" as TabKey, label: "Materiais" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-1.5 rounded text-[11px] font-medium transition-colors"
            style={{
              background: activeTab === tab.key ? "hsl(var(--pbi-yellow))" : "transparent",
              color: activeTab === tab.key ? "hsl(var(--pbi-dark))" : undefined,
            }}
          >
            <span className={activeTab !== tab.key ? "text-muted-foreground" : ""}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Table content */}
      <div className="pbi-tile">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
          </div>
        ) : activeTab === "empreendimentos" ? (
          <>
            <p className="text-[11px] font-semibold mb-3 text-foreground">Empreendimentos ({empreendimentos.length})</p>
            {empreendimentos.length === 0 ? (
              <p className="text-[11px] text-muted-foreground py-4 text-center">Nenhum empreendimento cadastrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border">
                      {["Código", "Empreendimento", "Fase", "Unidades", "Vendidas", "Previsão", "Status", ""].map((h) => (
                        <th key={h} className="text-left py-2 px-2 font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {empreendimentos.map((e) => {
                      const pct = e.unidades > 0 ? Math.round((e.vendidas / e.unidades) * 100) : 0;
                      const st = statusColors[e.status] || statusColors["planejamento"];
                      return (
                        <tr key={e.id} className="pbi-row-hover transition-colors border-b border-border/50">
                          <td className="py-1.5 px-2 font-medium" style={{ color: "hsl(207, 89%, 48%)" }}>{e.codigo}</td>
                          <td className="py-1.5 px-2 font-medium text-foreground">{e.nome}</td>
                          <td className="py-1.5 px-2 text-muted-foreground">{e.fase}</td>
                          <td className="py-1.5 px-2 text-foreground">{e.unidades}</td>
                          <td className="py-1.5 px-2">
                            <div className="flex items-center gap-2">
                              <span className="text-foreground">{e.vendidas}</span>
                              <div className="w-16 h-1.5 rounded-full bg-secondary">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "hsl(207, 89%, 48%)" }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-1.5 px-2 text-muted-foreground">{e.previsao ? new Date(e.previsao).toLocaleDateString("pt-BR") : "—"}</td>
                          <td className="py-1.5 px-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{e.status}</span>
                          </td>
                          <td className="py-1.5 px-2">
                            {canEdit && <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDelete("empreendimentos", e.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : activeTab === "contratos" ? (
          <>
            <p className="text-[11px] font-semibold mb-3 text-foreground">Contratos ({contratos.length})</p>
            {contratos.length === 0 ? (
              <p className="text-[11px] text-muted-foreground py-4 text-center">Nenhum contrato cadastrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border">
                      {["Contrato", "Fornecedor", "Objeto", "Data", "Valor", "Status", ""].map((h) => (
                        <th key={h} className={`py-2 px-2 font-medium text-muted-foreground ${h === "Valor" ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contratos.map((c) => {
                      const st = statusColors[c.status] || statusColors["ativo"];
                      return (
                        <tr key={c.id} className="pbi-row-hover transition-colors border-b border-border/50">
                          <td className="py-1.5 px-2 font-medium" style={{ color: "hsl(207, 89%, 48%)" }}>{c.numero}</td>
                          <td className="py-1.5 px-2 text-foreground">{c.fornecedor}</td>
                          <td className="py-1.5 px-2 max-w-[200px] truncate text-muted-foreground">{c.objeto}</td>
                          <td className="py-1.5 px-2 text-muted-foreground">{new Date(c.data_inicio).toLocaleDateString("pt-BR")}</td>
                          <td className="py-1.5 px-2 text-right font-medium text-foreground">R$ {Number(c.valor).toLocaleString("pt-BR")}</td>
                          <td className="py-1.5 px-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{c.status}</span>
                          </td>
                          <td className="py-1.5 px-2">
                            {canEdit && <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDelete("contratos", c.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-[11px] font-semibold mb-3 text-foreground">Estoque de Materiais ({materiais.length})</p>
            {materiais.length === 0 ? (
              <p className="text-[11px] text-muted-foreground py-4 text-center">Nenhum material cadastrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border">
                      {["Código", "Material", "Canteiro", "Quantidade", "Mínimo", "Status", ""].map((h) => (
                        <th key={h} className={`py-2 px-2 font-medium text-muted-foreground ${h === "Quantidade" || h === "Mínimo" ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {materiais.map((item) => {
                      const isOk = item.quantidade > item.minimo * 1.5;
                      const isLow = item.quantidade > item.minimo;
                      const st = isOk
                        ? { label: "OK", color: "hsl(152, 60%, 38%)", bg: "hsl(152, 60%, 38%, 0.15)" }
                        : isLow
                        ? { label: "Baixo", color: "hsl(45, 100%, 51%)", bg: "hsl(45, 100%, 51%, 0.15)" }
                        : { label: "Crítico", color: "hsl(0, 72%, 51%)", bg: "hsl(0, 72%, 51%, 0.15)" };
                      return (
                        <tr key={item.id} className="pbi-row-hover transition-colors border-b border-border/50">
                          <td className="py-1.5 px-2 font-medium" style={{ color: "hsl(207, 89%, 48%)" }}>{item.codigo}</td>
                          <td className="py-1.5 px-2 text-foreground">{item.nome}</td>
                          <td className="py-1.5 px-2 text-muted-foreground">{item.canteiro}</td>
                          <td className="py-1.5 px-2 text-right text-foreground">{Number(item.quantidade).toLocaleString("pt-BR")} {item.unidade}</td>
                          <td className="py-1.5 px-2 text-right text-muted-foreground">{Number(item.minimo).toLocaleString("pt-BR")} {item.unidade}</td>
                          <td className="py-1.5 px-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                          </td>
                          <td className="py-1.5 px-2">
                            {canEdit && <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDelete("materiais", item.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
