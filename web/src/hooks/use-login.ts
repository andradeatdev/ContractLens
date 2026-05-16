"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { addTransitionType } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { toast } from "sonner";
import { APIError } from "@/lib/api-error";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigateWithTransition = (href: string, type: 'nav-forward' | 'nav-back') => {
    startTransition(() => {
      addTransitionType(type);
      router.push(href);
    });
  };

  const onSubmit = async (values: LoginInput) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(data, response.status);
      }

      toast.success("Login realizado com sucesso", {
        description: "Seja bem-vindo de volta ao Contract Lens."
      });
      navigateWithTransition('/dashboard', 'nav-forward');
    } catch (err: unknown) {
      if (err instanceof APIError && err.details) {
        err.details.forEach((detail) => {
          if (detail.field) {
            form.setError(detail.field as any, { type: "server", message: detail.message });
          }
        });
      }
      toast.error("Erro ao realizar login", {
        description: (err as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    onSubmit: form.handleSubmit(onSubmit),
    navigateWithTransition,
  };
}
