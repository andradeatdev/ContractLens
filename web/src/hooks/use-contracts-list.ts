"use client";

import React from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useUIStore } from "@/lib/store";
import { useModal } from "@/components/modal-provider";
import { toast } from "sonner";
import { Contract } from "@/types";

export function useContractsList() {
  const { contractFilters, setContractFilters, resetContractFilters } = useUIStore();
  const { searchTerm, filterRisk, sortOrder } = contractFilters;
  
  const modal = useModal();
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading, error: queryError } = useQuery<Contract[]>({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await fetch("/api/contracts");
      if (!response.ok) throw new Error("Falha ao carregar contratos");
      return response.json();
    }
  });

  const error = queryError ? (queryError as Error).message : null;

  const filteredContracts = React.useMemo(() => {
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
        c.risks?.some((r) => r.severity === filterRisk)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [contracts, searchTerm, filterRisk, sortOrder]);

  const deleteContractMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contracts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao excluir contrato");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success("Contrato excluído com sucesso!");
    },
    onError: (error) => {
      toast.error((error as Error).message);
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
      toast.success("Contrato renomeado");
    },
    onError: (err: Error) => {
      modal.alert({
        title: "Erro",
        message: err.message || "Não foi possível renomear o contrato",
        type: "destructive"
      });
    }
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contracts/${id}/reanalyze`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao reanalisar");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success("Análise atualizada", {
        description: "O documento foi reanalisado com sucesso pela IA."
      });
    },
    onError: (err: Error) => {
      toast.error("Erro na reanálise", {
        description: err.message
      });
    }
  });

  const handleDelete = (id: number, filename: string) => {
    modal.confirm({
      title: "Excluir contrato",
      message: `Tem certeza que deseja excluir o contrato "${filename}"? Esta ação não pode ser desfeita`,
      confirmLabel: "Excluir",
      type: "destructive",
      onConfirm: () => deleteContractMutation.mutate(id)
    });
  };

  const handleRename = (id: number, filename: string) => {
    modal.prompt({
      title: "Renomear contrato",
      message: "Digite o novo nome para o documento",
      defaultValue: filename,
      placeholder: "Ex: Contrato de Aluguel v2",
      onConfirm: (newName) => {
        if (!newName || newName === filename) return;
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
      toast.error("Erro ao baixar arquivo");
    }
  };

  const handleExportAnalysis = async (id: number, slug: string) => {
    try {
      const response = await fetch(`/api/contracts/${id}/export`);
      if (!response.ok) throw new Error("Erro ao exportar análise");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analise_${slug}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Exportação concluída", {
        description: "O relatório foi baixado com sucesso."
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao exportar");
    }
  };

  const handleReanalyze = (id: number) => {
    modal.confirm({
      title: "Reanalisar documento",
      message: "Isso executará a análise de IA novamente. Os riscos atuais serão substituídos. Deseja continuar?",
      confirmLabel: "Sim, reanalisar",
      onConfirm: () => reanalyzeMutation.mutate(id)
    });
  };

  return {
    contracts,
    filteredContracts,
    isLoading,
    error,
    filters: contractFilters,
    setFilters: setContractFilters,
    resetFilters: resetContractFilters,
    handleDelete,
    handleRename,
    handleDownload,
    handleExportAnalysis,
    handleReanalyze,
    isReanalyzing: reanalyzeMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  };
}
