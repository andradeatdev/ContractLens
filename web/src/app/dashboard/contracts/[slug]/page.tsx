"use client";

import { ContractAnalysis } from "@/components/contract-analysis";
import { DirectionalTransition } from "@/components/view-transition-wrapper";
import { ChevronRight, Download, Edit2, Loader2, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/components/modal-provider";
import { useRouter } from "next/navigation";
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
  const modal = useModal();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: contract, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['contract', resolvedParams.slug],
    queryFn: async () => {
      const response = await fetch(`/api/contracts/s/${resolvedParams.slug}`);
      if (!response.ok) throw new Error("Contrato não encontrado");
      return response.json();
    }
  });

  const error = queryError ? (queryError as Error).message : null;

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contracts/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao excluir");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      router.push("/dashboard/contracts");
    },
    onError: (err) => {
      console.error(err);
      modal.alert({
        title: "Erro",
        message: "Não foi possível excluir o contrato.",
        type: "destructive"
      });
    }
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, newName }: { id: number, newName: string }) => {
      const response = await fetch(`/api/contracts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: newName }),
      });
      if (!response.ok) throw new Error("Erro ao renomear");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', resolvedParams.slug] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (err) => {
      console.error(err);
      modal.alert({
        title: "Erro",
        message: "Não foi possível renomear o contrato.",
        type: "destructive"
      });
    }
  });

  const handleDelete = () => {
    if (!contract) return;
    modal.confirm({
      title: "Excluir contrato",
      message: "Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.",
      confirmLabel: "Excluir",
      type: "destructive",
      onConfirm: () => deleteMutation.mutate(contract.id)
    });
  };

  const handleRename = () => {
    if (!contract) return;
    modal.prompt({
      title: "Renomear contrato",
      message: "Digite o novo nome para o documento:",
      defaultValue: contract.filename,
      placeholder: "Ex: Contrato de Aluguel v2",
      onConfirm: (newName) => {
        if (!newName || newName === contract.filename) return;
        renameMutation.mutate({ id: contract.id, newName });
      }
    });
  };

  const handleDownload = async () => {
    if (!contract) return;
    try {
      const response = await fetch(`/api/contracts/${contract.id}/download`);
      if (!response.ok) throw new Error("Erro ao baixar arquivo");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = contract.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    }
  };

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
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end">
                <p>Ações do contrato</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-2xl p-2 border-border bg-background animate-in fade-in slide-in-from-top-2 duration-200">
              <DropdownMenuItem onClick={handleDownload} className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-xl focus:bg-muted transition-colors">
                <Download className="h-4 w-4 text-muted-foreground" />
                Baixar arquivo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRename} className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-xl focus:bg-muted transition-colors">
                <Edit2 className="h-4 w-4 text-muted-foreground" />
                Renomear
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border my-1 mx-1" />
              <DropdownMenuItem onClick={handleDelete} className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-xl focus:bg-muted text-red-500 focus:text-red-600 transition-colors">
                <Trash2 className="h-4 w-4" />
                Excluir
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
