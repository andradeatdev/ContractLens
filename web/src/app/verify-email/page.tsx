"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    !token ? "error" : "loading"
  );
  const [message, setMessage] = useState(
    !token 
      ? "Token de verificação ausente ou inválido." 
      : "Verificando seu endereço de e-mail..."
  );

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/emails/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Seu e-mail foi verificado com sucesso! Agora você pode acessar sua conta.");
        } else {
          setStatus("error");
          setMessage(data.error || "Ocorreu um erro ao verificar seu e-mail.");
        }
      } catch (err) {
        console.error("Erro na verificação:", err);
        setStatus("error");
        setMessage("Erro de conexão. Tente novamente mais tarde.");
      }
    };

    verifyEmail();
  }, [token]);

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">{message}</p>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-500">
          <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <p className="text-sm font-medium text-foreground px-6 leading-relaxed">
            {message}
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-500">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
          <XCircle className="h-10 w-10" />
        </div>
        <p className="text-sm font-medium text-destructive px-6 leading-relaxed">
          {message}
        </p>
      </div>
    );
  };

  const renderFooter = () => {
    if (status === "success") {
      return (
        <Button asChild className="w-full h-12 rounded-xl font-bold gap-2">
          <Link href="/login">
            Ir para o Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      );
    }
    
    if (status === "error") {
      return (
        <Button asChild variant="outline" className="w-full h-12 rounded-xl font-bold">
          <Link href="/register">
            Tentar cadastrar novamente
          </Link>
        </Button>
      );
    }

    return (
      <p className="text-xs text-muted-foreground animate-pulse">
        Processando requisição segura...
      </p>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 selection:bg-primary/20">
      <Card className="w-full max-w-md border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">Verificação de E-mail</CardTitle>
          <CardDescription>
            Validando sua identidade no Contract Lens
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-10 text-center">
          {renderContent()}
        </CardContent>

        <CardFooter className="bg-muted/50 p-6 flex justify-center">
          {renderFooter()}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
