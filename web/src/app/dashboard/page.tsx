"use client";

import { ContractAnalysis } from "@/components/contract-analysis";
import { DirectionalTransition } from "@/components/view-transition-wrapper";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  ShieldAlert,
  Trash2,
  Upload,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { startTransition, useState, ViewTransition } from "react";
import { useModal } from "@/components/modal-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const modal = useModal();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Falha ao buscar estatísticas");
      return response.json();
    }
  });

  const { data: recentActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const response = await fetch("/api/activity");
      if (!response.ok) throw new Error("Falha ao buscar atividade");
      const data = await response.json();
      return data.slice(0, 3);
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const formData = new FormData();
      formData.append("file", uploadFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha na análise do contrato");
      }
      return data;
    },
    onSuccess: (data) => {
      startTransition(() => {
        setAnalysis(data);
      });
      // Invalida caches para atualizar Dashboard e Lista
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (error: any) => {
      console.error("Upload error:", error);
      modal.alert({
        title: "Erro na Análise",
        message: error.message || "Ocorreu um erro ao analisar o contrato.",
        type: "destructive"
      });
    }
  });

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMins < 1) return "agora mesmo";
    if (diffInMins < 60) return `há ${diffInMins} min`;
    if (diffInHours < 24) return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const loading = uploadMutation.isPending;

  return (
    <DirectionalTransition>
      <div className="flex flex-col h-screen overflow-hidden selection:bg-primary/20 bg-background">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0 z-20 sticky top-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard" className="transition-colors hover:text-primary">App</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-bold">Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer font-bold">
                  Upgrade
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Liberar recursos premium</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto p-8 min-h-full">
            <ViewTransition default="none" enter="fade-in" exit="fade-out">
              {!analysis ? (
                <div className="max-w-4xl mx-auto py-12 space-y-12">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statsLoading ? (
                      <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                      </>
                    ) : (
                      <>
                        <StatCard
                          icon={<FileText className="h-5 w-5" />}
                          label="Contratos Analisados"
                          value={stats?.total_contracts || 0}
                          color="bg-blue-500/10 text-blue-500"
                        />
                        <StatCard
                          icon={<ShieldAlert className="h-5 w-5" />}
                          label="Riscos Totais"
                          value={stats?.total_risks || 0}
                          color="bg-amber-500/10 text-amber-500"
                        />
                        <StatCard
                          icon={<CheckCircle2 className="h-5 w-5" />}
                          label="Riscos Críticos"
                          value={stats?.high_risks || 0}
                          color="bg-red-500/10 text-red-500"
                        />
                      </>
                    )}
                  </div>

                  {/* Dashboard Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Upload Section */}
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
                          file ? "rotate-12 bg-primary text-white" : ""
                        )}>
                          <Upload className={cn("h-12 w-12", !file && "text-primary")} />
                        </div>

                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const selectedFile = e.target.files?.[0] || null;
                            if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
                              modal.alert({
                                title: "Arquivo muito grande",
                                message: "O limite máximo permitido é de 10MB.",
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
                              onClick={handleUpload}
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

                    {/* Right: Recent Activity Sidebar */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          Atividade recente
                        </h3>
                        <Link href="/dashboard/history" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                          Ver tudo
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        {activityLoading ? (
                          <>
                            <ActivitySkeleton />
                            <ActivitySkeleton />
                            <ActivitySkeleton />
                          </>
                        ) : recentActivity.length === 0 ? (
                          <Empty className="rounded-3xl bg-muted/20 border-border/50 py-10">
                            <EmptyHeader>
                              <EmptyMedia variant="icon">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              </EmptyMedia>
                              <EmptyTitle className="text-xs">Sem atividades</EmptyTitle>
                              <EmptyDescription className="text-[10px]">
                                Suas atividades aparecerão aqui.
                              </EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        ) : (
                          recentActivity.map((activity: any, i: number) => (
                            <Card key={i} className="rounded-2xl shadow-sm hover:border-primary/20 transition-all group">
                              <CardContent>
                                <p className="text-xs font-bold text-foreground truncate">{activity.action}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{activity.target}</p>
                                <p className="text-[10px] text-primary mt-1 font-medium">
                                  {formatRelativeTime(activity.time)}
                                </p>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>

                      <Card className="bg-primary/5 border-primary/10 rounded-3xl">
                        <CardHeader>
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            Dica Pro
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Você pode baixar a versão textual do contrato a qualquer momento no menu de ações da lista de documentos.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                <ContractAnalysis
                  analysis={analysis}
                  onReset={() => setAnalysis(null)}
                />
              )}
            </ViewTransition>
          </div>
        </main>
      </div>
    </DirectionalTransition>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  return (
    <Card className="rounded-[2rem] shadow-sm hover:border-primary/20 transition-all group">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-2xl", color)}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-2xl font-black tabular-nums">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="rounded-[2rem] shadow-sm border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardContent className="pt-4">
        <Skeleton className="h-3 w-3/4 mb-2" />
        <Skeleton className="h-2 w-1/2 mb-2" />
        <Skeleton className="h-2 w-1/4" />
      </CardContent>
    </Card>
  );
}
