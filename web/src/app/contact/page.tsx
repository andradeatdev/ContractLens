import { Navbar } from "@/components/navbar";
import { Mail, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato | Contract Lens",
  description: "Entre em contato com a equipe do Contract Lens para dúvidas, suporte ou parcerias.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container px-4 py-24 mx-auto max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <header className="space-y-4">
              <h1 className="text-5xl font-black tracking-tight leading-none">Fale <span className="text-primary italic">conosco</span>.</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Dúvidas sobre a plataforma, sugestões de funcionalidades ou propostas comerciais? Estamos aqui para ouvir.
              </p>
            </header>

            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="bg-primary/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">E-mail</p>
                  <p className="text-lg font-bold">contato@contractlens.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group">
                <div className="bg-primary/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Suporte</p>
                  <p className="text-lg font-bold">atendimento@contractlens.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-8 md:p-12 rounded-[3rem] border border-border/50">
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Nome Completo</label>
                <Input placeholder="Seu nome" className="rounded-xl h-12 bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">E-mail Corporativo</label>
                <Input type="email" placeholder="seu@email.com" className="rounded-xl h-12 bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Sua Mensagem</label>
                <Textarea placeholder="Como podemos ajudar?" className="rounded-xl min-h-32 bg-background resize-none" />
              </div>
              <Button className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20">
                <Send className="h-5 w-5" />
                Enviar Mensagem
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
