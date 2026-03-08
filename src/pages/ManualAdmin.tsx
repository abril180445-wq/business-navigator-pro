import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import AccessDenied from "@/components/AccessDenied";
import {
  BookOpen, ChevronDown, ChevronRight, Search, Shield, LayoutDashboard,
  Target, FileText, Users, HardDrive, FileSpreadsheet, Download,
  Construction, Rocket, Settings, Database, Layers,
} from "lucide-react";

interface ManualSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: { title: string; body: string }[];
}

const sections: ManualSection[] = [
  {
    id: "visao-geral",
    title: "Visão Geral do Admin",
    icon: Shield,
    content: [
      {
        title: "Painel Administrativo",
        body: `Como **Administrador**, você tem acesso total ao sistema ERP San Remo.\n\n**Suas permissões exclusivas:**\n- Dashboard completo com dados financeiros (Faturamento vs Custos)\n- Criar, editar e excluir metas com check-ins\n- Gerar relatórios profissionais (PDF e Excel)\n- Importar dados via Excel\n- Cadastro de dados\n- Criar, editar e excluir usuários\n- Atribuir roles (Admin, Master, Normal)\n- Backup e restauração do sistema\n- Acesso a todos os módulos`,
      },
      {
        title: "Níveis de Acesso",
        body: `O sistema possui três níveis:\n\n**Admin (Administrador)**\n- Acesso total a todos os módulos\n- Gerenciamento de usuários e backup\n- Dashboard com dados financeiros\n\n**Master (Premium)**\n- Dashboard com dados financeiros\n- Criar e editar metas, relatórios, importação\n- **NÃO pode** gerenciar usuários nem backup\n\n**Normal (Básico)**\n- Dashboard resumido (sem financeiro)\n- Visualizar metas (sem editar)\n- **NÃO pode** gerar relatórios, importar, cadastrar`,
      },
    ],
  },
  {
    id: "usuarios",
    title: "Gerenciamento de Usuários",
    icon: Users,
    content: [
      {
        title: "Como Criar um Novo Usuário",
        body: `1. Acesse **Usuários** no menu lateral (seção Admin)\n2. Clique no botão **"Novo Usuário"**\n3. Preencha os campos:\n   - **Nome Completo:** Nome do usuário\n   - **E-mail:** E-mail para login\n   - **Senha:** Mínimo de 6 caracteres\n   - **Tipo de Usuário:** Admin, Master ou Normal\n4. Clique em **"Criar Usuário"**\n5. O usuário aparecerá na lista automaticamente`,
      },
      {
        title: "Como Excluir um Usuário",
        body: `1. Na lista de usuários, localize o usuário\n2. Clique no ícone de **lixeira** (🗑️)\n3. Confirme a exclusão\n\n**Observações:**\n- Você não pode excluir a si mesmo\n- A exclusão é permanente\n- O usuário é removido imediatamente`,
      },
      {
        title: "Busca e Filtros",
        body: `Use a barra de busca para filtrar por:\n- Nome\n- E-mail\n\nA busca é instantânea e atualiza conforme você digita.`,
      },
    ],
  },
  {
    id: "metas",
    title: "Gestão de Metas",
    icon: Target,
    content: [
      {
        title: "Criando uma Meta",
        body: `1. Acesse **Metas** no menu lateral\n2. Clique em **"Nova Meta"**\n3. Preencha os campos:\n   - **Nome:** Descrição da meta\n   - **Valor Atual / Objetivo:** Progresso e alvo numérico\n   - **Unidade:** R$, %, unidades, etc.\n   - **Categoria:** Pré-definida ou **"Outra"** (personalizada)\n   - **Responsável, Prioridade, Ciclo**\n   - **Meta Pai:** Opcional, para hierarquia\n4. Clique em **"Criar Meta"**`,
      },
      {
        title: "Editando uma Meta",
        body: `1. Passe o mouse sobre a meta e clique no **lápis** (✏️)\n2. Todos os campos são editáveis:\n   - Nome, Valor Atual, Objetivo, Unidade\n   - Categoria, Responsável, Prioridade, Ciclo\n   - **Prazo** (opcional — pode adicionar ou remover)\n   - Meta Pai\n3. Clique em **"Salvar Alterações"**\n\n**Nota:** Alterar o valor atual gera um check-in automático.`,
      },
      {
        title: "Check-ins e Ações",
        body: `**Check-ins:** Atualizações de progresso com comentário e nível de confiança.\n\n**Ações:** Planos e tarefas vinculadas a uma meta.\n\nAmbos ficam visíveis na timeline de cada meta.`,
      },
      {
        title: "Categorias Personalizadas",
        body: `Categorias base: Financeiro, Vendas, Operacional, Qualidade, RH, Engenharia.\n\nPara criar uma nova:\n1. Selecione **"✨ Outra (personalizada)"**\n2. Digite o nome (máx. 40 caracteres)\n3. Salve a meta\n\nA nova categoria aparece automaticamente em filtros e gráficos.`,
      },
    ],
  },
  {
    id: "relatorios",
    title: "Relatórios",
    icon: FileText,
    content: [
      {
        title: "Gerando Relatórios",
        body: `1. Acesse **Relatórios** no menu lateral\n2. Selecione o tipo de relatório\n3. Aplique filtros (período, obra, etc.)\n4. Exporte em **Excel** ou **PDF**\n\n**Formato Excel (4 abas):**\n- Resumo — KPIs e totais\n- Detalhamento — Registros individuais\n- Por Categoria — Agrupamento e médias\n- Mensal — Evolução temporal`,
      },
      {
        title: "Relatório de Metas",
        body: `O relatório de metas puxa dados reais do banco:\n- Progresso por categoria (gráfico)\n- Tabela com todas as metas e barras de progresso\n- Exportação com dados atualizados em tempo real`,
      },
    ],
  },
  {
    id: "importacao",
    title: "Importação de Dados",
    icon: FileSpreadsheet,
    content: [
      {
        title: "Importação de Excel",
        body: `1. Acesse **Importar Excel** no menu lateral\n2. Clique em **"Selecionar Arquivo"** ou arraste\n3. Formatos aceitos: .xlsx, .xls\n4. Revise os dados na prévia\n5. Confirme a importação\n\n**Dicas:**\n- Primeira linha deve conter cabeçalhos\n- Remova linhas em branco\n- Verifique formatos de data e valores`,
      },
    ],
  },
  {
    id: "backup",
    title: "Backup e Restauração",
    icon: HardDrive,
    content: [
      {
        title: "Exportar Backup",
        body: `1. Acesse **Backup** no menu lateral\n2. Clique em **"Exportar Backup"**\n3. O ZIP será baixado contendo:\n   - **backup_completo.json** — Para restauração via sistema\n   - **backup_supabase.sql** — SQL compatível com Supabase\n   - **tabelas/*.csv** — Para abrir no Excel\n   - **tabelas/*.json** — Dados por tabela`,
      },
      {
        title: "Restaurar Backup",
        body: `A restauração possui **3 modos**:\n\n**1. Apenas Sistema**\n- Restaura perfis e permissões (roles)\n\n**2. Apenas Banco de Dados**\n- Restaura metas, ações, check-ins e relatórios\n\n**3. Tudo (Sistema + Banco)**\n- Restauração completa\n\n**Como restaurar:**\n1. Escolha o modo desejado\n2. Selecione o arquivo ZIP ou JSON\n3. Revise o resumo do backup\n4. Confirme a restauração\n\n**⚠️ Sempre faça um backup antes de restaurar!**`,
      },
    ],
  },
  {
    id: "dicas",
    title: "Dicas e Suporte",
    icon: BookOpen,
    content: [
      {
        title: "Dicas de Administração",
        body: `- **Backup regular:** Exporte backups semanalmente\n- **Roles:** Atribua permissões mínimas necessárias\n- **Senhas:** Oriente usuários a usar senhas fortes\n- **Monitoramento:** Verifique o dashboard regularmente\n- **Categorias:** Crie categorias padronizadas para metas`,
      },
      {
        title: "Solução de Problemas",
        body: `**Usuário não consegue logar:**\n- Verifique se a conta existe em Usuários\n- Redefina a senha se necessário\n\n**Dados não aparecem:**\n- Verifique o período selecionado nos filtros\n- Confirme se há dados cadastrados\n\n**Erro ao importar Excel:**\n- Verifique formato .xlsx/.xls\n- Primeira linha deve ter cabeçalhos\n- Remova formatações especiais`,
      },
    ],
  },
];

export default function ManualAdmin() {
  const { isAdmin } = useAuth();
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<string[]>(["visao-geral"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<{ sectionId: string; topicIndex: number } | null>({ sectionId: "visao-geral", topicIndex: 0 });

  if (!isAdmin) return <AccessDenied requiredRole="Administrador" />;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const filteredSections = searchTerm
    ? sections.filter(
        (s) =>
          s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.content.some(
            (t) =>
              t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              t.body.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    : sections;

  const currentTopic = selectedTopic
    ? sections.find((s) => s.id === selectedTopic.sectionId)?.content[selectedTopic.topicIndex]
    : null;
  const currentSection = selectedTopic ? sections.find((s) => s.id === selectedTopic.sectionId) : null;

  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[hsl(var(--pbi-yellow))] font-semibold">$1</strong>');
      if (line.startsWith("- ")) {
        return <li key={i} className="ml-4 text-[12px] leading-relaxed" style={{ color: "hsl(var(--pbi-text-primary))" }} dangerouslySetInnerHTML={{ __html: line.slice(2) }} />;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={i} className="ml-4 text-[12px] leading-relaxed list-decimal" style={{ color: "hsl(var(--pbi-text-primary))" }} dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, "") }} />;
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-[12px] leading-relaxed" style={{ color: "hsl(var(--pbi-text-primary))" }} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div className="space-y-4">
      <div className="pbi-header flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-foreground">Manual do Administrador</h1>
              <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                style={{ background: "hsl(var(--pbi-yellow) / 0.15)", color: "hsl(var(--pbi-yellow))" }}>Premium</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Documentação completa para administradores do sistema</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 h-7 px-3 rounded text-[11px] font-medium" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>
          <Download className="w-3 h-3" /> Imprimir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2" style={{ background: "hsl(var(--pbi-surface))", borderRadius: "6px", padding: "8px 12px", border: "1px solid hsl(var(--pbi-border))" }}>
            <Search className="w-3.5 h-3.5" style={{ color: "hsl(var(--pbi-text-secondary))" }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar no manual..."
              className="bg-transparent border-none outline-none text-[12px] flex-1"
              style={{ color: "hsl(var(--pbi-text-primary))" }}
            />
          </div>

          <div className="pbi-tile p-0 overflow-hidden">
            <div className="px-3 py-2" style={{ borderBottom: "1px solid hsl(var(--pbi-border))" }}>
              <p className="text-[11px] font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Índice — Admin</p>
            </div>
            <div className="py-1">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                const expanded = expandedSections.includes(section.id);
                return (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium transition-colors ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5"}`}
                      style={{ color: "hsl(var(--pbi-text-primary))" }}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(var(--pbi-yellow))" }} />
                      <span className="flex-1 text-left">{section.title}</span>
                      {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    {expanded && (
                      <div className="pb-1">
                        {section.content.map((topic, idx) => {
                          const isSelected = selectedTopic?.sectionId === section.id && selectedTopic?.topicIndex === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedTopic({ sectionId: section.id, topicIndex: idx })}
                              className="w-full text-left px-3 pl-9 py-1.5 text-[11px] transition-colors"
                              style={{
                                color: isSelected ? "hsl(var(--pbi-yellow))" : "hsl(var(--pbi-text-secondary))",
                                background: isSelected ? "hsl(var(--pbi-yellow) / 0.08)" : "transparent",
                              }}
                            >
                              {topic.title}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {currentTopic && currentSection ? (
            <div className="pbi-tile">
              <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid hsl(var(--pbi-border))" }}>
                <currentSection.icon className="w-4 h-4" style={{ color: "hsl(var(--pbi-yellow))" }} />
                <span className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>{currentSection.title}</span>
                <span style={{ color: "hsl(var(--pbi-text-secondary))" }}>/</span>
                <span className="text-[11px] font-medium" style={{ color: "hsl(var(--pbi-text-primary))" }}>{currentTopic.title}</span>
              </div>
              <h2 className="text-[16px] font-bold mb-4" style={{ color: "hsl(var(--pbi-yellow))" }}>{currentTopic.title}</h2>
              <div className="space-y-1">{renderMarkdown(currentTopic.body)}</div>

              <div className="flex justify-between mt-8 pt-4" style={{ borderTop: "1px solid hsl(var(--pbi-border))" }}>
                <button
                  onClick={() => {
                    const allTopics: { sectionId: string; topicIndex: number }[] = [];
                    sections.forEach((s) => s.content.forEach((_, i) => allTopics.push({ sectionId: s.id, topicIndex: i })));
                    const idx = allTopics.findIndex((t) => t.sectionId === selectedTopic?.sectionId && t.topicIndex === selectedTopic?.topicIndex);
                    if (idx > 0) {
                      const prev = allTopics[idx - 1];
                      setSelectedTopic(prev);
                      if (!expandedSections.includes(prev.sectionId)) setExpandedSections((p) => [...p, prev.sectionId]);
                    }
                  }}
                  className="text-[11px] px-3 py-1.5 rounded transition-colors"
                  style={{ background: "hsl(var(--pbi-surface))", color: "hsl(var(--pbi-text-secondary))", border: "1px solid hsl(var(--pbi-border))" }}
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => {
                    const allTopics: { sectionId: string; topicIndex: number }[] = [];
                    sections.forEach((s) => s.content.forEach((_, i) => allTopics.push({ sectionId: s.id, topicIndex: i })));
                    const idx = allTopics.findIndex((t) => t.sectionId === selectedTopic?.sectionId && t.topicIndex === selectedTopic?.topicIndex);
                    if (idx < allTopics.length - 1) {
                      const next = allTopics[idx + 1];
                      setSelectedTopic(next);
                      if (!expandedSections.includes(next.sectionId)) setExpandedSections((p) => [...p, next.sectionId]);
                    }
                  }}
                  className="text-[11px] px-3 py-1.5 rounded font-medium transition-colors"
                  style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}
                >
                  Próximo →
                </button>
              </div>
            </div>
          ) : (
            <div className="pbi-tile flex items-center justify-center py-20">
              <div className="text-center">
                <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: "hsl(var(--pbi-text-secondary))" }} />
                <p className="text-[13px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Selecione um tópico no índice</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
