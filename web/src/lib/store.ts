import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UIState {
  // Preferências do usuário
  preferences: {
    compactView: boolean;
    showSummaryFirst: boolean;
  };
  updatePreferences: (prefs: Partial<UIState["preferences"]>) => void;

  // Filtros da tabela de contratos
  contractFilters: {
    searchTerm: string;
    filterRisk: string;
    sortOrder: "newest" | "oldest";
  };
  setContractFilters: (filters: Partial<UIState["contractFilters"]>) => void;
  resetContractFilters: () => void;

  // Rascunhos de chat (slug do contrato -> texto)
  chatDrafts: Record<string, string>;
  setChatDraft: (slug: string, draft: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      preferences: {
        compactView: false,
        showSummaryFirst: true,
      },
      updatePreferences: (newPrefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPrefs },
        })),

      contractFilters: {
        searchTerm: "",
        filterRisk: "all",
        sortOrder: "newest",
      },
      setContractFilters: (newFilters) =>
        set((state) => ({
          contractFilters: { ...state.contractFilters, ...newFilters },
        })),
      resetContractFilters: () =>
        set({
          contractFilters: {
            searchTerm: "",
            filterRisk: "all",
            sortOrder: "newest",
          },
        }),

      chatDrafts: {},
      setChatDraft: (slug, draft) =>
        set((state) => ({
          chatDrafts: { ...state.chatDrafts, [slug]: draft },
        })),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
