import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, ArrowRight, KeyRound, ShieldCheck,
  BarChart3, TrendingUp, Building2, DollarSign, Users, Target,
  Lock, Mail, User, Eye, EyeOff, Sparkles,
} from "lucide-react";
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

// Animated background particles
const FloatingParticle = ({ delay, size, x, y, duration }: { delay: number; size: number; x: string; y: string; duration: number }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: `radial-gradient(circle, hsl(45, 100%, 51%, 0.15), transparent)`,
    }}
    animate={{
      y: [0, -30, 0],
      opacity: [0.3, 0.7, 0.3],
      scale: [1, 1.2, 1],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

// KPI data
const kpis = [
  { label: "Faturamento", value: "R$ 2,1M", change: "+14.8%", icon: DollarSign, color: "hsl(152, 60%, 38%)" },
  { label: "Obras Ativas", value: "8", change: "+2", icon: Building2, color: "hsl(207, 89%, 48%)" },
  { label: "Unidades", value: "145", change: "+23%", icon: TrendingUp, color: "hsl(45, 100%, 51%)" },
  { label: "Equipe", value: "312", change: "+28", icon: Users, color: "hsl(174, 62%, 47%)" },
];

const features = [
  { icon: BarChart3, title: "Dashboard em Tempo Real", desc: "Visualize KPIs e métricas atualizados instantaneamente" },
  { icon: Target, title: "Gestão de Metas", desc: "Acompanhe objetivos com editor avançado e flexível" },
  { icon: Building2, title: "Controle de Obras", desc: "Gerencie projetos, etapas e fornecedores" },
  { icon: TrendingUp, title: "Relatórios Inteligentes", desc: "Exporte análises detalhadas em PDF e Excel" },
];

export default function Auth() {
  const [mode, setMode] = useState<"login" | "setup" | "forgot">("login");
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [hasAdminAccount, setHasAdminAccount] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(222, 30%, 8%)" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-white/5"
          style={{ borderTopColor: "hsl(45, 100%, 51%)" }}
        />
      </div>
    );
  }

  const inputClass = "h-11 text-sm border-none pl-11 placeholder:text-white/25 focus-visible:ring-1 focus-visible:ring-[hsl(45,100%,51%,0.5)]";
  const inputStyle = { background: "hsl(222, 30%, 16%)", color: "white" };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "hsl(222, 30%, 8%)" }}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -right-1/2 w-full h-full opacity-30"
          style={{
            background: "radial-gradient(ellipse at center, hsl(45, 100%, 51%, 0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-1/2 -left-1/2 w-full h-full opacity-20"
          style={{
            background: "radial-gradient(ellipse at center, hsl(207, 89%, 48%, 0.08) 0%, transparent 70%)",
          }}
        />
        <FloatingParticle delay={0} size={120} x="10%" y="20%" duration={6} />
        <FloatingParticle delay={1} size={80} x="80%" y="60%" duration={8} />
        <FloatingParticle delay={2} size={60} x="50%" y="10%" duration={7} />
        <FloatingParticle delay={3} size={100} x="20%" y="70%" duration={9} />
        <FloatingParticle delay={1.5} size={40} x="70%" y="30%" duration={5} />
      </div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {/* LEFT — Branding & Features */}
        <section className="hidden lg:flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-4 mb-10">
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(45, 100%, 51%), hsl(38, 92%, 45%))" }}
                >
                  <img src={logoSanRemo} alt="Logo San Remo" className="h-10 w-10 object-contain" />
                </div>
                <motion.div
                  className="absolute -inset-1 rounded-2xl"
                  style={{ border: "1px solid hsl(45, 100%, 51%, 0.3)" }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] font-medium" style={{ color: "hsl(45, 100%, 51%)" }}>
                  Business Navigator
                </p>
                <h1 className="text-3xl font-bold text-white tracking-tight">San Remo</h1>
              </div>
            </div>

            {/* Tagline */}
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Gestão inteligente
              <br />
              <span style={{ color: "hsl(45, 100%, 51%)" }}>ao seu alcance.</span>
            </h2>
            <p className="text-base mb-12" style={{ color: "hsl(220, 15%, 55%)" }}>
              Controle total sobre metas, obras, finanças e equipe em um único painel de comando.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className="rounded-xl p-4 group hover:scale-[1.02] transition-transform duration-300"
                    style={{
                      background: "hsl(222, 30%, 12%)",
                      border: "1px solid hsl(220, 20%, 18%)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: "hsl(45, 100%, 51%, 0.1)" }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: "hsl(45, 100%, 51%)" }} />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">{feat.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "hsl(220, 15%, 50%)" }}>{feat.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* KPI preview strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 flex gap-6"
            >
              {kpis.map((kpi) => (
                <div key={kpi.label} className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{kpi.value}</span>
                  <div>
                    <span className="text-[10px] block" style={{ color: "hsl(220, 15%, 50%)" }}>{kpi.label}</span>
                    <span className="text-xs font-semibold" style={{ color: kpi.color }}>{kpi.change}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* RIGHT — Login Form */}
        <section className="flex items-center justify-center p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-[420px]"
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(45, 100%, 51%), hsl(38, 92%, 45%))" }}
              >
                <img src={logoSanRemo} alt="Logo San Remo" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "hsl(45, 100%, 51%)" }}>ERP</p>
                <h1 className="text-xl font-bold text-white">San Remo</h1>
              </div>
            </div>

            {/* Card */}
            <div
              className="rounded-2xl p-8 backdrop-blur-sm"
              style={{
                background: "linear-gradient(145deg, hsl(222, 30%, 14%), hsl(222, 30%, 11%))",
                border: "1px solid hsl(220, 20%, 20%)",
                boxShadow: "0 25px 60px -12px hsl(222, 30%, 5%, 0.8), 0 0 0 1px hsl(220, 20%, 18%)",
              }}
            >
              {/* Header icon */}
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(45, 100%, 51%, 0.15), hsl(45, 100%, 51%, 0.05))" }}
                  animate={{ boxShadow: ["0 0 0 0 hsl(45, 100%, 51%, 0)", "0 0 20px 4px hsl(45, 100%, 51%, 0.1)", "0 0 0 0 hsl(45, 100%, 51%, 0)"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {mode === "setup" ? (
                    <ShieldCheck className="w-7 h-7" style={{ color: "hsl(45, 100%, 51%)" }} />
                  ) : mode === "forgot" ? (
                    <KeyRound className="w-7 h-7" style={{ color: "hsl(45, 100%, 51%)" }} />
                  ) : (
                    <Lock className="w-7 h-7" style={{ color: "hsl(45, 100%, 51%)" }} />
                  )}
                </motion.div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-white text-center mb-1">
                    {mode === "setup" ? "Configuração Inicial" : mode === "forgot" ? "Recuperar Senha" : "Bem-vindo de volta"}
                  </h2>
                  <p className="text-sm text-center mb-6" style={{ color: "hsl(220, 15%, 50%)" }}>
                    {mode === "setup"
                      ? "Crie o primeiro administrador do sistema"
                      : mode === "forgot"
                      ? "Enviaremos um link de recuperação"
                      : "Acesse o painel de gestão"}
                  </p>

                  {!hasAdminAccount && mode === "setup" && (
                    <Alert className="mb-5 border-none rounded-xl" style={{ background: "hsl(45, 100%, 51%, 0.08)" }}>
                      <Sparkles className="h-4 w-4" style={{ color: "hsl(45, 100%, 51%)" }} />
                      <AlertTitle className="text-sm text-white">Primeiro acesso</AlertTitle>
                      <AlertDescription className="text-xs" style={{ color: "hsl(220, 15%, 55%)" }}>
                        Configure seu administrador para começar.
                      </AlertDescription>
                    </Alert>
                  )}

                  {mode === "login" && (
                    <form className="space-y-4" onSubmit={handleLogin}>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "hsl(220, 15%, 55%)" }}>E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(220, 15%, 40%)" }} />
                          <Input
                            type="email" autoComplete="email" maxLength={255}
                            placeholder="seu@email.com"
                            {...loginForm.register("email")}
                            className={inputClass} style={inputStyle}
                          />
                        </div>
                        {loginForm.formState.errors.email && <p className="text-xs" style={{ color: "hsl(0, 72%, 60%)" }}>{loginForm.formState.errors.email.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "hsl(220, 15%, 55%)" }}>Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(220, 15%, 40%)" }} />
                          <Input
                            type={showPassword ? "text" : "password"} autoComplete="current-password" maxLength={72}
                            placeholder="••••••••"
                            {...loginForm.register("password")}
                            className={`${inputClass} pr-11`} style={inputStyle}
                          />
                          <button
                            type="button"
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword
                              ? <EyeOff className="w-4 h-4" style={{ color: "hsl(220, 15%, 40%)" }} />
                              : <Eye className="w-4 h-4" style={{ color: "hsl(220, 15%, 40%)" }} />
                            }
                          </button>
                        </div>
                        {loginForm.formState.errors.password && <p className="text-xs" style={{ color: "hsl(0, 72%, 60%)" }}>{loginForm.formState.errors.password.message}</p>}
                      </div>

                      <div className="flex justify-end">
                        <button type="button" className="text-xs hover:underline transition-colors" style={{ color: "hsl(207, 89%, 55%)" }} onClick={() => setMode("forgot")}>
                          Esqueci minha senha
                        </button>
                      </div>

                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          className="w-full h-11 text-sm font-bold gap-2 rounded-xl transition-all duration-300"
                          disabled={submitting}
                          style={{
                            background: "linear-gradient(135deg, hsl(45, 100%, 51%), hsl(38, 92%, 42%))",
                            color: "hsl(222, 30%, 8%)",
                            boxShadow: "0 4px 20px -4px hsl(45, 100%, 51%, 0.4)",
                          }}
                        >
                          {submitting ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <>{`Entrar`} <ArrowRight className="w-4 h-4" /></>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  )}

                  {mode === "setup" && (
                    <form className="space-y-4" onSubmit={handleBootstrap}>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "hsl(220, 15%, 55%)" }}>Nome completo</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(220, 15%, 40%)" }} />
                          <Input maxLength={120} placeholder="Seu nome completo" {...setupForm.register("fullName")}
                            className={inputClass} style={inputStyle} />
                        </div>
                        {setupForm.formState.errors.fullName && <p className="text-xs" style={{ color: "hsl(0, 72%, 60%)" }}>{setupForm.formState.errors.fullName.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "hsl(220, 15%, 55%)" }}>E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(220, 15%, 40%)" }} />
                          <Input type="email" maxLength={255} placeholder="admin@empresa.com" {...setupForm.register("email")}
                            className={inputClass} style={inputStyle} />
                        </div>
                        {setupForm.formState.errors.email && <p className="text-xs" style={{ color: "hsl(0, 72%, 60%)" }}>{setupForm.formState.errors.email.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "hsl(220, 15%, 55%)" }}>Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(220, 15%, 40%)" }} />
                          <Input type={showPassword ? "text" : "password"} maxLength={72} placeholder="Mínimo 6 caracteres" {...setupForm.register("password")}
                            className={`${inputClass} pr-11`} style={inputStyle} />
                          <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="w-4 h-4" style={{ color: "hsl(220, 15%, 40%)" }} /> : <Eye className="w-4 h-4" style={{ color: "hsl(220, 15%, 40%)" }} />}
                          </button>
                        </div>
                        {setupForm.formState.errors.password && <p className="text-xs" style={{ color: "hsl(0, 72%, 60%)" }}>{setupForm.formState.errors.password.message}</p>}
                      </div>

                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full h-11 text-sm font-bold gap-2 rounded-xl" disabled={submitting}
                          style={{ background: "linear-gradient(135deg, hsl(45, 100%, 51%), hsl(38, 92%, 42%))", color: "hsl(222, 30%, 8%)", boxShadow: "0 4px 20px -4px hsl(45, 100%, 51%, 0.4)" }}>
                          {submitting ? "Criando..." : "Criar primeiro admin"} <ShieldCheck className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </form>
                  )}

                  {mode === "forgot" && (
                    <form className="space-y-4" onSubmit={handleForgot}>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "hsl(220, 15%, 55%)" }}>E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(220, 15%, 40%)" }} />
                          <Input type="email" maxLength={255} placeholder="seu@email.com" {...forgotForm.register("email")}
                            className={inputClass} style={inputStyle} />
                        </div>
                        {forgotForm.formState.errors.email && <p className="text-xs" style={{ color: "hsl(0, 72%, 60%)" }}>{forgotForm.formState.errors.email.message}</p>}
                      </div>
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full h-11 text-sm font-bold gap-2 rounded-xl" disabled={submitting}
                          style={{ background: "linear-gradient(135deg, hsl(45, 100%, 51%), hsl(38, 92%, 42%))", color: "hsl(222, 30%, 8%)", boxShadow: "0 4px 20px -4px hsl(45, 100%, 51%, 0.4)" }}>
                          {submitting ? "Enviando..." : "Enviar link de recuperação"} <KeyRound className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </form>
                  )}

                  {/* Mode switch */}
                  <div className="mt-5 text-center">
                    {hasAdminAccount ? (
                      <button
                        type="button"
                        className="text-xs hover:underline transition-colors"
                        style={{ color: "hsl(220, 15%, 50%)" }}
                        onClick={() => setMode(mode === "forgot" ? "login" : "forgot")}
                      >
                        {mode === "forgot" ? "← Voltar ao login" : "Esqueceu sua senha?"}
                      </button>
                    ) : (
                      <span className="text-xs" style={{ color: "hsl(220, 15%, 40%)" }}>Primeiro acesso habilitado</span>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: "hsl(152, 60%, 38%)" }} />
              <span className="text-[11px]" style={{ color: "hsl(220, 15%, 40%)" }}>Conexão segura e criptografada</span>
            </div>

            {/* Footer */}
            <p className="text-center text-[10px] mt-4" style={{ color: "hsl(220, 15%, 28%)" }}>
              © 2026 San Remo Construtora — Business Navigator Pro
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
