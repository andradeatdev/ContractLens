"use client";

import React from "react";
import Link from "next/link";
import { 
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Download, 
  Trash2, 
  Eye, 
  History,
  AlertCircle
} from "lucide-react";
import { useContractsList } from "@/hooks/use-contracts-list";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ContractsPage() {
  const { 
    contracts, 
    filteredContracts, 
    isLoading: loading, 
    error, 
    filters, 
    setFilters, 
    resetFilters, 
    handleDelete,
    refresh 
  } = useContractsList();

  const { searchTerm, filterRisk, sortOrder } = filters;

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'high': return 'Crítico';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return 'Todos';
    }
  };

  const renderTableContent = () => {
    if (loading) {
      return (
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
      );
    }

    if (error) {
      return (
        <div className="p-20 text-center space-y-4">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-foreground">Erro ao carregar contratos</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} className="font-bold">
            Tentar novamente
          </Button>
        </div>
      );
    }

    if (contracts.length === 0) {
      return (
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
      );
    }

    if (filteredContracts.length === 0) {
      return (
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
              onClick={resetFilters}
              className="text-sm text-primary font-bold hover:underline cursor-pointer"
            >
              Limpar todos os filtros
            </Button>
          </EmptyContent>
        </Empty>
      );
    }

    return (
      <div className="overflow-visible">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/10 border-b border-border hover:bg-muted/10">
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Documento</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Data</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Tamanho</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Status</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Riscos</TableHead>
              <TableHead className="px-6 py-4 h-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts.map((contract) => {
              const highRisks = contract.risks?.filter((r) => r.severity === 'high').length || 0;
              const totalRisks = contract.risks?.length || 0;
              
              const getRiskStatusText = () => {
                if (highRisks > 0) {
                  return highRisks > 1 ? `${highRisks} Críticos` : "1 Crítico";
                }
                if (totalRisks > 0) {
                  return totalRisks > 1 ? `${totalRisks} Pontos` : "1 Ponto";
                }
                return "Seguro";
              };

              const getRiskBadgeClass = () => {
                if (highRisks > 0) return "bg-red-50 text-red-700";
                if (totalRisks > 0) return "bg-amber-50 text-amber-700";
                return "bg-emerald-50 text-emerald-700";
              };

              return (
                <TableRow key={contract.id} className="group border-border hover:bg-muted/5 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-foreground truncate max-w-48 leading-tight">
                          {contract.filename}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">PDF Document</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">
                        {new Date(contract.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                        {new Date(contract.created_at).getFullYear()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-xs font-medium text-muted-foreground">2.4 MB</span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded shadow-none border-none uppercase tracking-tighter">
                      Analisado
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded shadow-none border-none uppercase tracking-tighter",
                        getRiskBadgeClass()
                      )}
                    >
                      {getRiskStatusText()}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted cursor-pointer transition-colors shadow-none">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-2xl border-border bg-background animate-in fade-in zoom-in-95 duration-100">
                        <DropdownMenuItem asChild className="rounded-lg text-xs font-bold gap-2 py-2 cursor-pointer">
                          <Link href={`/dashboard/contracts/s/${contract.slug}`}>
                            <Eye className="h-4 w-4" />
                            Visualizar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg text-xs font-bold gap-2 py-2 cursor-pointer">
                          <Download className="h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg text-xs font-bold gap-2 py-2 cursor-pointer">
                          <History className="h-4 w-4" />
                          Ver Histórico
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border my-1" />
                        <DropdownMenuItem 
                          className="rounded-lg text-xs font-bold gap-2 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          onClick={() => handleDelete(contract.id, contract.filename)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0 z-20">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="transition-colors hover:text-primary">App</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold">Contratos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden selection:bg-primary/20">
        <div className="max-w-7xl mx-auto p-8 space-y-8 min-h-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight">Meus Contratos</h1>
              <p className="text-muted-foreground font-medium">Gerencie e acompanhe o histórico de análises efetuadas.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setFilters({ searchTerm: e.target.value })}
                  className="pl-11 h-11 bg-background border-border rounded-xl focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-none w-full"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={filterRisk !== 'all' || sortOrder !== 'newest' ? "default" : "outline"}
                    className={cn(
                      "h-11 px-5 rounded-xl gap-2 font-bold transition-all shadow-none border-border cursor-pointer",
                      filterRisk !== 'all' || sortOrder !== 'newest' ? "shadow-lg shadow-primary/20" : "bg-background hover:bg-muted/50"
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
                            onClick={() => setFilters({ filterRisk: risk as "all" | "high" | "medium" | "low" })}
                            className={cn(
                              "rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer h-7",
                              filterRisk === risk ? "shadow-lg shadow-primary/20" : ""
                            )}
                          >
                            {getRiskLabel(risk)}
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
                          onClick={() => setFilters({ sortOrder: 'newest' })}
                        >
                          Mais recentes
                          {sortOrder === "newest" && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                        </Button>
                        <Button
                          variant={sortOrder === 'oldest' ? "default" : "secondary"}
                          size="sm"
                          className="w-full justify-between rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer h-8"
                          onClick={() => setFilters({ sortOrder: 'oldest' })}
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
                          onClick={resetFilters}
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
            {renderTableContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
