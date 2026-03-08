import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, KeyRound, ShieldCheck, BarChart3, TrendingUp, Building2, DollarSign, Users, Target } from "lucide-react";
import logoSanRemo from "@/assets/logo-san-remo.png";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  bootstrapAdminSchema,
  loginSchema,
  resetRequestSchema,
  type BootstrapAdminFormValues,
  type LoginFormValues,
  type ResetRequestFormValues,
} from "@/lib/auth-schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// Mock data for login dashboard
const revenueData = [
  { m: "Jan", v: 850 }, { m: "Fev", v: 920 }, { m: "Mar", v: 780 },
  { m: "Abr", v: 1100 }, { m: "Mai", v: 950 }, { m: "Jun", v: 1250 },
  { m: "Jul", v: 1400 }, { m: "Ago", v: 1300 }, { m: "Set", v: 1550 },
  { m: "Out", v: 1680 }, { m: "Nov", v: 1820 }, { m: "Dez", v: 2100 },
];
const obraData = [
  { name: "Em andamento", value: 8, color: "hsl(207, 89%, 48%)" },
  { name: "Planejamento", value: 3, color: "hsl(45, 100%, 51%)" },
  { name: "Concluídas", value: 5, color: "hsl(152, 60%, 38%)" },
];
const vendasData = [
  { m: "Jan", u: 12 }, { m: "Fev", u: 18 }, { m: "Mar", u: 9 },
  { m: "Abr", u: 22 }, { m: "Mai", u: 15 }, { m: "Jun", u: 28 },
];

export default function Auth() {
  const [mode, setMode] = useState<"login" | "setup" | "forgot">("login");
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [hasAdminAccount, setHasAdminAccount] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const nextPath = useMemo(() => {
    const fromState = location.state as { from?: string } | null;
    return fromState?.from && fromState.from !== "/auth" ? fromState.from : "/";
  }, [location.state]);

  const loginForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const setupForm = useForm<BootstrapAdminFormValues>({ resolver: zodResolver(bootstrapAdminSchema), defaultValues: { fullName: "", email: "", password: "" } });
  const forgotForm = useForm<ResetRequestFormValues>({ resolver: zodResolver(resetRequestSchema), defaultValues: { email: "" } });

  useEffect(() => {
    const loadSetupStatus = async () => {
      const { data, error } = await supabase.rpc("has_admin_accounts");
      if (!error) { const exists = Boolean(data); setHasAdminAccount(exists); setMode(exists ? "login" : "setup"); }
      setCheckingSetup(false);
    };
    loadSetupStatus();
  }, []);

  useEffect(() => { if (user && isAdmin) navigate(nextPath, { replace: true }); }, [user, isAdmin, navigate, nextPath]);

  const handleLogin = loginForm.handleSubmit(async (values) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
    setSubmitting(false);
    if (error) { toast({ title: "Falha no login", description: error.message, variant: "destructive" }); return; }
    await refreshAuth();
    navigate(nextPath, { replace: true });
  });

  const handleBootstrap = setupForm.handleSubmit(async (values) => {
    setSubmitting(true);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: values.email, password: values.password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: values.fullName.trim() } },
    });
    if (signUpError) { setSubmitting(false); toast({ title: "Não foi possível criar o admin", description: signUpError.message, variant: "destructive" }); return; }
    await new Promise((r) => setTimeout(r, 1000));
    if (!signUpData.session) { setSubmitting(false); toast({ title: "Erro de autenticação", description: "Tente fazer login.", variant: "destructive" }); setMode("login"); return; }
    const { error: bootstrapError } = await supabase.rpc("bootstrap_first_admin", { _full_name: values.fullName.trim() });
    setSubmitting(false);
    if (bootstrapError) { toast({ title: "Admin não configurado", description: bootstrapError.message, variant: "destructive" }); return; }
    setHasAdminAccount(true);
    await refreshAuth();
    toast({ title: "Admin criado", description: "Primeiro acesso configurado com sucesso." });
    navigate("/", { replace: true });
  });

  const handleForgot = forgotForm.handleSubmit(async (values) => {
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo: `${window.location.origin}/reset-password` });
    setSubmitting(false);
    if (error) { toast({ title: "Erro ao enviar e-mail", description: error.message, variant: "destructive" }); return; }
    toast({ title: "E-mail enviado", description: "Confira sua caixa de entrada." });
    setMode("login");
  });

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(222, 30%, 12%)" }}>
        <div className="w-10 h-10 rounded-full border-4 border-white/10 border-t-[hsl(45,100%,51%)] animate-spin" />
      </div>
    );
  }

  const kpis = [
    { label: "Faturamento", value: "R$ 2,1M", change: "+14.8%", icon: DollarSign, color: "hsl(152, 60%, 38%)" },
    { label: "Obras Ativas", value: "8", change: "+2", icon: Building2, color: "hsl(207, 89%, 48%)" },
    { label: "Unidades Vendidas", value: "145", change: "+23%", icon: TrendingUp, color: "hsl(45, 100%, 51%)" },
    { label: "Equipe", value: "312", change: "+28", icon: Users, color: "hsl(174, 62%, 47%)" },
  ];

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: "hsl(222, 30%, 12%)" }}>
      {/* Power BI top bar */}
      <div className="h-11 flex items-center px-4 gap-3 shrink-0" style={{ background: "hsl(222, 30%, 8%)" }}>
        <BarChart3 className="w-5 h-5" style={{ color: "hsl(45, 100%, 51%)" }} />
        <span className="text-[14px] font-semibold text-white tracking-tight">San Remo Construtora</span>
        <div className="flex-1" />
        <span className="text-[11px]" style={{ color: "hsl(220, 15%, 55%)" }}>Painel de Gestão ERP</span>
      </div>

      <div className="min-h-[calc(100vh-2.75rem)] grid lg:grid-cols-[1.2fr_0.8fr]">
        {/* LEFT — Dashboard Preview */}
        <section className="hidden lg:block p-5 overflow-y-auto" style={{ background: "hsl(222, 30%, 14%)" }}>
          {/* KPI tiles */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="rounded-lg p-3" style={{ background: "hsl(222, 30%, 18%)", border: "1px solid hsl(220, 20%, 22%)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] uppercase tracking-wider" style={{ color: "hsl(220, 15%, 55%)" }}>{kpi.label}</span>
                    <Icon className="w-3 h-3" style={{ color: "hsl(220, 15%, 45%)" }} />
                  </div>
                  <p className="text-lg font-bold text-white">{kpi.value}</p>
                  <span className="text-[10px] font-medium" style={{ color: kpi.color }}>{kpi.change}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Revenue chart */}
            <div className="col-span-2 rounded-lg p-3" style={{ background: "hsl(222, 30%, 18%)", border: "1px solid hsl(220, 20%, 22%)" }}>
              <p className="text-[10px] font-semibold text-white/80 mb-2">Faturamento Mensal (R$ mil)</p>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(207, 89%, 48%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(207, 89%, 48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 22%)" />
                  <XAxis dataKey="m" tick={{ fill: "hsl(220, 15%, 50%)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(220, 15%, 50%)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(222, 30%, 18%)", border: "1px solid hsl(220, 20%, 30%)", borderRadius: "6px", fontSize: "10px", color: "#fff" }} />
                  <Area type="monotone" dataKey="v" stroke="hsl(207, 89%, 48%)" fill="url(#loginGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="rounded-lg p-3" style={{ background: "hsl(222, 30%, 18%)", border: "1px solid hsl(220, 20%, 22%)" }}>
              <p className="text-[10px] font-semibold text-white/80 mb-2">Obras por Status</p>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={obraData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} dataKey="value">
                    {obraData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(222, 30%, 18%)", border: "1px solid hsl(220, 20%, 30%)", borderRadius: "6px", fontSize: "10px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-1">
                {obraData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-[9px]" style={{ color: "hsl(220, 15%, 60%)" }}>{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Bar chart */}
            <div className="rounded-lg p-3" style={{ background: "hsl(222, 30%, 18%)", border: "1px solid hsl(220, 20%, 22%)" }}>
              <p className="text-[10px] font-semibold text-white/80 mb-2">Unidades Vendidas / Mês</p>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={vendasData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 22%)" />
                  <XAxis dataKey="m" tick={{ fill: "hsl(220, 15%, 50%)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(220, 15%, 50%)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(222, 30%, 18%)", border: "1px solid hsl(220, 20%, 30%)", borderRadius: "6px", fontSize: "10px", color: "#fff" }} />
                  <Bar dataKey="u" fill="hsl(45, 100%, 51%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Progress cards */}
            <div className="rounded-lg p-3" style={{ background: "hsl(222, 30%, 18%)", border: "1px solid hsl(220, 20%, 22%)" }}>
              <p className="text-[10px] font-semibold text-white/80 mb-3">Progresso das Obras</p>
              <div className="space-y-3">
                {[
                  { name: "Res. Vila Serena", pct: 82, color: "hsl(207, 89%, 48%)" },
                  { name: "Ed. Monte Carlo", pct: 45, color: "hsl(45, 100%, 51%)" },
                  { name: "Cond. Jardim Real", pct: 18, color: "hsl(152, 60%, 38%)" },
                  { name: "Res. Bela Vista", pct: 100, color: "hsl(174, 62%, 47%)" },
                ].map((obra) => (
                  <div key={obra.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-white/70">{obra.name}</span>
                      <span className="text-[10px] font-bold text-white">{obra.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "hsl(220, 20%, 25%)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${obra.pct}%`, background: obra.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metas row */}
          <div className="rounded-lg p-3" style={{ background: "hsl(222, 30%, 18%)", border: "1px solid hsl(220, 20%, 22%)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-3.5 h-3.5" style={{ color: "hsl(45, 100%, 51%)" }} />
              <p className="text-[10px] font-semibold text-white/80">Metas do Período</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Faturamento", atual: 2.1, meta: 3.0, unit: "M", color: "hsl(207, 89%, 48%)" },
                { label: "Obras Entregues", atual: 2, meta: 5, unit: "", color: "hsl(45, 100%, 51%)" },
                { label: "Satisfação", atual: 92, meta: 95, unit: "%", color: "hsl(152, 60%, 38%)" },
              ].map((m) => {
                const pct = Math.round((m.atual / m.meta) * 100);
                return (
                  <div key={m.label} className="text-center">
                    <div className="relative w-14 h-14 mx-auto mb-1.5">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(220, 20%, 25%)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke={m.color} strokeWidth="3" strokeDasharray={`${pct * 0.94} 100`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{pct}%</span>
                    </div>
                    <p className="text-[9px] text-white/50">{m.label}</p>
                    <p className="text-[10px] font-semibold text-white">{m.atual}{m.unit} / {m.meta}{m.unit}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT — Login Form */}
        <section className="flex items-center justify-center p-4 sm:p-8" style={{ background: "hsl(222, 30%, 10%)" }}>
          <div className="w-full max-w-md">
            {/* Logo + title */}
            <div className="flex items-center gap-4 mb-8">
              <img src={logoSanRemo} alt="Logo San Remo" className="h-12 w-12 object-contain rounded-lg p-1.5" style={{ background: "hsl(222, 30%, 18%)" }} />
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "hsl(45, 100%, 51%)" }}>ERP Dashboard</p>
                <h1 className="text-2xl font-bold text-white">San Remo</h1>
              </div>
            </div>

            <div className="rounded-xl p-6" style={{ background: "hsl(222, 30%, 16%)", border: "1px solid hsl(220, 20%, 22%)" }}>
              <h2 className="text-lg font-bold text-white mb-1">
                {mode === "setup" ? "Primeiro acesso" : mode === "forgot" ? "Recuperar senha" : "Entrar no painel"}
              </h2>
              <p className="text-[12px] mb-5" style={{ color: "hsl(220, 15%, 55%)" }}>
                {mode === "setup" ? "Crie o primeiro administrador." : mode === "forgot" ? "Informe seu e-mail para recuperação." : "Acesse seu dashboard administrativo."}
              </p>

              {!hasAdminAccount && mode === "setup" && (
                <Alert className="mb-4 border-none" style={{ background: "hsl(45, 100%, 51%, 0.1)" }}>
                  <AlertCircle className="h-4 w-4" style={{ color: "hsl(45, 100%, 51%)" }} />
                  <AlertTitle className="text-[12px] text-white">Configuração inicial</AlertTitle>
                  <AlertDescription className="text-[11px]" style={{ color: "hsl(220, 15%, 60%)" }}>
                    Este formulário só aparece enquanto não houver administrador.
                  </AlertDescription>
                </Alert>
              )}

              {mode === "login" && (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-[11px]" style={{ color: "hsl(220, 15%, 60%)" }}>E-mail</Label>
                    <Input id="login-email" type="email" autoComplete="email" maxLength={255} {...loginForm.register("email")}
                      className="h-9 text-[12px] border-none" style={{ background: "hsl(222, 30%, 20%)", color: "white" }} />
                    {loginForm.formState.errors.email && <p className="text-[11px]" style={{ color: "hsl(0, 72%, 51%)" }}>{loginForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-password" className="text-[11px]" style={{ color: "hsl(220, 15%, 60%)" }}>Senha</Label>
                    <Input id="login-password" type="password" autoComplete="current-password" maxLength={72} {...loginForm.register("password")}
                      className="h-9 text-[12px] border-none" style={{ background: "hsl(222, 30%, 20%)", color: "white" }} />
                    {loginForm.formState.errors.password && <p className="text-[11px]" style={{ color: "hsl(0, 72%, 51%)" }}>{loginForm.formState.errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full h-9 text-[12px] font-semibold gap-2" disabled={submitting}
                    style={{ background: "hsl(45, 100%, 51%)", color: "hsl(222, 30%, 10%)" }}>
                    {submitting ? "Entrando..." : "Entrar"} <ArrowRight className="w-4 h-4" />
                  </Button>
                  <button type="button" className="text-[11px] hover:underline" style={{ color: "hsl(207, 89%, 48%)" }} onClick={() => setMode("forgot")}>
                    Esqueci minha senha
                  </button>
                </form>
              )}

              {mode === "setup" && (
                <form className="space-y-4" onSubmit={handleBootstrap}>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]" style={{ color: "hsl(220, 15%, 60%)" }}>Nome completo</Label>
                    <Input maxLength={120} {...setupForm.register("fullName")}
                      className="h-9 text-[12px] border-none" style={{ background: "hsl(222, 30%, 20%)", color: "white" }} />
                    {setupForm.formState.errors.fullName && <p className="text-[11px]" style={{ color: "hsl(0, 72%, 51%)" }}>{setupForm.formState.errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]" style={{ color: "hsl(220, 15%, 60%)" }}>E-mail admin</Label>
                    <Input type="email" maxLength={255} {...setupForm.register("email")}
                      className="h-9 text-[12px] border-none" style={{ background: "hsl(222, 30%, 20%)", color: "white" }} />
                    {setupForm.formState.errors.email && <p className="text-[11px]" style={{ color: "hsl(0, 72%, 51%)" }}>{setupForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]" style={{ color: "hsl(220, 15%, 60%)" }}>Senha</Label>
                    <Input type="password" maxLength={72} {...setupForm.register("password")}
                      className="h-9 text-[12px] border-none" style={{ background: "hsl(222, 30%, 20%)", color: "white" }} />
                    {setupForm.formState.errors.password && <p className="text-[11px]" style={{ color: "hsl(0, 72%, 51%)" }}>{setupForm.formState.errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full h-9 text-[12px] font-semibold gap-2" disabled={submitting}
                    style={{ background: "hsl(45, 100%, 51%)", color: "hsl(222, 30%, 10%)" }}>
                    {submitting ? "Criando..." : "Criar primeiro admin"} <ShieldCheck className="w-4 h-4" />
                  </Button>
                </form>
              )}

              {mode === "forgot" && (
                <form className="space-y-4" onSubmit={handleForgot}>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]" style={{ color: "hsl(220, 15%, 60%)" }}>E-mail</Label>
                    <Input type="email" maxLength={255} {...forgotForm.register("email")}
                      className="h-9 text-[12px] border-none" style={{ background: "hsl(222, 30%, 20%)", color: "white" }} />
                    {forgotForm.formState.errors.email && <p className="text-[11px]" style={{ color: "hsl(0, 72%, 51%)" }}>{forgotForm.formState.errors.email.message}</p>}
                  </div>
                  <Button type="submit" className="w-full h-9 text-[12px] font-semibold gap-2" disabled={submitting}
                    style={{ background: "hsl(45, 100%, 51%)", color: "hsl(222, 30%, 10%)" }}>
                    {submitting ? "Enviando..." : "Enviar link"} <KeyRound className="w-4 h-4" />
                  </Button>
                </form>
              )}

              <div className="mt-4 text-[11px]">
                {hasAdminAccount ? (
                  <button type="button" className="hover:underline" style={{ color: "hsl(220, 15%, 55%)" }} onClick={() => setMode(mode === "forgot" ? "login" : "forgot")}>
                    {mode === "forgot" ? "← Voltar ao login" : "Precisa recuperar sua senha?"}
                  </button>
                ) : (
                  <span style={{ color: "hsl(220, 15%, 45%)" }}>Primeiro acesso habilitado</span>
                )}
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-[10px] mt-6" style={{ color: "hsl(220, 15%, 35%)" }}>
              © 2026 San Remo Construtora — Painel de Gestão ERP
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
