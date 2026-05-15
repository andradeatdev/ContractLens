"use client";

import { cn } from "@/lib/utils";
import { 
  Bot, 
  User, 
  Sparkles, 
  Send, 
  MessageSquare 
} from "lucide-react";
import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: 'user' | 'assistant';
  message: string;
}

interface ContractChatProps {
  messages: Message[];
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

export function ContractChat({ 
  messages, 
  input, 
  loading, 
  onInputChange, 
  onSendMessage 
}: ContractChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, loading]);

  return (
    <div className="flex-1 flex flex-col min-h-0 m-0">
      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 min-h-0 bg-background/50">
        <div className="p-4 space-y-6">
          {messages.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center px-6">
              <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground mb-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Dúvidas sobre o contrato?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
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
          
          {loading && (
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
        <form onSubmit={onSendMessage} className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={loading}
            placeholder="Digite sua dúvida..."
            className="flex-1 bg-background border-border h-10 px-4 text-xs focus-visible:ring-1 focus-visible:ring-primary/20 transition-all shadow-none"
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            size="icon"
            className="h-10 w-10 shrink-0 bg-primary text-primary-foreground shadow-none hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
