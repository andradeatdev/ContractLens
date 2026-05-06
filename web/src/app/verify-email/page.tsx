"use client";

import { useEffect, useState, use } from "react";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedSearchParams = use(searchParams);
  const token = resolvedSearchParams.token;
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação ausente.");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Seu e-mail foi verificado com sucesso!");
        } else {
          setStatus("error");
          setMessage(data.error || "Token inválido ou expirado.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Ocorreu um erro ao tentar verificar seu e-mail.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full shadow-xl border-none rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="pt-10 text-center">
          <div className="flex justify-center mb-6">
            {status === "loading" && (
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
            )}
            {status === "error" && (
              <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-black">
            {status === "loading" && "Verificando e-mail"}
            {status === "success" && "E-mail verificado!"}
            {status === "error" && "Erro na verificação"}
          </CardTitle>
          <CardDescription className="text-sm font-medium pt-2">
            {status === "loading" && "Por favor, aguarde um momento enquanto validamos seu cadastro."}
            {status === "success" && "Tudo pronto! Você já pode acessar todas as funcionalidades."}
            {status === "error" && message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-10 px-10">
          {status === "success" && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Sua conta foi ativada e está pronta para uso.
            </div>
          )}
          {status === "error" && (
            <div className="bg-destructive/5 text-destructive p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
              <XCircle className="h-4 w-4 shrink-0" />
              {message}
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-muted/50 p-6 flex justify-center">
          {status === "success" ? (
            <Button asChild className="w-full h-12 rounded-xl font-bold gap-2">
              <Link href="/login">
                Ir para o Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : status === "error" ? (
            <Button asChild variant="outline" className="w-full h-12 rounded-xl font-bold">
              <Link href="/register">
                Tentar cadastrar novamente
              </Link>
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground animate-pulse">
              Processando requisição segura...
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
