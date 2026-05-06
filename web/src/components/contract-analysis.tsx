"use client";

import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  ShieldCheck,
  Trash2,
  Bot,
  User,
  Sparkles
} from "lucide-react";
import { startTransition, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore } from "@/lib/store";

interface ContractAnalysisProps {
  analysis: any;
  onReset?: () => void;
  isViewOnly?: boolean;
}

export function ContractAnalysis({ analysis, onReset, isViewOnly = false }: ContractAnalysisProps) {
  const { chatDrafts, setChatDraft } = useUIStore();
  
  // Chat state
  const [messages, setMessages] = useState<any[]>(analysis.messages || []);
  const [input, setInput] = useState(chatDrafts[analysis.slug] || "");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_slug: analysis.slug,
          message,
        }),
      });

      if (!response.ok) throw new Error("Erro no chat");
      return response.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", message: data.answer }]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "assistant", message: "Desculpe, ocorreu um erro ao processar sua pergunta" }]);
    }
  });

  const chatLoading = chatMutation.isPending;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !analysis?.slug || chatLoading) return;

    const userMsg = { role: "user", message: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setChatDraft(analysis.slug, "");
    
    chatMutation.mutate(userMsg.message);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setChatDraft(analysis.slug, value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-visible max-w-6xl mx-auto">
      {/* Left Column: Analysis Results & PDF */}
      <div className="lg:col-span-7 space-y-6 overflow-visible">
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger 
              value="analysis" 
              className="border-transparent! data-[state=active]:border-border!"
            >
              Análise do contrato
            </TabsTrigger>
            <TabsTrigger 
              value="pdf" 
              className="border-transparent! data-[state=active]:border-border!"
            >
              Documento original
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis" className="space-y-6 mt-0">
            {/* Summary Card */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/5 p-2 rounded-lg text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Resumo Executivo</CardTitle>
                    <CardDescription className="text-xs">Visão técnica gerada por IA</CardDescription>
                  </div>
                </div>
                {!isViewOnly && onReset && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startTransition(() => onReset())}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir análise</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.summary}
                </p>
              </CardContent>
            </Card>

            {/* Risks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Pontos de atenção
                </h3>
                <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider">
                  {analysis.risks?.length || 0} identificados
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {analysis.risks?.map((risk: any, i: number) => (
                  <Card key={i} className="hover:border-primary/20 transition-all">
                    <CardContent>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h4 className="text-sm font-bold text-foreground leading-tight">{risk.title}</h4>
                        <Badge variant="secondary" className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded shadow-none border-none shrink-0 uppercase tracking-tighter",
                          risk.severity === 'high' ? 'bg-red-50 text-red-700' :
                            risk.severity === 'medium' ? 'bg-amber-50 text-amber-700' :
                              'bg-emerald-50 text-emerald-700'
                        )}>
                          {risk.severity === 'high' ? 'Crítico' : risk.severity === 'medium' ? 'Médio' : 'Baixo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {risk.explanation}
                      </p>
                      {risk.clause && (
                        <div className="relative p-3 rounded-lg bg-muted/30 border border-border text-[11px] text-muted-foreground italic font-mono">
                          <div className="absolute top-0 left-0 w-0.5 h-full bg-primary/20" />
                          "{risk.clause}"
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pdf" className="">
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-0 pt-0! bg-muted/5 min-h-150 lg:h-[calc(100dvh-15rem)]">
                <iframe
                  src={`/api/contracts/${analysis.id}/download?inline=true`}
                  className="w-full h-full min-h-150 lg:h-full border-0"
                  title="Documento Original"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column: Chat Assistant */}
      <Card 
        size="sm" 
        className={cn(
          "lg:col-span-5 flex flex-col transition-all border-border/50 shadow-2xl shadow-primary/5 overflow-hidden",
          "h-150 lg:h-[calc(100dvh-10rem)] lg:max-h-212.5",
          "lg:sticky lg:top-8 self-start"
        )}
      >
        <CardHeader className="border-b bg-muted/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Assistente IA</CardTitle>
              <CardDescription className="text-[10px] font-medium">Análise contextual</CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1 min-h-0 bg-background/50">
          <div className="p-4 space-y-6">
            {messages.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground mb-4">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold mb-1">Dúvidas sobre o contrato?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-50">
                  Pergunte sobre prazos, multas ou qualquer cláusula específica.
                </p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 items-start",
                  msg.role === 'user' ? 'flex-row-reverse text-right' : 'flex-row text-left'
                )}
              >
                <Avatar className={cn(
                  "h-7 w-7 shrink-0 border border-border shadow-none",
                  msg.role === 'user' ? "bg-muted" : "bg-primary"
                )}>
                  <AvatarFallback className={msg.role === 'user' ? "bg-muted" : "bg-primary"}>
                    {msg.role === 'user' ? <User className="h-3 w-3 text-muted-foreground" /> : <Bot className="h-3 w-3 text-primary-foreground" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "max-w-[85%] p-3 rounded-xl text-xs leading-relaxed border",
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                    : 'bg-muted/30 text-foreground border-border'
                )}>
                  {msg.message}
                </div>
              </div>
            ))}
            
            {chatLoading && (
              <div className="flex gap-3 items-start">
                <Avatar className="h-7 w-7 shrink-0 border border-border bg-primary">
                  <AvatarFallback className="bg-primary">
                    <Bot className="h-3 w-3 text-primary-foreground animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted/10 p-3 rounded-xl text-[10px] text-muted-foreground flex items-center gap-2 border border-border italic">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  <p className="text-xs">Analisando documento...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t border-border bg-muted/5 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              value={input}
              onChange={handleInputChange}
              disabled={chatLoading}
              placeholder="Digite sua dúvida..."
              className="flex-1 bg-background border-border h-10 px-4 text-xs focus-visible:ring-1 focus-visible:ring-primary/20 transition-all shadow-none"
            />
            <Button
              type="submit"
              disabled={!input.trim() || chatLoading}
              size="icon"
              className="h-10 w-10 shrink-0 bg-primary text-primary-foreground shadow-none hover:bg-primary/90 transition-all active:scale-95"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
