"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, Trash2, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface UploadSectionProps {
  file: File | null;
  setFile: (file: File | null) => void;
  loading: boolean;
  onUpload: () => void;
  onAlert: (alert: { title: string; message: string; type: "destructive" | "success" | "default" }) => void;
}

export function UploadSection({ file, setFile, loading, onUpload, onAlert }: UploadSectionProps) {
  return (
    <div className="lg:col-span-2 space-y-8">
      <div className="text-left">
        <h2 className="text-3xl font-bold mb-3 tracking-tight">Nova análise</h2>
        <p className="text-muted-foreground">Envie seu contrato em PDF para começar a análise inteligente.</p>
      </div>

      <div
        className={cn(
          "border-2 border-dashed rounded-[2.5rem] p-16 text-center transition-all duration-500 relative overflow-hidden group",
          file ? "bg-primary/5 border-primary/40 shadow-2xl shadow-primary/5" : "hover:border-primary/40 hover:bg-background border-border bg-muted/30 shadow-sm"
        )}
      >
        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
          <FileText className="h-40 w-40 rotate-12" />
        </div>

        <div className={cn(
          "bg-primary/10 p-6 rounded-[2rem] w-fit mx-auto mb-8 transition-transform duration-500",
          file ? "rotate-12 bg-primary" : ""
        )}>
          <Upload className={cn("h-12 w-12", file ? "text-primary-foreground" : "text-primary")} />
        </div>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null;
            if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
              onAlert({
                title: "Arquivo muito grande",
                message: "O limite máximo permitido é de 10MB",
                type: "destructive"
              });
              e.target.value = ""; // Limpa o input
              return;
            }
            setFile(selectedFile);
          }}
          className="hidden"
          id="dashboardFile"
        />
        {file ? (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="flex items-center gap-4 bg-background border border-border p-5 rounded-2xl max-w-md mx-auto shadow-xl">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div className="text-left overflow-hidden flex-1">
                <p className="font-bold truncate text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setFile(null)} 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remover arquivo</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Button
              onClick={onUpload}
              disabled={loading}
              className="w-full max-w-md h-16 bg-primary text-primary-foreground rounded-[1.5rem] font-bold hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-3 text-lg mx-auto cursor-pointer disabled:cursor-wait"
            >
              {loading ? (
                <><Loader2 className="h-6 w-6 animate-spin" /> Analisando contrato…</>
              ) : (
                <><Zap className="h-5 w-5" /> Começar análise</>
              )}
            </Button>
          </div>
        ) : (
          <label
            htmlFor="dashboardFile"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-10 py-5 text-lg font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xl shadow-primary/20 active:scale-95 group"
          >
            Escolher arquivo
          </label>
        )}

        <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest font-bold">
          Suporta apenas arquivos PDF até 10&nbsp;MB
        </p>
      </div>
    </div>
  );
}
