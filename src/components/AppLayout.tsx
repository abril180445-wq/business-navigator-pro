import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  DollarSign,
  Package,
  Factory,
  HardDrive,
  FolderKanban,
  Users,
  Headphones,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell,
  Settings,
} from "lucide-react";

interface ModuleItem {
  label: string;
  icon: React.ElementType;
  path: string;
  children?: { label: string; path: string }[];
}

const modules: ModuleItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  {
    label: "Contabilidade",
    icon: DollarSign,
    path: "/contabilidade",
    children: [
      { label: "Faturamento", path: "/contabilidade/faturamento" },
      { label: "Pagamentos", path: "/contabilidade/pagamentos" },
      { label: "Bancário", path: "/contabilidade/bancario" },
      { label: "Impostos", path: "/contabilidade/impostos" },
      { label: "Relatórios", path: "/contabilidade/relatorios" },
    ],
  },
  {
    label: "Pedidos",
    icon: Package,
    path: "/pedidos",
    children: [
      { label: "Vendas", path: "/pedidos/vendas" },
      { label: "Compras", path: "/pedidos/compras" },
      { label: "Estoque", path: "/pedidos/estoque" },
      { label: "CRM", path: "/pedidos/crm" },
    ],
  },
  {
    label: "Manufatura",
    icon: Factory,
    path: "/manufatura",
    children: [
      { label: "Ordens de Produção", path: "/manufatura/ordens" },
      { label: "BOM", path: "/manufatura/bom" },
      { label: "Planejamento", path: "/manufatura/planejamento" },
    ],
  },
  { label: "Ativos", icon: HardDrive, path: "/ativos" },
  { label: "Projetos", icon: FolderKanban, path: "/projetos" },
  { label: "RH", icon: Users, path: "/rh" },
  { label: "Helpdesk", icon: Headphones, path: "/helpdesk" },
  { label: "PDV", icon: ShoppingCart, path: "/pdv" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const location = useLocation();

  const toggleModule = (label: string) => {
    setExpandedModules((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path + "/"));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg erp-gradient flex items-center justify-center shrink-0">
          <span className="text-sm font-extrabold text-accent-foreground">G</span>
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-base font-bold text-sidebar-primary tracking-tight">Gabi ERP</h1>
            <p className="text-[10px] text-sidebar-muted leading-none">Sistema de Gestão</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const active = isActive(mod.path);
          const expanded = expandedModules.includes(mod.label);
          const hasChildren = mod.children && mod.children.length > 0;

          return (
            <div key={mod.label}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium
                  ${active && !hasChildren ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}`}
                onClick={() => (hasChildren ? toggleModule(mod.label) : undefined)}
              >
                {hasChildren ? (
                  <>
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{mod.label}</span>
                        {expanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <Link
                    to={mod.path}
                    className="flex items-center gap-3 w-full"
                    onClick={() => setMobileOpen(false)}
                  >
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
                      className={`block px-3 py-2 rounded-md text-sm transition-colors
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
      </nav>

      {/* Footer user */}
      {!collapsed && (
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-primary truncate">Administrator</p>
              <p className="text-xs text-sidebar-muted truncate">admin@empresa.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-foreground/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar mobile */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform lg:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
          <SidebarContent />
        </aside>

        {/* Sidebar desktop */}
        <aside
          className={`hidden lg:flex flex-col bg-sidebar transition-all duration-200 ${
            collapsed ? "w-16" : "w-64"
          } shrink-0`}
        >
          <SidebarContent />
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) setMobileOpen(true);
                else setCollapsed(!collapsed);
              }}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex-1 max-w-md">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>

      {/* Footer */}
      <footer className="h-10 bg-card border-t border-border flex items-center justify-center px-4 shrink-0">
        <p className="text-xs text-muted-foreground">
          Dev Emerson Cordeiro © 2026 — <span className="font-semibold text-accent">Gabi ERP</span>
        </p>
      </footer>
    </div>
  );
}
