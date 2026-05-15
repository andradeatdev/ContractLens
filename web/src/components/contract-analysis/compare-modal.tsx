"use client";

import { useState } from "react";
import { 
  FileText, 
  ArrowLeftRight, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileCode
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CompareModalProps {
  baseContractId: number;
  baseFilename: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompareModal({ baseContractId, baseFilename, isOpen, onOpenChange }: CompareModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("base_id", baseContractId.toString());
    formData.append("file", file);

    try {
      const response = await fetch("/api/contracts/compare", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Falha na comparação");
      }

      const data = await response.json();
      setReport(data.report);
      toast.success("Comparação concluída!");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setReport(null);
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) setTimeout(reset, 300);
    }}>
      <DialogContent className={cn(
        "sm:max-w-[700px] transition-all duration-500",
        report ? "h-[85vh]" : "h-auto"
      )}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <ArrowLeftRight className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">Comparar Contratos</DialogTitle>
          </div>
          <DialogDescription>
            Auditando diferenças entre a versão atual e um novo documento.
          </DialogDescription>
        </DialogHeader>

        {!report ? (
          <div className="space-y-6 py-6">
            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
              <div className="bg-background p-2 rounded-xl border border-border shadow-sm">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Contrato Base</p>
                <p className="text-sm font-bold truncate">{baseFilename}</p>
              </div>
              <div className="ml-auto">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>

            <div className="flex justify-center">
               <ArrowLeftRight className="h-6 w-6 text-muted-foreground/30 rotate-90" />
            </div>

            <div 
              className={cn(
                "border-2 border-dashed rounded-[2rem] p-10 text-center transition-all relative group",
                file ? "bg-primary/5 border-primary/40" : "hover:border-primary/40 hover:bg-muted/20 border-border"
              )}
            >
              <input
                type="file"
                accept=".pdf"
                id="compareFile"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              
              {file ? (
                <div className="space-y-4">
                  <div className="bg-primary p-4 rounded-2xl w-fit mx-auto shadow-lg shadow-primary/20">
                    <FileText className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-xs cursor-pointer">
                    Trocar arquivo
                  </Button>
                </div>
              ) : (
                <label htmlFor="compareFile" className="cursor-pointer space-y-4 block">
                  <div className="bg-muted p-4 rounded-2xl w-fit mx-auto group-hover:bg-primary/10 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">Selecione a nova versão</p>
                    <p className="text-xs text-muted-foreground">PDF até 10MB</p>
                  </div>
                </label>
              )}
            </div>

            <Button 
              className="w-full h-14 rounded-2xl font-bold text-lg cursor-pointer"
              disabled={!file || loading}
              onClick={handleCompare}
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Analisando diferenças...</>
              ) : (
                "Iniciar Comparação"
              )}
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 py-4 space-y-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
              <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                {report.split('\n').map((line, i) => {
                   if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-black mb-4">{line.replace('# ', '')}</h1>;
                   if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-2 text-primary">{line.replace('## ', '')}</h2>;
                   if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-1">{line.replace('### ', '')}</h3>;
                   if (line.startsWith('**')) return <p key={i} className="font-semibold text-foreground">{line.replace(/\*\*/g, '')}</p>;
                   if (line.trim() === '---') return <hr key={i} className="my-6 border-border" />;
                   if (line.trim() === '') return <div key={i} className="h-2" />;
                   return <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>;
                })}
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-2xl flex items-start gap-3 border border-border/50">
               <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
               <p className="text-xs text-muted-foreground leading-snug">
                 Este relatório foi gerado por IA comparando os textos brutos de ambos os documentos. Sempre valide as alterações críticas com um profissional jurídico.
               </p>
            </div>
          </div>
        )}

        {report && (
          <DialogFooter className="sm:justify-start border-t pt-4">
            <Button variant="outline" onClick={reset} className="rounded-xl cursor-pointer">
              Comparar com outro arquivo
            </Button>
            <Button onClick={() => onOpenChange(false)} className="rounded-xl cursor-pointer ml-auto">
              Fechar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
