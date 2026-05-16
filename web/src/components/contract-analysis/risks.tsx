"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult } from "@/types";

interface ContractRisksProps {
  risks: AnalysisResult["risks"];
}

export function ContractRisks({ risks }: ContractRisksProps) {
  const getRiskBadgeClass = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 text-red-700';
      case 'medium': return 'bg-amber-50 text-amber-700';
      default: return 'bg-emerald-50 text-emerald-700';
    }
  };

  const getRiskLabelText = (severity: string) => {
    switch (severity) {
      case 'high': return 'Crítico';
      case 'medium': return 'Médio';
      default: return 'Baixo';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Pontos de atenção
        </h3>
        <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider">
          {risks?.length || 0} identificados
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {risks?.map((risk, i: number) => (
          <Card key={i} className="hover:border-primary/20 transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start gap-4 mb-3">
                <h4 className="text-sm font-bold text-foreground leading-tight">{risk.title}</h4>
                <Badge variant="secondary" className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded shadow-none border-none shrink-0 uppercase tracking-tighter",
                  getRiskBadgeClass(risk.severity)
                )}>
                  {getRiskLabelText(risk.severity)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {risk.explanation}
              </p>
              {risk.clause && (
                <div className="relative p-3 rounded-lg bg-muted/30 border border-border text-[11px] text-muted-foreground italic">
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-primary/20" />
                  &quot;{risk.clause}&quot;
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
