"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Shield } from "lucide-react";
import { startTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { addTransitionType } from "react";
import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/use-has-mounted";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const router = useRouter();
  const pathname = usePathname();

  const navigateWithTransition = (href: string, type: 'nav-forward' | 'nav-back') => {
    if (pathname === href) return;
    
    startTransition(() => {
      addTransitionType(type);
      router.push(href);
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link 
          href="/" 
          onClick={(e) => {
            e.preventDefault();
            navigateWithTransition('/', 'nav-back');
          }}
          className="flex items-center gap-2 group"
        >
          <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary/20">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Contract <span className="text-primary">Lens</span></span>

        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Como funciona
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {mounted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-full text-muted-foreground transition-all cursor-pointer"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Alternar para tema {theme === "dark" ? "claro" : "escuro"}</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <Link 
              href="/login" 
              onClick={(e) => {
                e.preventDefault();
                navigateWithTransition('/login', 'nav-forward');
              }}
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2"
            >
              Entrar
            </Link>
            <Button
              asChild
              className="rounded-xl bg-primary font-bold shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
            >
              <Link
                href="/register"
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithTransition('/register', 'nav-forward');
                }}
              >
                Começar agora
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
