"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { addTransitionType } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { toast } from "sonner";
import { APIError } from "@/lib/api-error";

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const passwordRequirements = [
    { label: "Ao menos 8 caracteres", met: (form.watch("password") || "").length >= 8 },
    { label: "Uma letra maiúscula", met: /[A-Z]/.test(form.watch("password") || "") },
    { label: "Um número", met: /\d/.test(form.watch("password") || "") },
  ];

  const navigateWithTransition = (href: string, type: 'nav-forward' | 'nav-back') => {
    startTransition(() => {
      addTransitionType(type);
      router.push(href);
    });
  };

  const onRegister = async (values: RegisterInput) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(data, response.status);
      }

      toast.success("Conta criada com sucesso", {
        description: "Um código de verificação foi enviado para seu e-mail."
      });
      setRegisteredEmail(values.email);
      setResendCooldown(60);
    } catch (err: unknown) {
      if (err instanceof APIError && err.details) {
        err.details.forEach((detail: any) => {
          if (detail.field) {
            form.setError(detail.field as any, { type: "server", message: detail.message });
          }
        });
      }
      toast.error("Erro ao criar conta", {
        description: (err as Error).message
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
        if (data && data.error && typeof data.error === 'string') {
          const match = data.error.match(/Aguarde (\d+) segundos/);
          if (match) {
            setResendCooldown(parseInt(match[1]));
          }
        }
        throw new APIError(data, response.status);
      }

      toast.success("Código reenviado", {
        description: "Um novo código foi enviado para seu e-mail."
      });
      setResendCooldown(60);
    } catch (err: unknown) {
      toast.error("Erro ao reenviar código", {
        description: (err as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async (codeOverride?: string) => {
    const code = codeOverride || otpValue;
    if (code.length < 6 || !registeredEmail) return;
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(data, response.status);
      }

      toast.success("E-mail verificado com sucesso", {
        description: "Sua conta está ativa e pronta para uso."
      });
      
      startTransition(() => {
        router.push("/dashboard");
      });
    } catch (err: unknown) {
      toast.error("Erro ao verificar e-mail", {
        description: (err as Error).message
      });
      setOtpValue("");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    registeredEmail,
    otpValue,
    setOtpValue,
    resendCooldown,
    passwordRequirements,
    onRegister: form.handleSubmit(onRegister),
    onResendCode,
    onVerifyOTP,
    navigateWithTransition,
    setRegisteredEmail,
  };
}
