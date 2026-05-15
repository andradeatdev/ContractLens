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

  const handleDelete = (id: number, filename: string) => {
    modal.alert({
      title: "Excluir Contrato",
      message: `Tem certeza que deseja excluir o contrato "${filename}"? Esta ação não pode ser desfeita.`,
      type: "destructive",
      onConfirm: () => deleteContractMutation.mutate(id)
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
    refresh: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  };
}
