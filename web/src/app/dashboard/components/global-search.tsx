"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  // Handle Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setAnswer(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Falha na busca");
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip="Busca inteligente (Ctrl+K)"
          onClick={() => setOpen(true)}
          className="text-muted-foreground hover:bg-background hover:text-foreground h-12"
        >
          <Search className="shrink-0 size-5" />
          <span className="group-data-[collapsible=icon]:hidden">Busca Inteligente</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 group-data-[collapsible=icon]:hidden">
            <span className="text-xs">⌘</span>K
          </kbd>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl shadow-primary/10 gap-0">
          <DialogHeader className="p-4 border-b bg-muted/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle className="text-sm font-bold tracking-tight">Busca Global com IA</DialogTitle>
            </div>
            <form onSubmit={handleSearch} className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pergunte qualquer coisa sobre seus contratos..."
                className="pl-10 h-12 border-none focus-visible:ring-1 focus-visible:ring-primary/20 bg-background rounded-xl text-base shadow-inner"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && !loading && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <Button 
                    type="submit" 
                    size="icon" 
                    variant="ghost" 
                    className="h-10 w-10 rounded-lg hover:bg-primary/15 hover:scale-105 active:bg-primary/25 text-primary active:!translate-y-0 transition-all duration-200"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              )}
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </form>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="relative mb-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                    <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground animate-pulse">Lendo todos os seus contratos...</p>
                </motion.div>
              )}

              {!loading && answer && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl mt-1 shrink-0 border border-primary/20">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
                      {answer.split('\n').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50">
                      IA processou todos os documentos do seu repositório
                    </p>
                  </div>
                </motion.div>
              )}

              {!loading && !answer && !query && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted/30 p-4 rounded-full mb-4">
                    <Search className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-sm font-bold text-muted-foreground">Experimente perguntar:</h3>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {["Quais contratos vencem em 2026?", "Qual o valor total somado?", "Tenho contratos com a Empresa X?"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setQuery(suggestion)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
