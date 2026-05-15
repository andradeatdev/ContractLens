"use client";

import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContractOverviewProps {
  filename: string;
  summary: string;
  isViewOnly?: boolean;
  onDelete?: () => void;
}

export function ContractOverview({ filename, summary, isViewOnly, onDelete }: ContractOverviewProps) {
  return (
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
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}
