"use client";

import { useModal } from "@/components/modal-provider";
import { DirectionalTransition } from "@/components/view-transition-wrapper";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronRight, Download, Edit2, Eye, FileText, Filter, Loader2, MoreVertical, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore } from "@/lib/store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ContractsPage() {
  const { contractFilters, setContractFilters, resetContractFilters } = useUIStore();
  const { searchTerm, filterRisk, sortOrder } = contractFilters;
  
  const [filteredContracts, setFilteredContracts] = useState<any[]>([]);
  const modal = useModal();
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await fetch("/api/contracts");
      if (!response.ok) throw new Error("Falha ao carregar contratos");
      return response.json();
    }
  });

  const error = queryError ? (queryError as Error).message : null;

  useEffect(() => {
    let filtered = [...contracts];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Risk Filter
    if (filterRisk !== "all") {
      filtered = filtered.filter(c =>
        c.risks?.some((r: any) => r.severity === filterRisk)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredContracts(filtered);
  }, [searchTerm, contracts, filterRisk, sortOrder]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contracts/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao excluir");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (err) => {
      console.error(err);
      modal.alert({
        title: "Erro",
        message: "Não foi possível excluir o contrato",
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
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (err) => {
      console.error(err);
      modal.alert({
        title: "Erro",
        message: "Não foi possível renomear o contrato",
        type: "destructive"
      });
    }
  });

  const handleDelete = (id: number) => {
    modal.confirm({
      title: "Excluir contrato",
      message: "Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita",
      confirmLabel: "Excluir",
      type: "destructive",
      onConfirm: () => deleteMutation.mutate(id)
    });
  };

  const handleRename = (id: number, currentName: string) => {
    modal.prompt({
      title: "Renomear contrato",
      message: "Digite o novo nome para o documento",
      defaultValue: currentName,
      placeholder: "Ex: Contrato de Aluguel v2",
      onConfirm: (newName) => {
        if (!newName || newName === currentName) return;
        renameMutation.mutate({ id, newName });
      }
    });
  };

  const handleDownload = async (id: number, filename: string) => {
    try {
      const response = await fetch(`/api/contracts/${id}/download`);
      if (!response.ok) throw new Error("Erro ao baixar arquivo");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      modal.alert({
        title: "Erro no download",
        message: "Ocorreu um problema ao baixar o arquivo",
        type: "destructive"
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <DirectionalTransition>
      <div className="flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard" className="transition-colors hover:text-primary">App</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-bold">Meus contratos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 overflow-y-auto bg-background p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Seus documentos</h2>
                <p className="text-muted-foreground">Gerencie e visualize todos os seus contratos enviados.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar contrato..."
                    value={searchTerm}
                    onChange={(e) => setContractFilters({ searchTerm: e.target.value })}
                    className="pl-10 h-10 bg-background border-border rounded-xl text-sm focus-visible:ring-4 focus-visible:ring-primary/10 transition-all w-64 shadow-sm"
                  />
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-10 border rounded-xl transition-all flex items-center gap-2 text-sm font-medium cursor-pointer",
                        filterRisk !== "all" || sortOrder !== "newest"
                          ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/5 hover:bg-primary/20"
                          : "border-border hover:bg-background text-muted-foreground"
                      )}
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filtros</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64 p-4 shadow-2xl rounded-2xl border-border bg-background animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 ml-1">Nível de Risco</p>
                        <div className="flex flex-wrap gap-2">
                          {['all', 'high', 'medium', 'low'].map((risk) => (
                            <Button
                              key={risk}
                              variant={filterRisk === risk ? "default" : "secondary"}
                              size="sm"
                              onClick={() => setContractFilters({ filterRisk: risk })}
                              className={cn(
                                "rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer h-7",
                                filterRisk === risk ? "shadow-lg shadow-primary/20" : ""
                              )}
                            >
                              {risk === 'all' ? 'Todos' : risk === 'high' ? 'Crítico' : risk === 'medium' ? 'Médio' : 'Baixo'}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-border" />

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 ml-1">Ordenação</p>
                        <div className="space-y-2">
                          <Button
                            variant={sortOrder === 'newest' ? "default" : "secondary"}
                            size="sm"
                            className="w-full justify-between rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer h-8"
                            onClick={() => setContractFilters({ sortOrder: 'newest' })}
                          >
                            Mais recentes
                            {sortOrder === "newest" && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                          </Button>
                          <Button
                            variant={sortOrder === 'oldest' ? "default" : "secondary"}
                            size="sm"
                            className="w-full justify-between rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer h-8"
                            onClick={() => setContractFilters({ sortOrder: 'oldest' })}
                          >
                            Mais antigos
                            {sortOrder === "oldest" && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                          </Button>
                        </div>
                      </div>

                      {(filterRisk !== "all" || sortOrder !== "newest" || searchTerm !== "") && (
                        <>
                          <div className="h-px bg-border" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetContractFilters}
                            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                          >
                            Limpar todos os filtros
                          </Button>
                        </>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="bg-background border border-border rounded-[2rem] shadow-sm overflow-hidden">
              {loading ? (
                <div className="overflow-visible">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20 border-b border-border hover:bg-muted/20">
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Documento</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Data</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Tamanho</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Status</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Riscos</TableHead>
                        <TableHead className="px-6 py-4 h-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i} className="border-border">
                          <TableCell className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-xl" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-5"><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell className="px-6 py-5"><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell className="px-6 py-5"><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
                          <TableCell className="px-6 py-5"><Skeleton className="h-5 w-14 rounded-lg" /></TableCell>
                          <TableCell className="px-6 py-5 text-right"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : error ? (
                <div className="p-20 text-center space-y-4">
                  <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Erro ao carregar contratos</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['contracts'] })} className="font-bold">
                    Tentar novamente
                  </Button>
                </div>
              ) : contracts.length === 0 ? (
                <Empty className="py-20 bg-muted/20 border-border/50 rounded-[2rem]">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileText className="h-10 w-10 text-muted-foreground/30" />
                    </EmptyMedia>
                    <EmptyTitle className="text-xl tracking-tight">Nenhum contrato encontrado</EmptyTitle>
                    <EmptyDescription className="text-sm">
                      Comece enviando seu primeiro documento para análise no dashboard.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button asChild className="font-bold rounded-xl px-8 h-11">
                      <Link href="/dashboard">Começar agora</Link>
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : filteredContracts.length === 0 ? (
                <Empty className="py-20 bg-muted/20 border-border/50 rounded-[2rem]">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Search className="h-10 w-10 text-muted-foreground/30" />
                    </EmptyMedia>
                    <EmptyTitle className="text-xl tracking-tight">Nenhum resultado encontrado</EmptyTitle>
                    <EmptyDescription className="text-sm">
                      Tente ajustar seus filtros ou busca para encontrar o que procura.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      variant="link"
                      onClick={resetContractFilters}
                      className="text-sm text-primary font-bold hover:underline cursor-pointer"
                    >
                      Limpar todos os filtros
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="overflow-visible">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20 border-b border-border hover:bg-muted/20">
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Documento</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Data</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Tamanho</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Status</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Riscos</TableHead>
                        <TableHead className="px-6 py-4 h-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts.map((contract) => (
                        <TableRow key={contract.slug} className="hover:bg-muted/10 transition-colors group border-border">
                          <TableCell className="px-6 py-5">
                            <Link href={`/dashboard/contracts/${contract.slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <FileText className="h-5 w-5" />
                              </div>
                              <span className="font-bold text-sm truncate max-w-[200px]">{contract.filename}</span>
                            </Link>
                          </TableCell>
                          <TableCell className="px-6 py-5 text-sm text-muted-foreground whitespace-nowrap">{formatDate(contract.created_at)}</TableCell>
                          <TableCell className="px-6 py-5 text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                            {contract.content ? (contract.content.length / 1024).toFixed(1) + " KB" : "-"}
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-700 border-none uppercase tracking-wider font-bold">
                              Analisado
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            {contract.risks?.length > 0 ? (
                              <Badge variant="secondary" className="text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border-none rounded-lg px-2 py-1">
                                {contract.risks.length} {contract.risks.length === 1 ? 'risco' : 'riscos'}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-5 text-right">
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="rounded-lg transition-all cursor-pointer text-muted-foreground hover:bg-muted"
                                    >
                                      <MoreVertical className="h-5 w-5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Mais ações</p>
                                </TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-2xl p-2 border-border bg-background animate-in fade-in slide-in-from-top-2 duration-200">
                                <DropdownMenuItem asChild className="focus:bg-muted rounded-xl transition-colors cursor-pointer">
                                  <Link
                                    href={`/dashboard/contracts/${contract.slug}`}
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm"
                                  >
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                    Ver detalhes
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(contract.id, contract.filename)} className="flex items-center gap-3 px-3 py-2.5 text-sm focus:bg-muted rounded-xl transition-colors cursor-pointer">
                                  <Download className="h-4 w-4 text-muted-foreground" />
                                  Baixar arquivo
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRename(contract.id, contract.filename)} className="flex items-center gap-3 px-3 py-2.5 text-sm focus:bg-muted rounded-xl transition-colors cursor-pointer">
                                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                                  Renomear
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border my-1 mx-1" />
                                <DropdownMenuItem onClick={() => handleDelete(contract.id)} className="flex items-center gap-3 px-3 py-2.5 text-sm focus:bg-muted text-red-500 focus:text-red-600 rounded-xl transition-colors cursor-pointer">
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DirectionalTransition>
  );
}
