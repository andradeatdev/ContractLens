"use client";

import { cn } from "@/lib/utils";
import { StickyNote, Trash2, Type } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Note {
  id: number;
  contract_id: number;
  content: string;
  selected_text: string;
  color: string;
  created_at: string;
}

interface ContractNotesProps {
  notes: Note[];
  onDeleteNote: (id: number) => void;
}

const colors = [
  { name: "yellow", class: "border-l-yellow-400", dot: "bg-yellow-400" },
  { name: "red", class: "border-l-red-500", dot: "bg-red-500" },
  { name: "green", class: "border-l-emerald-500", dot: "bg-emerald-500" },
  { name: "blue", class: "border-l-blue-500", dot: "bg-blue-500" },
];

export function ContractNotes({ notes, onDeleteNote }: ContractNotesProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {(!notes || notes.length === 0) && (
          <div className="py-20 text-center space-y-3">
            <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center mx-auto text-muted-foreground/40">
              <StickyNote className="h-6 w-6" />
            </div>
            <p className="text-xs text-muted-foreground px-10">
              Selecione trechos da análise para adicionar suas próprias anotações.
            </p>
          </div>
        )}
        
        {notes?.map((note) => {
          const colorConfig = colors.find(c => c.name === note.color) || colors[0];
          return (
            <div 
              key={note.id} 
              className={cn(
                "p-4 rounded-xl bg-background border border-border shadow-sm border-l-4 transition-all hover:shadow-md",
                colorConfig.class
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <StickyNote className="h-3 w-3" />
                  <span>Anotação</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-lg hover:bg-muted cursor-pointer text-muted-foreground"
                  onClick={() => onDeleteNote(note.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm font-medium leading-relaxed mb-3 text-foreground">
                {note.content}
              </p>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-[11px] text-muted-foreground italic mb-3">
                &quot;{note.selected_text}&quot;
              </div>
              <div className="text-[10px] font-bold text-muted-foreground/50">
                {new Date(note.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
