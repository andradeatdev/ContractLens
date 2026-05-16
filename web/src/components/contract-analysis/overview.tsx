"use client";

import { Trash2, DollarSign, Calendar, Users, MapPin, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { CompareModal } from "./compare-modal";

interface ContractOverviewProps {
  id: number;
  filename: string;
  summary: string;
  total_value?: string;
  expiration?: string;
  parties?: string;
  legal_venue?: string;
  isViewOnly?: boolean;
  onDelete?: () => void;
}

export function ContractOverview({ 
  id,
  filename, 
  summary, 
  total_value,
  expiration,
  parties,
  legal_venue,
  isViewOnly, 
  onDelete 
}: ContractOverviewProps) {
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">
              {filename}
            </CardTitle>
            <CardDescription className="text-xs">
              Análise gerada em {new Date().toLocaleDateString('pt-BR')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isViewOnly && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 rounded-xl font-bold text-xs border-primary/20 hover:bg-primary/5 hover:text-primary cursor-pointer transition-all active:scale-95"
                    onClick={() => setIsCompareOpen(true)}
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    Comparar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Comparar com nova versão</p>
                </TooltipContent>
              </Tooltip>
            )}

            {!isViewOnly && onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl cursor-pointer"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Excluir análise</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>
        </CardContent>
      </Card>

      <CompareModal 
        baseContractId={id}
        baseFilename={filename}
        isOpen={isCompareOpen}
        onOpenChange={setIsCompareOpen}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetadataCard 
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
          label="Valor Total"
          value={
            total_value && !isNaN(Number(total_value)) 
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(total_value))
              : (total_value || "Não especificado")
          }
        />
        <MetadataCard 
          icon={<Calendar className="h-4 w-4 text-blue-500" />}
          label="Vigência"
          value={expiration || "Não especificado"}
        />
        <MetadataCard 
          icon={<Users className="h-4 w-4 text-purple-500" />}
          label="Partes"
          value={parties || "Não especificado"}
        />
        <MetadataCard 
          icon={<MapPin className="h-4 w-4 text-orange-500" />}
          label="Foro"
          value={legal_venue || "Não especificado"}
        />
      </div>
    </div>
  );
}

function MetadataCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <Card className="border-border/40 bg-background/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="p-2.5 rounded-xl bg-muted/50 border border-border/20 w-fit">
          {icon}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</p>
          <p className="text-sm font-bold text-foreground leading-snug break-words">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
