import { Navbar } from "@/components/navbar";
import { FileText, Scale, AlertCircle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Contract Lens",
  description: "Termos e condições de uso da plataforma Contract Lens.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container px-4 py-24 mx-auto max-w-3xl">
        <header className="space-y-4 mb-16 text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Termos de Uso</h1>
          <p className="text-muted-foreground text-lg font-medium">As regras para uma utilização segura e justa da nossa plataforma.</p>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
          <section className="bg-destructive/5 border border-destructive/20 p-8 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-3 text-destructive font-black">
              <AlertCircle className="h-6 w-6" />
              AVISO LEGAL IMPORTANTE
            </div>
            <p className="text-sm leading-relaxed">
              O Contract Lens é uma ferramenta de auxílio baseada em Inteligência Artificial. <strong>As análises fornecidas não constituem aconselhamento jurídico profissional.</strong> Nossa ferramenta visa auxiliar na identificação de pontos de atenção, mas não substitui a revisão por um advogado qualificado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Scale className="h-6 w-6 text-primary" />
              1. Aceitação dos Termos
            </h2>
            <p>Ao acessar e usar o Contract Lens, você concorda em cumprir estes termos. Se você não concordar com qualquer parte destes termos, não deverá utilizar o serviço.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">2. Descrição do Serviço</h2>
            <p>O Contract Lens oferece processamento de documentos PDF para extração de texto, resumo de cláusulas e identificação de riscos potenciais através de modelos de linguagem (IA).</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">3. Responsabilidades do Usuário</h2>
            <p>Você é responsável por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Manter a segurança de sua conta.</li>
              <li>Garantir que possui o direito legal de fazer o upload dos documentos processados.</li>
              <li>Validar as informações geradas pela IA antes de tomar qualquer decisão baseada nelas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">4. Limitação de Responsabilidade</h2>
            <p>Em nenhum caso o Contract Lens será responsável por danos decorrentes do uso ou da incapacidade de usar os serviços, incluindo, mas não se limitando a, erros na interpretação de cláusulas pela IA.</p>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-border/50 text-sm text-muted-foreground text-center">
          Última atualização: 16 de Maio de 2026
        </footer>
      </main>
    </div>
  );
}
