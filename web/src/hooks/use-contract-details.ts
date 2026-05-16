"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/components/modal-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FullContract } from "@/types";
import { APIError } from "@/lib/api-error";

export function useContractDetails(slug: string) {
  const modal = useModal();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: contract, isLoading, error: queryError } = useQuery<FullContract>({
    queryKey: ['contract', slug],
    queryFn: async () => {
      const response = await fetch(`/api/contracts/s/${slug}`);
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new APIError(data, response.status);
      }
      return response.json();
    }
  });

  const error = queryError ? (queryError as Error).message : null;

  const reanalyzeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contracts/${id}/reanalyze`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new APIError(data, response.status);
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['contract', slug], data);
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contracts/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new APIError(data, response.status);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      router.push("/dashboard/contracts");
    },
    onError: (err: Error) => {
      modal.alert({
        title: "Erro",
        message: err.message || "Não foi possível excluir o contrato",
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
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new APIError(data, response.status);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', slug] });
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

  const handleDelete = () => {
    if (!contract) return;
    modal.confirm({
      title: "Excluir contrato",
      message: "Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita",
      confirmLabel: "Excluir",
      type: "destructive",
      onConfirm: () => deleteMutation.mutate(contract.id)
    });
  };

  const handleRename = () => {
    if (!contract) return;
    modal.prompt({
      title: "Renomear contrato",
      message: "Digite o novo nome para o documento",
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
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new APIError(data, response.status);
      }
      
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
      toast.error((err as Error).message || "Erro ao baixar arquivo");
    }
  };

  const handleExportAnalysis = async () => {
    if (!contract) return;
    try {
      const response = await fetch(`/api/contracts/${contract.id}/export`);
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new APIError(data, response.status);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analise_${contract.slug}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Exportação concluída", {
        description: "O relatório foi baixado com sucesso."
      });
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Erro ao exportar");
    }
  };

  const handleReanalyze = () => {
    if (!contract) return;
    modal.confirm({
      title: "Reanalisar documento",
      message: "Isso executará a análise de IA novamente. Os riscos atuais serão substituídos. Deseja continuar?",
      confirmLabel: "Sim, reanalisar",
      onConfirm: () => reanalyzeMutation.mutate(contract.id)
    });
  };

  return {
    contract,
    isLoading,
    error,
    isReanalyzing: reanalyzeMutation.isPending,
    handleDelete,
    handleRename,
    handleDownload,
    handleExportAnalysis,
    handleReanalyze,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['contract', slug] }),
  };
}
