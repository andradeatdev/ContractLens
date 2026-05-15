"use client";

import { cn } from "@/lib/utils";
import { ContractAnalysis } from "@/components/contract-analysis";
import { DirectionalTransition } from "@/components/view-transition-wrapper";
import { ChevronRight, Download, Edit2, FileText, Loader2, MoreVertical, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useContractDetails } from "@/hooks/use-contract-details";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ContractDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { 
    contract, 
    isLoading: loading, 
    error, 
    isReanalyzing,
    handleDelete,
    handleRename,
    handleDownload,
    handleExportAnalysis,
    handleReanalyze 
  } = useContractDetails(resolvedParams.slug);

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-border bg-background/80 px-8 flex items-center justify-between sticky top-0 z-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/contracts" className="transition-colors hover:text-primary">Contratos</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Skeleton className="h-4 w-32" />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Skeleton className="h-8 w-8 rounded-lg" />
        </header>
        <div className="flex-1 p-8 overflow-y-auto bg-muted/5">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-8">
              <Skeleton className="h-64 rounded-[2.5rem]" />
              <div className="space-y-4">
                <Skeleton className="h-32 rounded-[2rem]" />
                <Skeleton className="h-32 rounded-[2rem]" />
              </div>
            </div>
            <div className="lg:col-span-5">
              <Skeleton className="h-[600px] rounded-[2.5rem]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-destructive/5 rounded-3xl rotate-6" />
            <div className="absolute inset-0 bg-background border border-border rounded-3xl flex items-center justify-center shadow-xl">
              <Trash2 className="h-10 w-10 text-destructive/50" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Contrato não encontrado</h2>
            <p className="text-muted-foreground text-sm text-pretty leading-relaxed">
              {error || "O documento que você está tentando acessar não existe ou você não tem permissão para visualizá-lo."}
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/dashboard/contracts"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Voltar para meus contratos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DirectionalTransition>
      <div className="flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/contracts" className="transition-colors hover:text-primary">Contratos</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-bold truncate max-w-[200px]">
                  {contract.filename}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg text-muted-foreground transition-all cursor-pointer active:scale-90 hover:bg-muted"
                  >
                    {isReanalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <MoreVertical className="h-5 w-5" />}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end">
                <p>Ações do contrato</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl p-2 border-border bg-background animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Documento</div>
              <DropdownMenuItem onClick={handleDownload} className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-xl focus:bg-muted transition-colors">
                <Download className="h-4 w-4 text-muted-foreground" />
                Baixar original
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRename} className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-xl focus:bg-muted transition-colors">
                <Edit2 className="h-4 w-4 text-muted-foreground" />
                Renomear
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-border my-1 mx-1" />
              <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Análise</div>
              <DropdownMenuItem 
                onClick={handleReanalyze} 
                disabled={isReanalyzing}
                className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-xl focus:bg-muted transition-colors"
              >
                <RefreshCw className={cn("h-4 w-4 text-muted-foreground", isReanalyzing && "animate-spin")} />
                Reanalisar agora
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportAnalysis} className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-xl focus:bg-muted transition-colors">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Exportar análise (.md)
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border my-1 mx-1" />
              <div className="px-3 py-2 text-[10px] font-bold text-red-500/60 uppercase tracking-wider text-pretty">Zona de Perigo</div>
              <DropdownMenuItem onClick={handleDelete} className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-xl focus:bg-muted text-red-500 focus:text-red-600 transition-colors">
                <Trash2 className="h-4 w-4" />
                Excluir contrato
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="flex-1 overflow-y-auto bg-muted/5 p-8 ">
          <ContractAnalysis analysis={contract} isViewOnly />
        </div>
      </div>
    </DirectionalTransition>
  );
}
