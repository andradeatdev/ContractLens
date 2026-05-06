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
  title: "Contract Lens",
  description: "Análise inteligente de contratos com IA",
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
