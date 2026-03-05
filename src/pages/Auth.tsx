import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
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

    const { error: signUpError } = await supabase.auth.signUp({
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-muted border-t-primary animate-spin" aria-label="Carregando" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 san-remo-gradient opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--accent)/0.22),transparent_32%),radial-gradient(circle_at_bottom_right,hsl(var(--primary-foreground)/0.14),transparent_22%)]" />

      <div className="relative min-h-screen grid lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden lg:flex flex-col justify-between p-10 text-primary-foreground">
          <div className="flex items-center gap-4">
            <img src={logoSanRemo} alt="Logo San Remo" className="h-14 w-14 object-contain rounded-md bg-card p-2" />
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-primary-foreground/70">Sistema ERP</p>
              <h1 className="text-4xl font-bold">San Remo</h1>
            </div>
          </div>

          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-2 text-sm text-primary-foreground/80">
              <ShieldCheck className="w-4 h-4" />
              Painel administrativo protegido
            </span>
            <h2 className="text-5xl leading-tight font-bold">
              Controle metas, relatórios e operação em um único painel administrativo.
            </h2>
            <p className="text-lg text-primary-foreground/72 font-sans">
              Acesso exclusivo para administradores com login por e-mail, recuperação de senha e proteção de rotas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-xl">
            {[
              ["Tempo real", "Atualização contínua"],
              ["Excel", "Importação prática"],
              ["PDF", "Relatórios executivos"],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-primary-foreground/15 bg-card/10 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm text-primary-foreground/70 font-sans">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-md border-border/60 bg-card/95 backdrop-blur erp-card-shadow">
            <CardHeader className="space-y-3">
              <div className="lg:hidden flex items-center gap-3">
                <img src={logoSanRemo} alt="Logo San Remo" className="h-11 w-11 object-contain rounded-md bg-muted p-2" />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Sistema ERP</p>
                  <CardTitle className="text-3xl">San Remo</CardTitle>
                </div>
              </div>

              <div>
                <CardTitle className="text-3xl">
                  {mode === "setup" ? "Primeiro acesso" : mode === "forgot" ? "Recuperar senha" : "Login administrativo"}
                </CardTitle>
                <CardDescription className="mt-2">
                  {mode === "setup"
                    ? "Crie o primeiro administrador do sistema com segurança."
                    : mode === "forgot"
                      ? "Informe seu e-mail para receber o link de redefinição."
                      : "Entre com seu e-mail e senha para acessar o dashboard admin."}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {!hasAdminAccount && mode === "setup" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuração inicial</AlertTitle>
                  <AlertDescription>
                    Este formulário só aparece enquanto o sistema ainda não tiver nenhum administrador cadastrado.
                  </AlertDescription>
                </Alert>
              )}

              {mode === "login" && (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input id="login-email" type="email" autoComplete="email" maxLength={255} {...loginForm.register("email")} />
                    {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input id="login-password" type="password" autoComplete="current-password" maxLength={72} {...loginForm.register("password")} />
                    {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    Entrar
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <button type="button" className="text-sm text-primary hover:underline" onClick={() => setMode("forgot")}>
                    Esqueci minha senha
                  </button>
                </form>
              )}

              {mode === "setup" && (
                <form className="space-y-4" onSubmit={handleBootstrap}>
                  <div className="space-y-2">
                    <Label htmlFor="setup-name">Nome completo</Label>
                    <Input id="setup-name" maxLength={120} {...setupForm.register("fullName")} />
                    {setupForm.formState.errors.fullName && <p className="text-sm text-destructive">{setupForm.formState.errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setup-email">E-mail admin</Label>
                    <Input id="setup-email" type="email" autoComplete="email" maxLength={255} {...setupForm.register("email")} />
                    {setupForm.formState.errors.email && <p className="text-sm text-destructive">{setupForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setup-password">Senha</Label>
                    <Input id="setup-password" type="password" autoComplete="new-password" maxLength={72} {...setupForm.register("password")} />
                    {setupForm.formState.errors.password && <p className="text-sm text-destructive">{setupForm.formState.errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    Criar primeiro admin
                    <ShieldCheck className="w-4 h-4" />
                  </Button>
                </form>
              )}

              {mode === "forgot" && (
                <form className="space-y-4" onSubmit={handleForgot}>
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">E-mail</Label>
                    <Input id="forgot-email" type="email" autoComplete="email" maxLength={255} {...forgotForm.register("email")} />
                    {forgotForm.formState.errors.email && <p className="text-sm text-destructive">{forgotForm.formState.errors.email.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    Enviar link de recuperação
                    <KeyRound className="w-4 h-4" />
                  </Button>
                </form>
              )}

              <div className="flex items-center justify-between text-sm font-sans">
                {hasAdminAccount ? (
                  <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "forgot" ? "login" : "forgot")}>
                    {mode === "forgot" ? "Voltar ao login" : "Precisa recuperar sua senha?"}
                  </button>
                ) : (
                  <span className="text-muted-foreground">Primeiro acesso habilitado</span>
                )}
                <Link to="/" className="text-primary hover:underline">Ir para o sistema</Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
