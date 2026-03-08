import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trash2, ShieldCheck, Shield, User, RefreshCw, Search, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AccessDenied from "@/components/AccessDenied";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

interface UserEntry {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

const roleConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  admin: { label: "Admin", color: "hsl(0, 72%, 51%)", bg: "hsl(0, 72%, 51%, 0.15)", icon: ShieldCheck },
  master: { label: "Master", color: "hsl(45, 100%, 51%)", bg: "hsl(45, 100%, 51%, 0.15)", icon: Shield },
  normal: { label: "Normal", color: "hsl(207, 89%, 48%)", bg: "hsl(207, 89%, 48%, 0.15)", icon: User },
};

export default function GerenciarUsuarios() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "normal" });
  const [editingRole, setEditingRole] = useState<{ userId: string; role: string } | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("list-users", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      setUsers(res.data.users || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar usuários", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const stableFetch = useCallback(() => { fetchUsers(); }, []);
  useEffect(() => { fetchUsers(); }, []);
  useRealtimeTable("profiles", stableFetch);
  useRealtimeTable("user_roles", stableFetch);

  const handleCreate = async () => {
    if (!form.full_name || !form.email || !form.password) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("create-user", {
        body: form,
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      if (res.data.error) throw new Error(res.data.error);
      toast({ title: "Usuário criado!", description: `${form.full_name} (${form.role})` });
      setForm({ full_name: "", email: "", password: "", role: "normal" });
      setDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Erro ao criar usuário", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${name}?`)) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("delete-user", {
        body: { user_id: userId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      if (res.data.error) throw new Error(res.data.error);
      toast({ title: "Usuário excluído", description: name });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    setUpdatingRole(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("update-user-role", {
        body: { user_id: editingRole.userId, role: editingRole.role },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: "Permissão atualizada!" });
      setEditingRole(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Erro ao alterar permissão", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingRole(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const counts = { admin: users.filter((u) => u.role === "admin").length, master: users.filter((u) => u.role === "master").length, normal: users.filter((u) => u.role === "normal").length };

  if (!isAdmin) return <AccessDenied requiredRole="Administrador" />;

  return (
    <div className="space-y-4">
      {/* PBI Header */}
      <div className="pbi-header flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5" style={{ color: "hsl(var(--pbi-yellow))" }} />
          <div>
            <h1 className="text-base font-semibold text-white">Gerenciar Usuários</h1>
            <p className="text-[11px]" style={{ color: "hsl(0, 0%, 72%)" }}>Adicionar, editar e remover usuários do sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} className="h-7 text-[11px] border-none gap-1 bg-secondary text-foreground hover:bg-secondary/80">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-[11px] font-semibold gap-1" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>
                <Plus className="w-3 h-3" /> Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-[14px] text-foreground">Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Nome Completo *</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Nome completo" className="h-8 text-[12px] pbi-input-bg border-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">E-mail *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="usuario@empresa.com" className="h-8 text-[12px] pbi-input-bg border-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Senha *</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" className="h-8 text-[12px] pbi-input-bg border-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Tipo de Usuário *</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger className="h-8 text-[12px] pbi-input-bg border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin — Acesso total</SelectItem>
                      <SelectItem value="master">Master — Gerencia módulos</SelectItem>
                      <SelectItem value="normal">Normal — Acesso básico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full h-8 text-[12px] font-semibold" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>
                  {creating ? "Criando..." : "Criar Usuário"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(["admin", "master", "normal"] as const).map((role) => {
          const cfg = roleConfig[role];
          const Icon = cfg.icon;
          return (
            <div key={role} className="pbi-tile">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{cfg.label}</p>
                <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: cfg.color }}>{counts[role]}</p>
              <p className="text-[10px] mt-1 text-muted-foreground">usuários</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-md p-2 px-3 bg-card border border-border">
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="bg-transparent border-none outline-none text-[12px] flex-1 text-foreground placeholder:text-muted-foreground"
        />
        <span className="text-[10px] text-muted-foreground">{filtered.length} resultados</span>
      </div>

      {/* Edit role dialog */}
      <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-[14px] text-foreground">Alterar Permissão</DialogTitle>
          </DialogHeader>
          {editingRole && (
            <div className="space-y-3 mt-2">
              <p className="text-[12px] text-muted-foreground">
                Usuário: <strong className="text-foreground">{users.find((u) => u.id === editingRole.userId)?.full_name}</strong>
              </p>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Novo Tipo</Label>
                <Select value={editingRole.role} onValueChange={(v) => setEditingRole({ ...editingRole, role: v })}>
                  <SelectTrigger className="h-8 text-[12px] pbi-input-bg border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin — Acesso total</SelectItem>
                    <SelectItem value="master">Master — Gerencia módulos</SelectItem>
                    <SelectItem value="normal">Normal — Acesso básico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateRole} disabled={updatingRole} className="w-full h-8 text-[12px] font-semibold" style={{ background: "hsl(var(--pbi-yellow))", color: "hsl(var(--pbi-dark))" }}>
                {updatingRole ? "Salvando..." : "Salvar Permissão"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Users table */}
      <div className="pbi-tile">
        <p className="text-[11px] font-semibold mb-3 text-foreground">Usuários do Sistema</p>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border">
                  {["Nome", "E-mail", "Tipo", "Criado em", "Ações"].map((h) => (
                    <th key={h} className="text-left py-2 px-2 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const cfg = roleConfig[u.role] || roleConfig.normal;
                  const isSelf = u.id === user?.id;
                  return (
                    <tr key={u.id} className="pbi-row-hover transition-colors border-b border-border/50">
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                            {u.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{u.full_name}</span>
                          {isSelf && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "hsl(45, 100%, 51%, 0.15)", color: "hsl(var(--pbi-yellow))" }}>Você</span>}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">{u.email}</td>
                      <td className="py-2 px-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1">
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => setEditingRole({ userId: u.id, role: u.role })}
                                className="p-1 rounded hover:bg-primary/20 transition-colors text-muted-foreground"
                                title="Alterar permissão"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDelete(u.id, u.full_name)} className="p-1 rounded hover:bg-destructive/20 transition-colors text-muted-foreground" title="Excluir">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[12px] text-muted-foreground">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
