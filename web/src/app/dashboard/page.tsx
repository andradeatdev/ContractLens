"use client";

import { ContractAnalysis } from "@/components/contract-analysis";
import { DirectionalTransition } from "@/components/view-transition-wrapper";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { startTransition, useState, ViewTransition } from "react";
import { useModal } from "@/components/modal-provider";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatSection } from "./components/stat-section";
import { UploadSection } from "./components/upload-section";
import { ActivitySidebar } from "./components/activity-sidebar";
import { AnalysisResult, Stats, Activity } from "@/types";

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const modal = useModal();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Falha ao buscar estatísticas");
      return response.json();
    }
  });

  const { data: recentActivity = [], isLoading: activityLoading } = useQuery<Activity[]>({
    queryKey: ['activity'],
    queryFn: async () => {
      const response = await fetch("/api/activity");
      if (!response.ok) throw new Error("Falha ao buscar atividade");
      const data = await response.json();
      return data.slice(0, 3);
    }
  });

  const uploadMutation = useMutation<AnalysisResult, Error, File>({
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
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      modal.alert({
        title: "Erro na Análise",
        message: error.message || "Ocorreu um erro ao analisar o contrato.",
        type: "destructive"
      });
    }
  });

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

  return (
    <DirectionalTransition>
      <div className="flex flex-col h-screen overflow-hidden selection:bg-primary/20 bg-background">
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

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto p-8 min-h-full">
            <ViewTransition default="none" enter="fade-in" exit="fade-out">
              {!analysis ? (
                <div className="max-w-4xl mx-auto py-12 space-y-12">
                  <StatSection stats={stats} loading={statsLoading} />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <UploadSection 
                      file={file} 
                      setFile={setFile} 
                      loading={uploadMutation.isPending} 
                      onUpload={() => file && uploadMutation.mutate(file)}
                      onAlert={modal.alert}
                    />

                    <ActivitySidebar 
                      recentActivity={recentActivity} 
                      loading={activityLoading} 
                      formatRelativeTime={formatRelativeTime} 
                    />
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
