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
  { name: "yellow", class: "bg-yellow-100 text-yellow-800 border-yellow-200", dot: "bg-yellow-400" },
  { name: "red", class: "bg-red-50 text-red-700 border-red-100", dot: "bg-red-500" },
  { name: "green", class: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" },
  { name: "blue", class: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-500" },
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
            <Card key={note.id} className="overflow-hidden border-border/50 group">
              <CardHeader className={cn("p-3 border-b flex flex-row items-center justify-between space-y-0", colorConfig.class)}>
                <div className="flex items-center gap-2">
                  <Type className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Anotação</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-lg hover:bg-black/5 cursor-pointer"
                  onClick={() => onDeleteNote(note.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="p-3 space-y-3 bg-background">
                <div className="p-2 rounded-lg bg-muted/30 border border-border italic text-[11px] text-muted-foreground">
                  &quot;{note.selected_text}&quot;
                </div>
                <p className="text-sm leading-relaxed font-medium">
                  {note.content}
                </p>
                <div className="text-[10px] text-muted-foreground flex justify-end">
                  {new Date(note.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
