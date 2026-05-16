"use client";

import { ContractAnalysis } from "@/components/contract-analysis";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startTransition, useState, ViewTransition } from "react";
import { useModal } from "@/components/modal-provider";
import { StatSection } from "./stat-section";
import { UploadSection } from "./upload-section";
import { ActivitySidebar } from "./activity-sidebar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnalysisResult, Stats, Activity } from "@/types";

export function DashboardClient({ 
  stats, 
  recentActivity 
}: { 
  stats: Stats; 
  recentActivity: Activity[] 
}) {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const modal = useModal();
  const queryClient = useQueryClient();

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
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  return (
    <ViewTransition default="none" enter="fade-in" exit="fade-out">
      {!analysis ? (
        <div className="max-w-4xl mx-auto py-12 space-y-12">
          <StatSection stats={stats} loading={false} />

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
              loading={false} 
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
  );
}