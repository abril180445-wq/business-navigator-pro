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
  Settings,
  LogOut,
  ShieldCheck,
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
  { label: "Dashboard", icon: LayoutDashboard, path: "/", section: "Principal" },
  { label: "Metas", icon: Target, path: "/metas", section: "Principal" },
  { label: "Cadastro de Dados", icon: ClipboardPlus, path: "/cadastro", section: "Principal" },
  { label: "Relatórios", icon: FileText, path: "/relatorios", section: "Principal" },
  { label: "Importar Excel", icon: FileSpreadsheet, path: "/importacao", section: "Principal" },
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
  const [collapsed, setCollapsed] = useState(false);
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <img src={logoSanRemo} alt="San Remo Construtora" className="w-9 h-9 object-contain rounded" />
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-sidebar-primary tracking-tight font-sans truncate">
              San Remo Construtora
            </h1>
            <p className="text-[10px] text-sidebar-muted leading-none font-sans">Painel administrativo</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {sections.map((section) => (
          <div key={section}>
            {!collapsed && (
              <p className="text-[10px] uppercase tracking-widest text-sidebar-muted font-semibold px-3 pt-3 pb-1 font-sans">
                {section}
              </p>
            )}
            <div className="space-y-0.5">
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
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium font-sans
                          ${active && !hasChildren ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-accent" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}`}
                        onClick={() => hasChildren ? toggleModule(mod.label) : undefined}
                      >
                        {hasChildren ? (
                          <>
                            <Icon className="w-4 h-4 shrink-0" />
                            {!collapsed && (
                              <>
                                <span className="flex-1">{mod.label}</span>
                                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </>
                            )}
                          </>
                        ) : (
                          <Link to={mod.path} className="flex items-center gap-3 w-full" onClick={() => setMobileOpen(false)}>
                            <Icon className="w-4 h-4 shrink-0" />
                            {!collapsed && <span>{mod.label}</span>}
                          </Link>
                        )}
                      </div>
                      {hasChildren && expanded && !collapsed && (
                        <div className="ml-6 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                          {mod.children!.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setMobileOpen(false)}
                              className={`block px-3 py-2 rounded-md text-sm transition-colors font-sans
                                ${isActive(child.path) ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/30"}`}
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

      {!collapsed && (
        <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground font-sans">
              {profile?.full_name?.slice(0, 2).toUpperCase() || "SR"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-primary truncate font-sans">
                {profile?.full_name || "Administrador"}
              </p>
              <p className="text-xs text-sidebar-muted truncate font-sans">{user?.email || "admin@sanremo.com.br"}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={signOut}>
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-sidebar-foreground">
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      <aside className={`hidden lg:flex flex-col bg-sidebar transition-all duration-200 ${collapsed ? "w-16" : "w-64"} shrink-0`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => { if (window.innerWidth < 1024) setMobileOpen(true); else setCollapsed(!collapsed); }} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Buscar obras, relatórios..." className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground font-sans" />
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border px-3 py-1.5 bg-muted/50">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-sm text-foreground font-sans">Admin</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
