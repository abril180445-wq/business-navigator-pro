import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Building2, FileText, TrendingUp, Users, ChevronDown, ArrowUpRight } from "lucide-react";

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

const statusColors: Record<string, { color: string; bg: string }> = {
  "em andamento": { color: "hsl(207, 89%, 48%)", bg: "hsl(207, 89%, 48%, 0.15)" },
  planejamento: { color: "hsl(45, 100%, 51%)", bg: "hsl(45, 100%, 51%, 0.15)" },
  concluído: { color: "hsl(152, 60%, 38%)", bg: "hsl(152, 60%, 38%, 0.15)" },
  ativo: { color: "hsl(207, 89%, 48%)", bg: "hsl(207, 89%, 48%, 0.15)" },
};

const summaryCards = [
  { title: "Empreendimentos Ativos", value: "8", icon: Building2, change: "+2" },
  { title: "Contratos Vigentes", value: "24", icon: FileText, change: "+5" },
  { title: "VGV Total", value: "R$ 285M", icon: TrendingUp, change: "+12%" },
  { title: "Clientes", value: "312", icon: Users, change: "+28" },
];

type TabKey = "empreendimentos" | "contratos" | "materiais";

export default function Pedidos() {
  const [activeTab, setActiveTab] = useState<TabKey>("empreendimentos");

  return (
    <div className="space-y-4">
      {/* PBI Header */}
      <div className="pbi-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <div>
            <h1 className="text-base font-semibold text-white">Gestão de Obras</h1>
            <p className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Empreendimentos, contratos e materiais</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-[11px] border-none gap-1" style={{ background: "hsl(var(--pbi-surface))", color: "hsl(var(--pbi-text-primary))" }}>
            <Filter className="w-3 h-3" /> Filtrar
          </Button>
          <Button size="sm" className="h-7 text-[11px] font-semibold gap-1" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>
            <Plus className="w-3 h-3" /> Nova Obra
          </Button>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="pbi-tile">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{card.title}</p>
                <Icon className="w-3.5 h-3.5" style={{ color: "hsl(var(--pbi-text-secondary))" }} />
              </div>
              <p className="text-xl font-bold" style={{ color: "hsl(var(--pbi-text-primary))" }}>{card.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" style={{ color: "hsl(152, 60%, 38%)" }} />
                <span className="text-[10px]" style={{ color: "hsl(152, 60%, 38%)" }}>{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-md" style={{ background: "hsl(var(--pbi-surface))" }}>
        {([
          { key: "empreendimentos", label: "Empreendimentos" },
          { key: "contratos", label: "Contratos" },
          { key: "materiais", label: "Materiais" },
        ] as { key: TabKey; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-1.5 rounded text-[11px] font-medium transition-colors"
            style={{
              background: activeTab === tab.key ? "hsl(var(--pbi-yellow))" : "transparent",
              color: activeTab === tab.key ? "hsl(var(--pbi-dark))" : "hsl(var(--pbi-text-secondary))",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table content */}
      <div className="pbi-tile">
        {activeTab === "empreendimentos" && (
          <>
            <p className="text-[11px] font-semibold mb-3" style={{ color: "hsl(var(--pbi-text-primary))" }}>Empreendimentos</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--pbi-border))" }}>
                    {["Código", "Empreendimento", "Fase", "Unidades", "Vendidas", "Previsão", "Status"].map((h) => (
                      <th key={h} className="text-left py-2 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {empreendimentos.map((e) => {
                    const pct = Math.round((e.vendidas / e.unidades) * 100);
                    const st = statusColors[e.status] || statusColors["planejamento"];
                    return (
                      <tr key={e.id} className="hover:bg-white/5 cursor-pointer transition-colors" style={{ borderBottom: "1px solid hsl(var(--pbi-border) / 0.5)" }}>
                        <td className="py-1.5 px-2 font-medium" style={{ color: "hsl(207, 89%, 48%)" }}>{e.id}</td>
                        <td className="py-1.5 px-2 font-medium" style={{ color: "hsl(var(--pbi-text-primary))" }}>{e.nome}</td>
                        <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{e.fase}</td>
                        <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-primary))" }}>{e.unidades}</td>
                        <td className="py-1.5 px-2">
                          <div className="flex items-center gap-2">
                            <span style={{ color: "hsl(var(--pbi-text-primary))" }}>{e.vendidas}</span>
                            <div className="w-16 h-1.5 rounded-full" style={{ background: "hsl(var(--pbi-border))" }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "hsl(207, 89%, 48%)" }} />
                            </div>
                            <span className="text-[10px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{pct}%</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{e.previsao}</td>
                        <td className="py-1.5 px-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{e.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "contratos" && (
          <>
            <p className="text-[11px] font-semibold mb-3" style={{ color: "hsl(var(--pbi-text-primary))" }}>Contratos com Fornecedores</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--pbi-border))" }}>
                    {["Contrato", "Fornecedor", "Objeto", "Data", "Valor", "Status"].map((h) => (
                      <th key={h} className={`py-2 px-2 font-medium ${h === "Valor" ? "text-right" : "text-left"}`} style={{ color: "hsl(var(--pbi-text-secondary))" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contratos.map((c) => {
                    const st = statusColors[c.status] || statusColors["ativo"];
                    return (
                      <tr key={c.id} className="hover:bg-white/5 cursor-pointer transition-colors" style={{ borderBottom: "1px solid hsl(var(--pbi-border) / 0.5)" }}>
                        <td className="py-1.5 px-2 font-medium" style={{ color: "hsl(207, 89%, 48%)" }}>{c.id}</td>
                        <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-primary))" }}>{c.fornecedor}</td>
                        <td className="py-1.5 px-2 max-w-[200px] truncate" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{c.objeto}</td>
                        <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{c.data}</td>
                        <td className="py-1.5 px-2 text-right font-medium" style={{ color: "hsl(var(--pbi-text-primary))" }}>R$ {c.valor.toLocaleString()}</td>
                        <td className="py-1.5 px-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{c.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "materiais" && (
          <>
            <p className="text-[11px] font-semibold mb-3" style={{ color: "hsl(var(--pbi-text-primary))" }}>Estoque de Materiais</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--pbi-border))" }}>
                    {["Código", "Material", "Canteiro", "Quantidade", "Mínimo", "Status"].map((h) => (
                      <th key={h} className={`py-2 px-2 font-medium ${h === "Quantidade" || h === "Mínimo" ? "text-right" : "text-left"}`} style={{ color: "hsl(var(--pbi-text-secondary))" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {materiais.map((item) => {
                    const isOk = item.qtd > item.minimo * 1.5;
                    const isLow = item.qtd > item.minimo;
                    const st = isOk
                      ? { label: "OK", color: "hsl(152, 60%, 38%)", bg: "hsl(152, 60%, 38%, 0.15)" }
                      : isLow
                      ? { label: "Baixo", color: "hsl(45, 100%, 51%)", bg: "hsl(45, 100%, 51%, 0.15)" }
                      : { label: "Crítico", color: "hsl(0, 72%, 51%)", bg: "hsl(0, 72%, 51%, 0.15)" };
                    return (
                      <tr key={item.codigo} className="hover:bg-white/5 cursor-pointer transition-colors" style={{ borderBottom: "1px solid hsl(var(--pbi-border) / 0.5)" }}>
                        <td className="py-1.5 px-2 font-medium" style={{ color: "hsl(207, 89%, 48%)" }}>{item.codigo}</td>
                        <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-primary))" }}>{item.nome}</td>
                        <td className="py-1.5 px-2" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{item.armazem}</td>
                        <td className="py-1.5 px-2 text-right" style={{ color: "hsl(var(--pbi-text-primary))" }}>{item.qtd.toLocaleString()} {item.unidade}</td>
                        <td className="py-1.5 px-2 text-right" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{item.minimo.toLocaleString()} {item.unidade}</td>
                        <td className="py-1.5 px-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
