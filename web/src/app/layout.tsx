import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModalProvider } from "@/components/modal-provider";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contract Lens | Análise Inteligente de Contratos com IA",
  description: "Identifique riscos, resuma cláusulas e tire dúvidas sobre seus contratos jurídicos em segundos usando inteligência artificial de ponta.",
  keywords: ["Análise de contrato IA", "Legal Tech Brasil", "Revisão de contrato automática", "Extração de dados PDF jurídico"],
  authors: [{ name: "Gabriel Andrade" }],
  openGraph: {
    title: "Contract Lens | Análise Inteligente de Contratos com IA",
    description: "Simplifique seu jurídico. Identifique riscos ocultos em contratos automaticamente.",
    url: "https://contract-lens.xyz", // Substituir pelo domínio real quando disponível
    siteName: "Contract Lens",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contract Lens | Análise Inteligente de Contratos com IA",
    description: "Identifique riscos ocultos em seus contratos jurídicos em segundos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full bg-background text-foreground transition-colors duration-300">
        <NextTopLoader 
          color="hsl(var(--primary))" 
          showSpinner={false}
          height={3}
        />
        <Providers>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Contract Lens",
                "operatingSystem": "Web",
                "applicationCategory": "BusinessApplication",
                "description": "Análise inteligente de contratos jurídicos utilizando IA para identificação de riscos e resumo de cláusulas.",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "BRL"
                }
              })
            }}
          />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ModalProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </ModalProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
