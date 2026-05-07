"use client";

import { useState, startTransition } from "react";
import Link from "next/link";
import { Shield, Check, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { DirectionalTransition } from "@/components/view-transition-wrapper";
import { useRouter } from "next/navigation";
import { addTransitionType } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { SimpleIcon } from "@/components/simple-icon";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");

  const passwordRequirements = [
    { label: "Ao menos 8 caracteres", met: passwordValue.length >= 8 },
    { label: "Uma letra maiúscula", met: /[A-Z]/.test(passwordValue) },
    { label: "Um número", met: /[0-9]/.test(passwordValue) },
  ];

  const navigateWithTransition = (href: string, type: 'nav-forward' | 'nav-back') => {
    startTransition(() => {
      addTransitionType(type);
      router.push(href);
    });
  };

  const onSubmit = async (values: RegisterInput) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      toast.success("Conta criada com sucesso", {
        description: "Um código de verificação foi enviado para seu e-mail."
      });
      setRegisteredEmail(values.email);
      setResendCooldown(60);
    } catch (err: any) {
      toast.error("Erro ao criar conta", {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (resendCooldown > 0 || !registeredEmail) return;
    setLoading(true);

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        const match = data.error.match(/Aguarde (\d+) segundos/);
        if (match) {
          setResendCooldown(parseInt(match[1]));
        }
        throw new Error(data.error || "Erro ao reenviar código");
      }

      toast.success("Código reenviado", {
        description: "Um novo código foi enviado para seu e-mail."
      });
      setResendCooldown(60);
    } catch (err: any) {
      toast.error("Erro ao reenviar código", {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async () => {
    if (otpValue.length < 6) return;
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail, code: otpValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Código inválido");
      }

      toast.success("E-mail verificado com sucesso", {
        description: "Sua conta está ativa e pronta para uso."
      });
      
      startTransition(() => {
        router.push("/dashboard");
      });
    } catch (err: any) {
      toast.error("Erro ao verificar e-mail", {
        description: err.message
      });
      setOtpValue("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DirectionalTransition>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 selection:bg-primary/20">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                navigateWithTransition('/', 'nav-back');
              }}
              className="inline-flex items-center gap-2 mb-8 group"
            >
              <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary/20">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">Contract <span className="text-primary italic">Lens</span></span>
            </Link>
          </div>

          <Card className="border-border shadow-2xl rounded-[2.5rem] overflow-hidden transition-all duration-500">
            {registeredEmail ? (
              <>
                <CardHeader>
                  <CardTitle className="text-3xl font-extrabold tracking-tight">Verifique seu e-mail</CardTitle>
                  <CardDescription className="text-muted-foreground pt-1">
                    Enviamos um código de 6 dígitos para <span className="text-foreground font-bold">{registeredEmail}</span>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex flex-col items-center justify-center space-y-4 py-4">
                    <InputOTP
                      maxLength={6}
                      value={otpValue}
                      onChange={setOtpValue}
                      onComplete={onVerifyOTP}
                      disabled={loading}
                    >
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} className="h-14 w-12 rounded-xl border-2 text-xl font-bold" />
                        <InputOTPSlot index={1} className="h-14 w-12 rounded-xl border-2 text-xl font-bold" />
                        <InputOTPSlot index={2} className="h-14 w-12 rounded-xl border-2 text-xl font-bold" />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={3} className="h-14 w-12 rounded-xl border-2 text-xl font-bold" />
                        <InputOTPSlot index={4} className="h-14 w-12 rounded-xl border-2 text-xl font-bold" />
                        <InputOTPSlot index={5} className="h-14 w-12 rounded-xl border-2 text-xl font-bold" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    onClick={onVerifyOTP}
                    disabled={loading || otpValue.length < 6}
                    className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:cursor-wait"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verificar código"}
                  </Button>

                  <div className="flex flex-col gap-4 text-center">
                    <button 
                      onClick={onResendCode}
                      disabled={loading || resendCooldown > 0}
                      className="text-xs font-bold text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      {resendCooldown > 0 ? `Reenviar código (${resendCooldown}s)` : "Reenviar código"}
                    </button>

                    <button 
                      onClick={() => setRegisteredEmail(null)}
                      disabled={loading}
                      className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                    >
                      Voltar para o cadastro
                    </button>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader>
                  <CardTitle className="text-3xl font-extrabold tracking-tight">Criar uma conta</CardTitle>
                  <CardDescription className="text-muted-foreground pt-1">
                    Comece a analisar seus contratos gratuitamente com o poder da IA.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold ml-1 cursor-pointer" htmlFor="name">Seu nome completo</label>
                      <div className="relative">
                        <Input
                          id="name"
                          type="text"
                          disabled={loading}
                          autoComplete="name"
                          className={cn(
                            "h-12 px-5 rounded-2xl border bg-muted/10 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all placeholder:text-muted-foreground/40",
                            errors.name ? "border-destructive focus-visible:ring-destructive/10" : "border-border"
                          )}
                          placeholder="João Silva"
                          {...register("name")}
                        />
                        {errors.name && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <HoverCard openDelay={0} closeDelay={0}>
                              <HoverCardTrigger asChild>
                                <AlertCircle className="h-5 w-5 text-destructive cursor-help animate-in fade-in zoom-in duration-200" />
                              </HoverCardTrigger>
                              <HoverCardContent side="right" className="w-60 p-3 rounded-xl border-destructive/20 bg-background text-destructive text-xs font-bold shadow-2xl">
                                {errors.name.message}
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold ml-1 cursor-pointer" htmlFor="email">Email</label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          disabled={loading}
                          autoComplete="email"
                          className={cn(
                            "h-12 px-5 rounded-2xl border bg-muted/10 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all placeholder:text-muted-foreground/40",
                            errors.email ? "border-destructive focus-visible:ring-destructive/10" : "border-border"
                          )}
                          placeholder="nome@exemplo.com"
                          {...register("email")}
                        />
                        {errors.email && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <HoverCard openDelay={0} closeDelay={0}>
                              <HoverCardTrigger asChild>
                                <AlertCircle className="h-5 w-5 text-destructive cursor-help animate-in fade-in zoom-in duration-200" />
                              </HoverCardTrigger>
                              <HoverCardContent side="right" className="w-60 p-3 rounded-xl border-destructive/20 bg-background text-destructive text-xs font-bold shadow-2xl">
                                {errors.email.message}
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold ml-1 cursor-pointer" htmlFor="password">Senha</label>
                      <div className="relative">
                        <Input
                          id="password"
                          type="password"
                          disabled={loading}
                          autoComplete="new-password"
                          className={cn(
                            "h-12 px-5 rounded-2xl border bg-muted/10 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all placeholder:text-muted-foreground/40",
                            errors.password ? "border-destructive focus-visible:ring-destructive/10" : "border-border"
                          )}
                          placeholder="••••••••"
                          {...register("password")}
                        />
                        {errors.password && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <HoverCard openDelay={0} closeDelay={0}>
                              <HoverCardTrigger asChild>
                                <AlertCircle className="h-5 w-5 text-destructive cursor-help animate-in fade-in zoom-in duration-200" />
                              </HoverCardTrigger>
                              <HoverCardContent side="right" className="w-60 p-3 rounded-xl border-destructive/20 bg-background text-destructive text-xs font-bold shadow-2xl">
                                {errors.password.message}
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2 pb-2">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className={cn(
                          "flex items-center gap-3 text-xs font-medium transition-colors",
                          req.met ? "text-emerald-600" : "text-muted-foreground"
                        )}>
                          <div className={cn(
                            "h-4 w-4 rounded-full flex items-center justify-center transition-colors",
                            req.met ? "bg-emerald-100" : "bg-muted"
                          )}>
                            {req.met ? (
                              <Check className="h-2.5 w-2.5" />
                            ) : (
                              <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            )}
                          </div>
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group/btn disabled:cursor-wait"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <>
                          Criar minha conta
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                      <span className="bg-background px-4 text-muted-foreground/60">Ou use suas redes</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline"
                      disabled={loading} 
                      className="h-12 rounded-2xl hover:bg-muted/50 transition-all font-medium text-sm active:scale-95 shadow-sm disabled:cursor-wait gap-3"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Google
                    </Button>
                    <Button 
                      variant="outline"
                      disabled={loading} 
                      className="h-12 rounded-2xl hover:bg-muted/50 transition-all font-medium text-sm active:scale-95 shadow-sm disabled:cursor-wait gap-3"
                    >
                      <SimpleIcon name="Github" className="h-5 w-5" />
                      GitHub
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>

          <p className="text-center mt-10 text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link 
              href="/login" 
              onClick={(e) => {
                e.preventDefault();
                navigateWithTransition('/login', 'nav-back');
              }}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Entrar agora
            </Link>
          </p>
        </div>
      </div>
    </DirectionalTransition>
  );
}
