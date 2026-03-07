import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  ClipboardPlus,
  FileText,
  FileSpreadsheet,
  DollarSign,
  Building2,
  HardHat,
  Landmark,
  FolderKanban,
  Users,
  Headphones,
  Truck,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  MoreVertical,
  BarChart3,
  Filter,
} from "lucide-react";
import logoSanRemo from "@/assets/logo-san-remo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface ModuleItem {
  label: string;
  icon: React.ElementType;
  path: string;
  children?: { label: string; path: string }[];
  section?: string;
}

const modules: ModuleItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/", section: "Visão Geral" },
  { label: "Metas", icon: Target, path: "/metas", section: "Visão Geral" },
  { label: "Relatórios", icon: FileText, path: "/relatorios", section: "Visão Geral" },
  { label: "Cadastro de Dados", icon: ClipboardPlus, path: "/cadastro", section: "Dados" },
  { label: "Importar Excel", icon: FileSpreadsheet, path: "/importacao", section: "Dados" },
  {
    label: "Financeiro",
    icon: DollarSign,
    path: "/contabilidade",
    section: "Módulos",
    children: [
      { label: "Faturamento", path: "/contabilidade/faturamento" },
      { label: "Contas a Pagar", path: "/contabilidade/pagamentos" },
      { label: "Contas a Receber", path: "/contabilidade/bancario" },
      { label: "Impostos", path: "/contabilidade/impostos" },
      { label: "Relatórios Financeiros", path: "/contabilidade/relatorios" },
    ],
  },
  {
    label: "Obras",
    icon: Building2,
    path: "/pedidos",
    section: "Módulos",
    children: [
      { label: "Empreendimentos", path: "/pedidos/vendas" },
      { label: "Contratos", path: "/pedidos/compras" },
      { label: "Materiais", path: "/pedidos/estoque" },
      { label: "Clientes", path: "/pedidos/crm" },
    ],
  },
  {
    label: "Engenharia",
    icon: HardHat,
    path: "/manufatura",
    section: "Módulos",
    children: [
      { label: "Ordens de Serviço", path: "/manufatura/ordens" },
      { label: "Cronogramas", path: "/manufatura/bom" },
      { label: "Planejamento", path: "/manufatura/planejamento" },
    ],
  },
  { label: "Patrimônio", icon: Landmark, path: "/ativos", section: "Módulos" },
  { label: "Projetos", icon: FolderKanban, path: "/projetos", section: "Módulos" },
  { label: "RH", icon: Users, path: "/rh", section: "Módulos" },
  { label: "Suporte", icon: Headphones, path: "/helpdesk", section: "Módulos" },
  { label: "Logística", icon: Truck, path: "/pdv", section: "Módulos" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const location = useLocation();
  const { profile, user, signOut } = useAuth();

  const toggleModule = (label: string) => {
    setExpandedModules((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path + "/"));

  const sections = [...new Set(modules.map((m) => m.section))];

  const currentPage = modules.find(m => isActive(m.path))?.label || "Dashboard";

  const SidebarNav = () => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo area */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-sidebar-border shrink-0">
        <img src={logoSanRemo} alt="San Remo" className="w-7 h-7 object-contain rounded" />
        <span className="text-sm font-semibold text-sidebar-primary tracking-tight truncate">
          San Remo
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {sections.map((section) => (
          <div key={section} className="mb-1">
            <p className="text-[10px] uppercase tracking-widest text-sidebar-muted font-semibold px-3 pt-3 pb-1">
              {section}
            </p>
            <div className="space-y-px">
              {modules
                .filter((m) => m.section === section)
                .map((mod) => {
                  const Icon = mod.icon;
                  const active = isActive(mod.path);
                  const expanded = expandedModules.includes(mod.label);
                  const hasChildren = mod.children && mod.children.length > 0;

                  return (
                    <div key={mod.label}>
                      <div
                        className={`flex items-center gap-2.5 px-3 py-2 rounded cursor-pointer transition-all text-[13px] font-medium
                          ${active && !hasChildren
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-[3px] border-sidebar-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground border-l-[3px] border-transparent"
                          }`}
                        onClick={() => hasChildren ? toggleModule(mod.label) : undefined}
                      >
                        {hasChildren ? (
                          <>
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="flex-1">{mod.label}</span>
                            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </>
                        ) : (
                          <Link to={mod.path} className="flex items-center gap-2.5 w-full" onClick={() => setMobileOpen(false)}>
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{mod.label}</span>
                          </Link>
                        )}
                      </div>
                      {hasChildren && expanded && (
                        <div className="ml-5 mt-0.5 space-y-px border-l border-sidebar-border pl-3">
                          {mod.children!.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setMobileOpen(false)}
                              className={`block px-3 py-1.5 rounded text-[12px] transition-colors
                                ${isActive(child.path)
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                  : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                                }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-sidebar-primary flex items-center justify-center text-[10px] font-bold text-sidebar-primary-foreground">
            {profile?.full_name?.slice(0, 2).toUpperCase() || "SR"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-sidebar-accent-foreground truncate">
              {profile?.full_name || "Administrador"}
            </p>
            <p className="text-[10px] text-sidebar-muted truncate">{user?.email}</p>
          </div>
          <button onClick={signOut} className="p-1.5 rounded hover:bg-sidebar-accent transition-colors" title="Sair">
            <LogOut className="w-3.5 h-3.5 text-sidebar-muted" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 transform transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 text-sidebar-foreground z-10">
          <X className="w-4 h-4" />
        </button>
        <SidebarNav />
      </aside>

      {/* Desktop sidebar */}
      {sidebarOpen && (
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border">
          <SidebarNav />
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Power BI-style top header */}
        <header className="h-11 pbi-header flex items-center px-3 gap-2 shrink-0 z-30">
          <button
            onClick={() => { if (window.innerWidth < 1024) setMobileOpen(true); else setSidebarOpen(!sidebarOpen); }}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
          >
            <Menu className="w-4 h-4 text-white/70" />
          </button>

          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-[13px] font-semibold text-white">{currentPage}</span>
          </div>

          <div className="flex-1" />

          <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded px-2.5 py-1.5 max-w-xs">
            <Search className="w-3.5 h-3.5 text-white/50" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-transparent border-none outline-none text-[12px] flex-1 text-white placeholder:text-white/40 w-32"
            />
          </div>

          <button className="p-1.5 rounded hover:bg-white/10 transition-colors relative">
            <Bell className="w-4 h-4 text-white/70" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
          </button>

          <div className="flex items-center gap-2 ml-1">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              {profile?.full_name?.slice(0, 2).toUpperCase() || "SR"}
            </div>
          </div>
        </header>

        {/* Power BI canvas */}
        <main className="flex-1 overflow-y-auto pbi-canvas p-3 sm:p-4 lg:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
