import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, KeyRound, ShieldCheck, BarChart3 } from "lucide-react";
import logoSanRemo from "@/assets/logo-san-remo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const setupForm = useForm<BootstrapAdminFormValues>({
    resolver: zodResolver(bootstrapAdminSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const forgotForm = useForm<ResetRequestFormValues>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    const loadSetupStatus = async () => {
      const { data, error } = await supabase.rpc("has_admin_accounts");
      if (!error) {
        const exists = Boolean(data);
        setHasAdminAccount(exists);
        setMode(exists ? "login" : "setup");
      }
      setCheckingSetup(false);
    };
    loadSetupStatus();
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      navigate(nextPath, { replace: true });
    }
  }, [user, isAdmin, navigate, nextPath]);

  const handleLogin = loginForm.handleSubmit(async (values) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Falha no login", description: error.message, variant: "destructive" });
      return;
    }
    await refreshAuth();
    navigate(nextPath, { replace: true });
  });

  const handleBootstrap = setupForm.handleSubmit(async (values) => {
    setSubmitting(true);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: values.fullName.trim() },
      },
    });
    if (signUpError) {
      setSubmitting(false);
      toast({ title: "Não foi possível criar o admin", description: signUpError.message, variant: "destructive" });
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));
    if (!signUpData.session) {
      setSubmitting(false);
      toast({ title: "Erro de autenticação", description: "Não foi possível autenticar automaticamente. Tente fazer login.", variant: "destructive" });
      setHasAdminAccount(false);
      setMode("login");
      return;
    }
    const { error: bootstrapError } = await supabase.rpc("bootstrap_first_admin", {
      _full_name: values.fullName.trim(),
    });
    setSubmitting(false);
    if (bootstrapError) {
      toast({ title: "Admin não configurado", description: bootstrapError.message, variant: "destructive" });
      return;
    }
    setHasAdminAccount(true);
    await refreshAuth();
    toast({ title: "Admin criado", description: "Primeiro acesso configurado com sucesso." });
    navigate("/", { replace: true });
  });

  const handleForgot = forgotForm.handleSubmit(async (values) => {
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erro ao enviar e-mail", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "E-mail enviado", description: "Confira sua caixa de entrada para redefinir a senha." });
    setMode("login");
  });

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" style={{ background: "hsl(0, 0%, 15%)" }}>
        <div className="w-10 h-10 rounded-full border-4 border-muted border-t-primary animate-spin" aria-label="Carregando" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "hsl(0, 0%, 15%)" }}>
      {/* Power BI header bar */}
      <div className="h-11 flex items-center px-4 gap-3" style={{ background: "hsl(0, 0%, 10%)" }}>
        <BarChart3 className="w-5 h-5" style={{ color: "hsl(45, 100%, 51%)" }} />
        <span className="text-[14px] font-semibold text-white">San Remo Construtora</span>
        <div className="flex-1" />
        <span className="text-[11px] text-white/50">Painel de Gestão</span>
      </div>

      <div className="relative min-h-[calc(100vh-2.75rem)] grid lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left panel */}
        <section className="hidden lg:flex flex-col justify-center p-12" style={{ background: "linear-gradient(135deg, hsl(0, 0%, 12%) 0%, hsl(0, 0%, 18%) 100%)" }}>
          <div className="max-w-lg space-y-8">
            <div className="flex items-center gap-4">
              <img src={logoSanRemo} alt="Logo San Remo" className="h-14 w-14 object-contain rounded-lg bg-white/10 p-2" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">Dashboard Analítico</p>
                <h1 className="text-4xl font-bold text-white">San Remo</h1>
              </div>
            </div>

            <h2 className="text-3xl leading-tight font-semibold text-white/90">
              Gerencie obras, metas e finanças com visualizações em tempo real.
            </h2>
            <p className="text-base text-white/50">
              Acesso exclusivo para administradores. Dashboards interativos estilo Power BI.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { title: "Dashboards", desc: "Gráficos interativos", color: "hsl(207, 89%, 48%)" },
                { title: "Metas", desc: "Acompanhamento visual", color: "hsl(45, 100%, 51%)" },
                { title: "Relatórios", desc: "Exportação PDF/Excel", color: "hsl(152, 60%, 38%)" },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-white/10 p-4" style={{ background: "hsl(0, 0%, 20%)" }}>
                  <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: item.color }} />
                  <p className="text-[13px] font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-[11px] text-white/50">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right panel — login form */}
        <section className="flex items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-md border-border/40 bg-card shadow-xl">
            <CardHeader className="space-y-3">
              <div className="lg:hidden flex items-center gap-3">
                <img src={logoSanRemo} alt="Logo San Remo" className="h-10 w-10 object-contain rounded-lg bg-muted p-1.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Dashboard</p>
                  <CardTitle className="text-2xl">San Remo</CardTitle>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {mode === "setup" ? "Primeiro acesso" : mode === "forgot" ? "Recuperar senha" : "Entrar no painel"}
                </CardTitle>
                <CardDescription className="mt-2 text-[13px]">
                  {mode === "setup"
                    ? "Crie o primeiro administrador do sistema."
                    : mode === "forgot"
                      ? "Informe seu e-mail para receber o link de redefinição."
                      : "Acesse seu dashboard administrativo."}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {!hasAdminAccount && mode === "setup" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuração inicial</AlertTitle>
                  <AlertDescription className="text-[12px]">
                    Este formulário só aparece enquanto o sistema não tiver administrador.
                  </AlertDescription>
                </Alert>
              )}

              {mode === "login" && (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-[12px]">E-mail</Label>
                    <Input id="login-email" type="email" autoComplete="email" maxLength={255} {...loginForm.register("email")} />
                    {loginForm.formState.errors.email && <p className="text-[12px] text-destructive">{loginForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-[12px]">Senha</Label>
                    <Input id="login-password" type="password" autoComplete="current-password" maxLength={72} {...loginForm.register("password")} />
                    {loginForm.formState.errors.password && <p className="text-[12px] text-destructive">{loginForm.formState.errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    Entrar <ArrowRight className="w-4 h-4" />
                  </Button>
                  <button type="button" className="text-[12px] text-primary hover:underline" onClick={() => setMode("forgot")}>
                    Esqueci minha senha
                  </button>
                </form>
              )}

              {mode === "setup" && (
                <form className="space-y-4" onSubmit={handleBootstrap}>
                  <div className="space-y-2">
                    <Label htmlFor="setup-name" className="text-[12px]">Nome completo</Label>
                    <Input id="setup-name" maxLength={120} {...setupForm.register("fullName")} />
                    {setupForm.formState.errors.fullName && <p className="text-[12px] text-destructive">{setupForm.formState.errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setup-email" className="text-[12px]">E-mail admin</Label>
                    <Input id="setup-email" type="email" autoComplete="email" maxLength={255} {...setupForm.register("email")} />
                    {setupForm.formState.errors.email && <p className="text-[12px] text-destructive">{setupForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setup-password" className="text-[12px]">Senha</Label>
                    <Input id="setup-password" type="password" autoComplete="new-password" maxLength={72} {...setupForm.register("password")} />
                    {setupForm.formState.errors.password && <p className="text-[12px] text-destructive">{setupForm.formState.errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    Criar primeiro admin <ShieldCheck className="w-4 h-4" />
                  </Button>
                </form>
              )}

              {mode === "forgot" && (
                <form className="space-y-4" onSubmit={handleForgot}>
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-[12px]">E-mail</Label>
                    <Input id="forgot-email" type="email" autoComplete="email" maxLength={255} {...forgotForm.register("email")} />
                    {forgotForm.formState.errors.email && <p className="text-[12px] text-destructive">{forgotForm.formState.errors.email.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    Enviar link de recuperação <KeyRound className="w-4 h-4" />
                  </Button>
                </form>
              )}

              <div className="flex items-center justify-between text-[12px]">
                {hasAdminAccount ? (
                  <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "forgot" ? "login" : "forgot")}>
                    {mode === "forgot" ? "Voltar ao login" : "Precisa recuperar sua senha?"}
                  </button>
                ) : (
                  <span className="text-muted-foreground">Primeiro acesso habilitado</span>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
