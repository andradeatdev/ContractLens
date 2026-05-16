"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, Loader2, Send, Copy, MessageSquarePlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { contractAnalysisSchema } from "@/lib/validations/contract-analysis";
import { toast } from "sonner";

const PLACEHOLDERS = [
  "Ex: 'Fica eleito o foro da comarca de Dubai para dirimir quaisquer dúvidas...'",
  "Ex: 'O contrato poderá ser rescindido unilateralmente com aviso de 30 dias...'",
  "Ex: 'Multa de 50% sobre o valor total do contrato em caso de rescisão...'",
  "Ex: 'As partes renunciam ao direito de ação judicial, preferindo arbitragem...'"
];

interface AnalysisResult {
  severity: "low" | "medium" | "high";
  title: string;
  explanation: string;
  suggestion: string;
}

export function RiskTrafficLight() {
  const [clause, setClause] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async () => {
    setError(null);
    const result = contractAnalysisSchema.safeParse({ clause });
    
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clause }),
      });      
      if (!response.ok) throw new Error("Falha na análise");

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError("Erro ao processar análise. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Sugestão copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityColors = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low":
        return <CheckCircle2 className="h-6 w-6" />;
      case "medium":
        return <Info className="h-6 w-6" />;
      case "high":
        return <AlertCircle className="h-6 w-6" />;
      default:
        return null;
    }
  };

  return (
    <Card className="rounded-[2.5rem] border-border shadow-2xl bg-background/50 backdrop-blur-xl overflow-hidden max-w-4xl mx-auto">
      <CardContent className="p-8 md:p-12">
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-black tracking-tight">Semáforo de Riscos 🚦</h3>
            <p className="text-muted-foreground">
              Cole uma cláusula que você achou estranha ou confusa e descubra o nível de risco em segundos.
            </p>
          </div>

          <div className="relative group">
            <Textarea
              placeholder={PLACEHOLDERS[placeholderIdx]}
              className={cn("min-h-[160px] rounded-2xl p-6 bg-muted/30 border-border focus:border-primary/50 transition-all resize-none text-lg", error && "border-destructive")}
              value={clause}
              onChange={(e) => {
                setClause(e.target.value);
                if (error) setError(null);
              }}
              suppressHydrationWarning
            />
            <div className="flex justify-between items-center mt-2 px-1">
               {error ? (
                  <p className="text-destructive text-sm font-bold">{error}</p>
               ) : (
                  <p className="text-xs text-muted-foreground">
                    {clause.length} / 10+ caracteres mínimos
                  </p>
               )}
            </div>
            <Button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              suppressHydrationWarning
              className="absolute bottom-12 right-4 rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 group cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Analisar
                  <Send className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "rounded-3xl p-8 border-2 flex flex-col md:flex-row gap-6 items-start transition-all",
                  getSeverityColors(result.severity)
                )}
              >
                <div className="p-3 rounded-2xl bg-background shadow-sm">
                  {getSeverityIcon(result.severity)}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Badge variant="outline" className="mb-2 font-bold uppercase tracking-widest text-[10px] bg-background">
                      {result.severity === 'low' ? 'Seguro' : result.severity === 'medium' ? 'Atenção' : 'Perigo'}
                    </Badge>
                    <h4 className="text-2xl font-black leading-none tracking-tight text-foreground">
                      {result.title}
                    </h4>
                  </div>
                  <div className="space-y-4 text-foreground/80 leading-relaxed">
                    <p><strong>Por que?</strong> {result.explanation}</p>
                    <p className="p-4 rounded-xl bg-background/50 border border-current/10">
                      <strong>💡 Sugestão:</strong> {result.suggestion}
                    </p>
                    
                    <div className="pt-4 mt-6 border-t border-current/10 flex flex-col sm:flex-row items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl font-bold gap-2"
                        onClick={() => copyToClipboard(result.suggestion)}
                      >
                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        Copiar sugestão
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-xl font-bold gap-2"
                        onClick={() => toast.info("Funcionalidade em breve: Gerar resposta pronta")}
                      >
                        <MessageSquarePlus className="h-4 w-4" />
                        Gerar resposta
                      </Button>
                      <div className="flex items-center ml-auto gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg"
                            onClick={() => toast.success("Obrigado pelo feedback!")}
                          >
                            <span className="text-sm">👍</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg"
                            onClick={() => toast.info("Obrigado. Estamos melhorando!")}
                          >
                            <span className="text-sm">👎</span>
                          </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <p className="text-center text-xs text-muted-foreground/60 italic">
            * Esta análise é gerada por IA para fins informativos e não substitui o aconselhamento jurídico profissional.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
