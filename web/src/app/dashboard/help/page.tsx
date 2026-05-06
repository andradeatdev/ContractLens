"use client";

import { HelpCircle, ChevronRight, MessageCircle, Mail, FileQuestion, ExternalLink } from "lucide-react";
import { DirectionalTransition } from "@/components/view-transition-wrapper";

const faqs = [
  { q: "Quais tipos de contrato posso analisar?", a: "Nossa IA é treinada para processar contratos de prestação de serviços, NDAs, contratos de aluguel e termos de uso em formato PDF." },
  { q: "Meus dados estão seguros?", a: "Sim. Utilizamos criptografia de ponta a ponta e seus documentos são processados de forma privada, nunca sendo usados para treinamento público de modelos." },
  { q: "Existe um limite de tamanho de arquivo?", a: "Atualmente suportamos arquivos PDF de até 10MB para garantir a melhor performance na análise." },
];

export default function HelpPage() {
  return (
    <DirectionalTransition>
      <div className="flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">App</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <h1 className="text-sm font-bold">Ajuda</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-muted/5 p-8">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
                <HelpCircle className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Como podemos ajudar?</h2>
              <p className="text-muted-foreground">Encontre respostas rápidas ou entre em contato com nosso suporte.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContactCard icon={<MessageCircle />} title="Chat ao vivo" description="Fale com um especialista agora mesmo." action="Iniciar chat" />
              <ContactCard icon={<Mail />} title="Email" description="Retornamos em até 24 horas úteis." action="Enviar email" />
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold px-2">Perguntas frequentes</h3>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-background p-8 rounded-[2rem] border border-border hover:border-primary/30 transition-all shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="mt-1"><FileQuestion className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="font-bold text-lg mb-2">{faq.q}</p>
                        <p className="text-muted-foreground text-pretty leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary p-10 rounded-[2.5rem] text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/20">
              <div>
                <h3 className="text-2xl font-bold mb-2">Documentação completa</h3>
                <p className="opacity-90">Aprenda a extrair o máximo do Contract Lens.</p>
              </div>
              <button className="bg-white text-primary px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shrink-0">
                Acessar docs
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DirectionalTransition>
  );
}

function ContactCard({ icon, title, description, action }: { icon: React.ReactNode, title: string, description: string, action: string }) {
  return (
    <div className="bg-background p-8 rounded-[2.5rem] border border-border hover:border-primary/30 transition-all shadow-sm flex flex-col items-start gap-6 group">
      <div className="p-4 rounded-2xl bg-muted text-muted-foreground group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-xl mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
        {action}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
