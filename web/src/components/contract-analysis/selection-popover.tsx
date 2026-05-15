"use client";

import { cn } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SelectionPopoverProps {
  selection: { text: string; x: number; y: number } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  noteContent: string;
  onNoteContentChange: (content: string) => void;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  onSaveNote: () => void;
  isPending: boolean;
}

const colors = [
  { name: "yellow", dot: "bg-yellow-400" },
  { name: "red", dot: "bg-red-500" },
  { name: "green", dot: "bg-emerald-500" },
  { name: "blue", dot: "bg-blue-500" },
];

export function SelectionPopover({
  selection,
  isOpen,
  onOpenChange,
  noteContent,
  onNoteContentChange,
  selectedColor,
  onColorSelect,
  onSaveNote,
  isPending,
}: SelectionPopoverProps) {
  if (!selection) return null;

  return (
    <div 
      className="fixed z-50 animate-in fade-in zoom-in duration-200"
      style={{ left: `${selection.x}px`, top: `${selection.y}px`, transform: 'translateX(-50%) translateY(-100%)' }}
    >
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button 
            size="sm" 
            className="rounded-full shadow-xl bg-primary text-primary-foreground gap-2 font-bold h-9 px-4 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Anotar trecho
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 space-y-4" side="top" align="center">
          <div className="space-y-2">
            <h4 className="font-bold text-sm leading-none">Nova anotação</h4>
            <p className="text-[10px] text-muted-foreground italic line-clamp-2">
              &quot;{selection.text}&quot;
            </p>
          </div>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => onColorSelect(c.name)}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition-all cursor-pointer",
                  c.dot,
                  selectedColor === c.name ? "border-foreground scale-110 shadow-sm" : "border-transparent opacity-50 hover:opacity-100"
                )}
              />
            ))}
          </div>
          <Input
            placeholder="O que deseja anotar?"
            value={noteContent}
            onChange={(e) => onNoteContentChange(e.target.value)}
            className="text-xs h-9"
          />
          <Button 
            size="sm" 
            className="w-full font-bold h-9 shadow-none cursor-pointer"
            disabled={!noteContent.trim() || isPending}
            onClick={onSaveNote}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar nota"}
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
