import Link from "next/link";
import { Compass } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

export default async function GlobalNotFound() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("session_token"); // Verifica se o usuário está logado
  const sidebarState = cookieStore.get("sidebar_state")?.value === "true";

  // Se estiver logado, mostramos a 404 dentro do Shell do App (com Sidebar)
  if (isAuthenticated) {
    return (
      <SidebarProvider defaultOpen={sidebarState}>
        <div className="flex min-h-screen bg-background w-full">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0">
            <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md px-8 flex items-center sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">App</span>
                <span className="text-muted-foreground/30">/</span>
                <span className="text-sm font-medium">Erro 404</span>
              </div>
            </header>
            
            <div className="flex-1 flex items-center justify-center p-8 bg-muted/5">
              <div className="max-w-md w-full text-center space-y-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted border border-border">
                  <Compass className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Recurso não encontrado</h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A página ou contrato que você procura não existe. Use a barra lateral para navegar para outra seção.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button asChild variant="default" className="h-10 font-medium">
                    <Link href="/dashboard">Ir para o Dashboard</Link>
                  </Button>
                  <Button asChild variant="ghost" className="h-10 text-muted-foreground">
                    <Link href="/dashboard/contracts">Ver meus contratos</Link>
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Se for um convidado, mostramos a 404 com a Navbar da Landing Page
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full space-y-10 text-center">
          <div className="space-y-4">
            <h1 className="text-8xl font-bold tracking-tighter text-foreground/10 select-none">404</h1>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Página não encontrada</h2>
              <p className="text-sm text-muted-foreground">
                O link que você acessou pode estar quebrado ou a página foi movida.
              </p>
            </div>
          </div>

          <div className="h-px bg-border w-12 mx-auto" />

          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
              <Link href="/">Voltar ao início</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-xl font-bold text-muted-foreground">
              <Link href="/login">Fazer login</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground/50 font-medium pt-8">
            © 2026 Contract Lens &bull; Inteligência Jurídica
          </p>
        </div>
      </main>
    </div>
  );
}
