"use client";

import { cn } from "@/lib/utils";
import {
  FileText,
  MessageSquare,
  StickyNote,
  X
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useUIStore } from "@/lib/store";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { AnalysisResult } from "@/types";

// Refactored sub-components
import { ContractOverview } from "./contract-analysis/overview";
import { ContractRisks } from "./contract-analysis/risks";
import { ContractPdfViewer } from "./contract-analysis/pdf-viewer";
import { ContractChat } from "./contract-analysis/chat";
import { ContractNotes } from "./contract-analysis/notes";
import { SelectionPopover } from "./contract-analysis/selection-popover";

interface Message {
  role: 'user' | 'assistant';
  message: string;
}

interface Note {
  id: number;
  contract_id: number;
  content: string;
  selected_text: string;
  color: string;
  created_at: string;
}

interface ContractAnalysisProps {
  analysis: AnalysisResult & { 
    id: number;
    slug: string; 
    messages?: Message[]; 
    notes?: Note[];
  };
  onReset?: () => void;
  isViewOnly?: boolean;
}

export function ContractAnalysis({ analysis, onReset, isViewOnly = false }: ContractAnalysisProps) {
  const { chatDrafts, setChatDraft } = useUIStore();
  const queryClient = useQueryClient();
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>(analysis.messages || []);
  const [input, setInput] = useState(chatDrafts[analysis.slug || ""] || "");
  const [chatLoading, setChatLoading] = useState(false);

  // Notes state
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isNotePopoverOpen, setIsNotePopoverOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("yellow");

  const handleSelection = useCallback(() => {
    const activeSelection = window.getSelection();
    if (!activeSelection || activeSelection.isCollapsed || activeSelection.toString().trim() === "") {
      if (!isNotePopoverOpen) setSelection(null);
      return;
    }

    const range = activeSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setSelection({
      text: activeSelection.toString(),
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  }, [isNotePopoverOpen]);

  useEffect(() => {
    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, [handleSelection]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;

    const userMessage = input.trim();
    setInput("");
    setChatDraft(analysis.slug, "");
    
    const newMessages = [...messages, { role: "user", message: userMessage }];
    setMessages(newMessages);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_id: analysis.id,
          message: userMessage,
          history: messages
        }),
      });

      if (!response.ok) throw new Error("Falha ao enviar mensagem");
      
      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", message: data.response }]);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setChatLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setChatDraft(analysis.slug, value);
  };

  const addNoteMutation = useMutation({
    mutationFn: async (newNote: { content: string; selected_text: string; color: string }) => {
      const response = await fetch("/api/contracts/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_id: analysis.id,
          ...newNote
        }),
      });
      if (!response.ok) throw new Error("Falha ao salvar nota");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setSelection(null);
      setNoteContent("");
      setIsNotePopoverOpen(false);
      toast.success("Nota adicionada com sucesso!");
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`/api/contracts/notes/${noteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao excluir nota");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success("Nota excluída com sucesso!");
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });

  const deleteContractMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/contracts/${analysis.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao excluir contrato");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success("Contrato excluído com sucesso!");
      onReset?.();
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative pb-20">
      <SelectionPopover 
        selection={selection}
        isOpen={isNotePopoverOpen}
        onOpenChange={setIsNotePopoverOpen}
        noteContent={noteContent}
        onNoteContentChange={setNoteContent}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        isPending={addNoteMutation.isPending}
        onSaveNote={() => addNoteMutation.mutate({
          content: noteContent,
          selected_text: selection?.text || "",
          color: selectedColor
        })}
      />

      {/* Left Column: Analysis Details */}
      <div className="lg:col-span-7 space-y-8 min-w-0">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-muted/50 p-1 rounded-xl h-12 border border-border/50">
              <TabsTrigger 
                value="overview" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs gap-2 px-4 h-full cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Resumo
              </TabsTrigger>
              <TabsTrigger 
                value="pdf" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs gap-2 px-4 h-full cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Documento
              </TabsTrigger>
            </TabsList>
            
            {onReset && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onReset}
                className="text-muted-foreground hover:text-foreground font-medium text-xs gap-2 cursor-pointer"
              >
                <X className="h-4 w-4" />
                Fechar análise
              </Button>
            )}
          </div>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 m-0">
            <ContractOverview 
              filename={analysis.filename}
              summary={analysis.summary}
              isViewOnly={isViewOnly}
              onDelete={() => deleteContractMutation.mutate()}
            />
            <ContractRisks risks={analysis.risks} />
          </TabsContent>

          <TabsContent value="pdf" className="">
            <ContractPdfViewer contractId={analysis.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column: Chat & Notes Sidebar */}
      <Card 
        className={cn(
          "lg:col-span-5 flex flex-col transition-all border-border/50 shadow-2xl shadow-primary/5 overflow-hidden",
          "h-[600px] lg:h-[calc(100dvh-10rem)] lg:max-h-[850px]",
          "lg:sticky lg:top-8 self-start"
        )}
      >
        <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
          <CardHeader className="border-b bg-muted/5 shrink-0 p-0">
            <TabsList className="w-full bg-transparent h-14 rounded-none p-1 gap-1">
              <TabsTrigger 
                value="chat" 
                className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                Assistente IA
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs gap-2 cursor-pointer"
              >
                <StickyNote className="h-4 w-4" />
                Notas ({analysis.notes?.length || 0})
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0">
            <ContractChat 
              messages={messages}
              input={input}
              loading={chatLoading}
              onInputChange={handleInputChange}
              onSendMessage={handleSendMessage}
            />
          </TabsContent>

          <TabsContent value="notes" className="flex-1 flex flex-col min-h-0 m-0 bg-muted/5">
            <ContractNotes 
              notes={analysis.notes || []}
              onDeleteNote={(id) => deleteNoteMutation.mutate(id)}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
