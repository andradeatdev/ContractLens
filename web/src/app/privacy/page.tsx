import { Navbar } from "@/components/navbar";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Contract Lens",
  description: "Saiba como protegemos seus dados e documentos jurídicos no Contract Lens.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container px-4 py-24 mx-auto max-w-3xl">
        <header className="space-y-4 mb-16 text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Política de Privacidade</h1>
          <p className="text-muted-foreground text-lg font-medium">Transparência e segurança no tratamento dos seus dados.</p>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Lock className="h-6 w-6 text-primary" />
              1. Introdução
            </h2>
            <p>No Contract Lens, levamos a sua privacidade e a confidencialidade dos seus documentos jurídicos muito a sério. Esta política descreve como tratamos, processamos e protegemos seus dados.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Eye className="h-6 w-6 text-primary" />
              2. Coleta e Uso de Dados
            </h2>
            <ul className="space-y-4 list-none pl-0">
              <li className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                <strong>Dados do Contrato:</strong> Quando você envia um PDF, extraímos o texto para fornecer a análise. O PDF original é armazenado de forma segura para permitir que você o baixe posteriormente.
              </li>
              <li className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                <strong>Metadados do Usuário:</strong> Armazenamos seu nome, e-mail e preferências para gerenciar sua conta e fornecer uma experiência personalizada.
              </li>
              <li className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                <strong>Dados de Análise:</strong> Os resumos, avaliações de risco e histórico de chat gerados pela nossa IA são armazenados para fornecer um fluxo de trabalho contínuo.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FileCheck className="h-6 w-6 text-primary" />
              3. Processamento de IA (Google Gemini)
            </h2>
            <p>O Contract Lens utiliza o <strong>Google Gemini Flash 2.5 Lite</strong> para análise de documentos e chat.</p>
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[2rem] space-y-2">
              <p className="font-bold text-emerald-700 dark:text-emerald-400">Compromisso de Privacidade:</p>
              <p className="text-sm">Utilizamos a plataforma Google AI Enterprise. De acordo com os termos do Google para camadas corporativas, <strong>seus dados NÃO são usados para treinar os modelos base deles.</strong></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">4. Segurança dos Dados</h2>
            <p>Implementamos medidas técnicas rigorosas para garantir que seus dados permaneçam privados:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Criptografia em trânsito via HTTPS (TLS 1.2+).</li>
              <li>Criptografia em repouso usando AES-256 para todos os textos de contratos e análises.</li>
              <li>Armazenamento de arquivos no Vercel Blob, garantindo alta disponibilidade e segurança física.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">5. Seus Direitos (LGPD)</h2>
            <p>Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados a qualquer momento através do dashboard da plataforma.</p>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-border/50 text-sm text-muted-foreground text-center">
          Última atualização: 16 de Maio de 2026
        </footer>
      </main>
    </div>
  );
}
