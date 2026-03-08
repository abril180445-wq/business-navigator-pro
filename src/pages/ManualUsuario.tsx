import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, Search, Shield, LayoutDashboard, Target, FileText, Users, HardDrive, FileSpreadsheet, DollarSign, Building2, HardHat, Download } from "lucide-react";

interface ManualSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: ManualTopic[];
}

interface ManualTopic {
  title: string;
  body: string;
}

const sections: ManualSection[] = [
  {
    id: "inicio",
    title: "Introdução ao Sistema",
    icon: BookOpen,
    content: [
      {
        title: "Sobre o Sistema ERP San Remo",
        body: `O ERP San Remo é uma plataforma completa de gestão empresarial desenvolvida especificamente para a **San Remo Construtora**. O sistema centraliza todas as operações da empresa em um ambiente digital seguro, com dashboards analíticos no estilo Power BI para tomada de decisões estratégicas.\n\n**Principais funcionalidades:**\n- Dashboard analítico com KPIs em tempo real\n- Gestão de metas e acompanhamento de desempenho\n- Relatórios profissionais exportáveis em Excel\n- Controle financeiro completo\n- Gestão de obras e empreendimentos\n- Gerenciamento de usuários com níveis de acesso\n- Sistema de backup e restauração`,
      },
      {
        title: "Requisitos do Sistema",
        body: `**Navegadores compatíveis:**\n- Google Chrome 90+ (recomendado)\n- Mozilla Firefox 88+\n- Microsoft Edge 90+\n- Safari 14+\n\n**Requisitos mínimos:**\n- Conexão de internet estável\n- Resolução de tela mínima: 1024x768\n- JavaScript habilitado no navegador`,
      },
      {
        title: "Primeiro Acesso",
        body: `1. Acesse a URL do sistema fornecida pelo administrador\n2. Na tela de login, se nenhum administrador foi cadastrado, será exibido o formulário de **Configuração Inicial**\n3. Informe seu nome completo para criar a primeira conta de administrador\n4. Após a configuração, faça login com e-mail e senha\n5. Você será redirecionado ao Dashboard principal`,
      },
    ],
  },
  {
    id: "login",
    title: "Login e Autenticação",
    icon: Shield,
    content: [
      {
        title: "Como fazer login",
        body: `1. Acesse a página de login do sistema\n2. Informe seu **e-mail** cadastrado\n3. Digite sua **senha**\n4. Clique em **"Entrar no Sistema"**\n\n**Observação:** As credenciais são fornecidas pelo administrador do sistema. Caso não possua acesso, solicite ao administrador.`,
      },
      {
        title: "Recuperação de Senha",
        body: `Caso tenha esquecido sua senha:\n1. Na tela de login, clique em **"Esqueceu a senha?"**\n2. Informe o e-mail associado à sua conta\n3. Verifique sua caixa de entrada (e spam) pelo e-mail de recuperação\n4. Siga o link recebido para definir uma nova senha\n5. Faça login com a nova senha`,
      },
      {
        title: "Níveis de Acesso",
        body: `O sistema possui três níveis de acesso com permissões distintas:\n\n**Admin (Administrador)**\n- Acesso total a todos os módulos do sistema\n- Dashboard completo com dados financeiros (faturamento, custos)\n- Criar, editar e excluir metas (incluindo check-ins e ações)\n- Gerar e exportar relatórios (PDF e Excel)\n- Importar dados via Excel\n- Cadastro de dados\n- Criar, editar e excluir usuários\n- Atribuir roles (Admin, Master, Normal)\n- Realizar backup e restauração do sistema\n- Acesso ao módulo Financeiro, Obras, Engenharia e todos os demais\n\n**Master (Usuário Premium)**\n- Dashboard completo com dados financeiros\n- Criar, editar e excluir metas (incluindo check-ins e ações)\n- Gerar e exportar relatórios (PDF e Excel)\n- Importar dados via Excel\n- Cadastro de dados\n- Acesso ao módulo Financeiro, Obras, Engenharia e demais módulos operacionais\n- **NÃO pode** gerenciar usuários\n- **NÃO pode** realizar backup/restauração\n\n**Normal (Usuário Básico)**\n- Dashboard com visão resumida (sem dados financeiros detalhados)\n- Visualizar metas (sem editar)\n- Acessar módulos de Obras, Engenharia, Patrimônio, Projetos, RH, etc.\n- **NÃO pode** gerar relatórios\n- **NÃO pode** importar Excel\n- **NÃO pode** cadastrar dados\n- **NÃO pode** gerenciar usuários\n- **NÃO pode** realizar backup/restauração`,
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    content: [
      {
        title: "Visão Geral do Dashboard",
        body: `O Dashboard é a tela principal do sistema e apresenta uma visão consolidada dos indicadores da empresa.\n\n**O que cada perfil vê:**\n\n**Admin e Master:**\n- KPIs completos: Faturamento, Obras Ativas, Unidades Vendidas e Clientes Ativos\n- Gráfico de Faturamento vs Custos\n- Obras por Status (pizza)\n- Vendas por Empreendimento\n- Progresso das Obras\n- Unidades Vendidas/Mês\n\n**Normal:**\n- KPIs operacionais (Obras Ativas, Unidades Vendidas, Clientes)\n- Banner informativo de modo visualização\n- Progresso das Obras e Vendas por Empreendimento\n- **Dados financeiros detalhados são ocultos** (Faturamento vs Custos)`,
      },
      {
        title: "Filtros do Dashboard",
        body: `Na barra superior do Dashboard, você encontra os seguintes filtros:\n\n- **Ano:** Selecione o ano para análise dos dados\n- **Obras:** Filtre por uma obra específica ou visualize todas\n- **Status:** Filtre por status da obra (Em andamento, Planejamento, etc.)\n\nOs filtros são aplicados automaticamente a todos os gráficos e KPIs da página.`,
      },
      {
        title: "Atualização em Tempo Real",
        body: `O sistema utiliza tecnologia de **tempo real** para manter os dados sempre atualizados. Quando outro usuário faz alterações no sistema, os dados são atualizados automaticamente sem necessidade de recarregar a página.\n\nIsso se aplica a:\n- Lista de usuários\n- Perfis de usuários\n- Dados do dashboard`,
      },
    ],
  },
  {
    id: "metas",
    title: "Metas",
    icon: Target,
    content: [
      {
        title: "Acompanhamento de Metas",
        body: `O módulo de Metas permite definir e acompanhar objetivos da empresa.\n\n**Funcionalidades:**\n- Visualização de metas por período\n- Indicadores de progresso com cores (verde, amarelo, vermelho)\n- Comparativo meta vs realizado\n- Histórico de desempenho`,
      },
    ],
  },
  {
    id: "relatorios",
    title: "Relatórios",
    icon: FileText,
    content: [
      {
        title: "Geração de Relatórios",
        body: `O módulo de Relatórios permite gerar documentos profissionais com os dados do sistema.\n\n**Como gerar um relatório:**\n1. Acesse o módulo **Relatórios** no menu lateral\n2. Selecione o tipo de relatório desejado\n3. Aplique os filtros necessários (período, obra, etc.)\n4. Clique em **"Exportar Excel"**`,
      },
      {
        title: "Formato dos Relatórios Excel",
        body: `Os relatórios exportados em Excel possuem formato profissional com 4 abas:\n\n**1. Resumo**\n- Cabeçalho corporativo com nome da empresa\n- Data de geração e período analisado\n- KPIs resumidos\n- Totais gerais\n\n**2. Detalhamento**\n- Todos os registros individuais\n- Colunas formatadas com cabeçalho destacado\n- Valores monetários formatados\n\n**3. Por Categoria**\n- Agrupamento por categoria\n- Totais e médias por grupo\n- Análise comparativa\n\n**4. Mensal**\n- Dados organizados por mês\n- Evolução temporal\n- Tendências e comparativos`,
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
        body: `O sistema permite importar dados a partir de planilhas Excel.\n\n**Como importar:**\n1. Acesse **Importar Excel** no menu lateral\n2. Clique em **"Selecionar Arquivo"** ou arraste o arquivo\n3. Formatos aceitos: .xlsx, .xls\n4. O sistema fará a leitura automática das colunas\n5. Revise os dados importados na prévia\n6. Confirme a importação\n\n**Dicas:**\n- Certifique-se de que a primeira linha contém os cabeçalhos\n- Remova linhas em branco antes de importar\n- Verifique se os formatos de data e valores estão corretos`,
      },
    ],
  },
  {
    id: "financeiro",
    title: "Módulo Financeiro",
    icon: DollarSign,
    content: [
      {
        title: "Visão Geral do Financeiro",
        body: `O módulo Financeiro centraliza todas as operações financeiras da empresa.\n\n**Submódulos disponíveis:**\n- **Faturamento:** Controle de receitas e notas fiscais\n- **Contas a Pagar:** Gestão de pagamentos e vencimentos\n- **Contas a Receber:** Acompanhamento de recebíveis\n- **Impostos:** Controle tributário\n- **Relatórios Financeiros:** Demonstrativos e balanços`,
      },
    ],
  },
  {
    id: "obras",
    title: "Módulo de Obras",
    icon: Building2,
    content: [
      {
        title: "Gestão de Obras",
        body: `O módulo de Obras permite gerenciar todos os empreendimentos da construtora.\n\n**Submódulos:**\n- **Empreendimentos:** Cadastro e acompanhamento de obras\n- **Contratos:** Gestão de contratos com fornecedores e clientes\n- **Materiais:** Controle de estoque de materiais\n- **Clientes:** CRM com informações de compradores`,
      },
    ],
  },
  {
    id: "engenharia",
    title: "Módulo de Engenharia",
    icon: HardHat,
    content: [
      {
        title: "Gestão de Engenharia",
        body: `O módulo de Engenharia gerencia os aspectos técnicos das obras.\n\n**Funcionalidades:**\n- **Ordens de Serviço:** Criação e acompanhamento de OS\n- **Cronogramas:** Planejamento de prazos e entregas\n- **Planejamento:** Recursos e alocação de equipes`,
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
        body: `**Somente administradores podem gerenciar usuários.**\n\n1. Acesse **Usuários** no menu lateral (seção Admin)\n2. Clique no botão **"Novo Usuário"**\n3. Preencha os campos:\n   - **Nome Completo:** Nome do usuário\n   - **E-mail:** E-mail para login\n   - **Senha:** Mínimo de 6 caracteres\n   - **Tipo de Usuário:** Admin, Master ou Normal\n4. Clique em **"Criar Usuário"**\n5. O usuário aparecerá na lista automaticamente (tempo real)`,
      },
      {
        title: "Como Excluir um Usuário",
        body: `1. Na lista de usuários, localize o usuário desejado\n2. Clique no ícone de **lixeira** (🗑️) na coluna Ações\n3. Confirme a exclusão no diálogo de confirmação\n\n**Observações:**\n- Você não pode excluir a si mesmo\n- A exclusão é permanente\n- O usuário será removido imediatamente do sistema`,
      },
      {
        title: "Busca de Usuários",
        body: `Use a barra de busca acima da tabela para filtrar usuários por:\n- Nome\n- E-mail\n\nA busca é instantânea e os resultados são atualizados conforme você digita.`,
      },
    ],
  },
  {
    id: "backup",
    title: "Backup e Restauração",
    icon: HardDrive,
    content: [
      {
        title: "Como Realizar um Backup",
        body: `**Somente administradores podem realizar backups.**\n\n1. Acesse **Backup** no menu lateral (seção Admin)\n2. Clique no botão **"Exportar Backup"**\n3. O sistema irá gerar um arquivo JSON com todos os dados\n4. O arquivo será baixado automaticamente\n5. Armazene o arquivo em local seguro\n\n**O backup inclui:**\n- Perfis de usuários\n- Funções (roles) de cada usuário\n- Metadados de autenticação\n- Data e hora do backup`,
      },
      {
        title: "Como Restaurar um Backup",
        body: `**⚠️ ATENÇÃO: A restauração substitui todos os dados atuais do sistema.**\n\n1. Acesse **Backup** no menu lateral\n2. Clique em **"Restaurar Backup"**\n3. Selecione o arquivo JSON de backup\n4. Leia o aviso de confirmação com atenção\n5. Confirme a restauração\n6. Aguarde o processamento\n7. O sistema será atualizado com os dados do backup\n\n**Recomendações:**\n- Sempre faça um backup antes de restaurar\n- Verifique se o arquivo é válido\n- Não interrompa o processo de restauração`,
      },
    ],
  },
  {
    id: "dicas",
    title: "Dicas e Solução de Problemas",
    icon: BookOpen,
    content: [
      {
        title: "Dicas de Uso",
        body: `- **Navegação rápida:** Use o menu lateral para acessar qualquer módulo\n- **Busca:** Utilize a barra de busca no topo para encontrar funcionalidades\n- **Responsivo:** O sistema funciona em tablets e smartphones\n- **Menu recolhível:** Clique no ícone de menu (☰) para expandir/recolher o menu lateral\n- **Tempo real:** Os dados são atualizados automaticamente em todas as telas`,
      },
      {
        title: "Problemas Comuns",
        body: `**Não consigo fazer login:**\n- Verifique se o e-mail está correto\n- Confira a senha (respeite maiúsculas/minúsculas)\n- Use a opção "Esqueceu a senha?" para redefinir\n- Contate o administrador se o problema persistir\n\n**Os dados não estão atualizando:**\n- Verifique sua conexão de internet\n- Atualize a página (F5)\n- O sistema usa atualização em tempo real, mas em caso de perda de conexão temporária os dados podem atrasar\n\n**Erro ao exportar relatório:**\n- Verifique se há dados no período selecionado\n- Tente um período menor\n- Verifique se seu navegador permite downloads\n\n**Erro ao importar Excel:**\n- Certifique-se de que o formato é .xlsx ou .xls\n- Verifique se a primeira linha contém cabeçalhos\n- Remova formatações especiais da planilha`,
      },
      {
        title: "Suporte Técnico",
        body: `Para suporte técnico, entre em contato com o administrador do sistema.\n\n**Informações úteis para o suporte:**\n- Descreva o problema detalhadamente\n- Informe a tela/módulo onde ocorreu o erro\n- Capture uma imagem da tela (Print Screen)\n- Informe o navegador e versão que está utilizando`,
      },
    ],
  },
];

export default function ManualUsuario() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["inicio"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<{ sectionId: string; topicIndex: number } | null>({ sectionId: "inicio", topicIndex: 0 });

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
      // Bold
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pbi-header flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <div>
            <h1 className="text-base font-semibold text-white">Manual do Usuário</h1>
            <p className="text-[11px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Documentação completa do sistema ERP San Remo</p>
          </div>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-1.5 h-7 px-3 rounded text-[11px] font-medium" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>
          <Download className="w-3 h-3" /> Imprimir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar / Table of Contents */}
        <div className="lg:col-span-1 space-y-3">
          {/* Search */}
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

          {/* TOC */}
          <div className="pbi-tile p-0 overflow-hidden">
            <div className="px-3 py-2" style={{ borderBottom: "1px solid hsl(var(--pbi-border))" }}>
              <p className="text-[11px] font-semibold" style={{ color: "hsl(var(--pbi-text-primary))" }}>Índice</p>
            </div>
            <div className="py-1">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                const expanded = expandedSections.includes(section.id);
                return (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium hover:bg-white/5 transition-colors"
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

        {/* Content Area */}
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
              <div className="space-y-1">
                {renderMarkdown(currentTopic.body)}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-4" style={{ borderTop: "1px solid hsl(var(--pbi-border))" }}>
                <button
                  onClick={() => {
                    const allTopics: { sectionId: string; topicIndex: number }[] = [];
                    sections.forEach((s) => s.content.forEach((_, i) => allTopics.push({ sectionId: s.id, topicIndex: i })));
                    const currentIdx = allTopics.findIndex((t) => t.sectionId === selectedTopic?.sectionId && t.topicIndex === selectedTopic?.topicIndex);
                    if (currentIdx > 0) {
                      const prev = allTopics[currentIdx - 1];
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
                    const currentIdx = allTopics.findIndex((t) => t.sectionId === selectedTopic?.sectionId && t.topicIndex === selectedTopic?.topicIndex);
                    if (currentIdx < allTopics.length - 1) {
                      const next = allTopics[currentIdx + 1];
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
                <p className="text-[13px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>Selecione um tópico no índice para visualizar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
