"use client";

import { Navbar } from "@/components/navbar";
import { Shield, FileText, Zap, Search, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DirectionalTransition } from "@/components/view-transition-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RiskTrafficLight } from "@/components/risk-traffic-light";
import { SecurityBadge } from "@/components/security-badge";

export default function LandingPage() {
  return (
    <DirectionalTransition>
      <div className="flex flex-col min-h-screen selection:bg-primary/20 bg-background text-foreground">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="container px-4 md:px-8 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 gap-2 font-bold shadow-sm">
                  <Zap className="h-3 w-3 fill-current" aria-hidden="true" />
                  <span>Análise 10× mais rápida</span>
                </Badge>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.95] text-balance"
              >
                Pare de assinar <span className="text-primary italic">no escuro</span>.
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto text-pretty"
              >
                Nós lemos as letras miúdas para você. Identifique riscos, resuma cláusulas e tire dúvidas com uma IA treinada para proteger seus interesses.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl h-16 px-10 text-lg font-bold shadow-2xl shadow-primary/20 active:scale-95 group cursor-pointer"
                >
                  <Link href="/register">
                    Analisar meu contrato
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform ml-2" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-2xl h-16 px-10 text-lg font-bold active:scale-95 cursor-pointer bg-background"
                >
                  <Link href="#how-it-works">Ver como funciona</Link>
                </Button>
              </motion.div>

              <SecurityBadge />
            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[160px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[160px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Risk Traffic Light Section */}
        <section id="risk-traffic-light" className="py-24 relative overflow-hidden">
          <div className="container px-4 md:px-8 mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <RiskTrafficLight />
            </motion.div>
          </div>
          
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-muted/30 relative">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <Badge variant="outline" className="mb-4 font-bold border-primary/20 text-primary uppercase tracking-widest text-[10px] px-3 py-1">Funcionalidades</Badge>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Tudo o que você precisa para dormir tranquilo</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">Sua nova camada de segurança jurídica para o dia a dia.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Search className="h-8 w-8 text-primary" aria-hidden="true" />}
                title="Detectamos o que ninguém vê"
                description="Multas abusivas, prazos impossíveis ou obrigações ocultas. Nada passa despercebido pelo nosso olhar clínico."
                delay={0.1}
              />
              <FeatureCard 
                icon={<FileText className="h-8 w-8 text-primary" aria-hidden="true" />}
                title="Juridiquês traduzido"
                description="Esqueça a complexidade. Transformamos cláusulas densas em explicações simples e acionáveis para o seu dia a dia."
                delay={0.2}
              />
              <FeatureCard 
                icon={<MessageSquare className="h-8 w-8 text-primary" aria-hidden="true" />}
                title="Um especialista ao seu lado"
                description="Converse com o assistente para entender detalhes específicos ou pedir dicas de negociação em tempo real."
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-32 bg-background overflow-hidden border-y border-border/50">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="flex-1">
                <Badge variant="outline" className="mb-4 font-bold border-primary/20 text-primary uppercase tracking-widest text-[10px] px-3 py-1">Processo</Badge>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-10 leading-none">Segurança em três passos simples</h2>
                <div className="space-y-12">
                  <Step 
                    number="01" 
                    title="Envie seu PDF" 
                    description="Suba o arquivo de forma segura. Seus dados estão 100% protegidos e criptografados."
                  />
                  <Step 
                    number="02" 
                    title="A IA lê por você" 
                    description="Processamos o texto e destacamos os pontos de atenção em menos de 30 segundos."
                  />
                  <Step 
                    number="03" 
                    title="Tire conclusões" 
                    description="Use o resumo e o chat para tomar decisões informadas antes de assinar."
                  />
                </div>
              </div>
              <div className="flex-1 w-full max-w-2xl relative">
                <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-border shadow-2xl bg-muted/20 group flex items-center justify-center">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="relative p-12 bg-background/50 backdrop-blur-xl border border-white/10 rounded-full animate-float">
                      <Shield className="h-32 w-32 text-primary drop-shadow-2xl" aria-hidden="true" />
                   </div>
                </div>
                {/* Decorative dots */}
                <div className="absolute -top-12 -right-12 h-48 w-48 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 2px, transparent 0)', backgroundSize: '24px 24px' }} />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="container px-4 md:px-8 mx-auto">
            <motion.div 
              whileInView={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.95 }}
              viewport={{ once: true }}
              className="bg-primary rounded-[3.5rem] p-12 md:p-24 text-center text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/40 group"
            >
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tighter leading-none">
                  Entenda antes de assinar.
                </h2>
                <p className="text-primary-foreground/90 text-xl mb-12 text-pretty leading-relaxed">
                  Junte-se a milhares de usuários que economizam tempo e evitam problemas jurídicos com nossa plataforma.
                </p>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="rounded-2xl h-16 px-12 text-xl font-bold bg-white text-primary hover:bg-white/90 shadow-xl active:scale-95 cursor-pointer"
                >
                  <Link href="/register">Começar Gratuitamente</Link>
                </Button>
              </div>
              
              {/* Decorative blobs */}
              <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-700" />
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-border bg-background">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
                  <span className="text-xl font-black tracking-tight uppercase">Contract<span className="text-primary">Lens</span></span>
                </div>
                <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                  Democratizando o acesso ao entendimento jurídico através de IA generativa de ponta.
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <h4 className="font-bold text-sm">Plataforma</h4>
                  <ul className="space-y-3">
                    <li><Link href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Funcionalidades</Link></li>
                    <li><Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">Como funciona</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Enterprise</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-sm">Empresa</h4>
                  <ul className="space-y-3">
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Nossa história</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Carreiras</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contato</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-sm">Jurídico</h4>
                  <ul className="space-y-3">
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Termos de uso</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacidade</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookies</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-xs font-medium text-muted-foreground/60 tracking-widest uppercase">
                © 2026 AndradeatDev. Crafted for the legal future.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </DirectionalTransition>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="p-0 rounded-[2.5rem] bg-background border-border shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-300 group relative overflow-hidden h-full">
        <CardContent className="p-10">
          <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity">
            <Shield className="h-40 w-40 rotate-12" aria-hidden="true" />
          </div>
          <div className="mb-8 p-4 rounded-2xl bg-primary/5 w-fit group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
            {icon}
          </div>
          <h3 className="text-2xl font-bold mb-4 tracking-tight">{title}</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-8 group">
      <div className="text-6xl font-black text-primary/10 group-hover:text-primary/20 transition-colors select-none tabular-nums tracking-tighter">
        {number}
      </div>
      <div className="pt-2">
        <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors tracking-tight">{title}</h3>
        <p className="text-base text-muted-foreground text-pretty leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
