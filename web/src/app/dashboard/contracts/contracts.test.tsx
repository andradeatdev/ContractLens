import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ContractsPage from "./page";
import React from "react";
import { Contract } from "@/types";

// Variáveis hoisted para uso em vi.mock
const { useUIStoreMock, mockData } = vi.hoisted(() => ({
  useUIStoreMock: vi.fn(),
  mockData: [
    { id: 1, slug: "contrato-1", filename: "Aluguel.pdf", created_at: "2026-01-01T10:00:00Z", risks: [], content: "" },
    { id: 2, slug: "contrato-2", filename: "Trabalho.pdf", created_at: "2026-02-01T10:00:00Z", risks: [], content: "" }
  ] as Contract[]
}));

// Mocks do Next.js
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock do Store dinâmico
vi.mock("@/lib/store", () => ({
  useUIStore: useUIStoreMock
}));

// Mock do Modal
vi.mock("@/components/modal-provider", () => ({
  useModal: () => ({ alert: vi.fn(), confirm: vi.fn(), prompt: vi.fn() }),
  ModalProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock do View Transition
vi.mock("@/components/view-transition-wrapper", () => ({
  DirectionalTransition: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock de React Query
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: mockData,
    isLoading: false,
    error: null
  }),
  useMutation: () => ({ mutate: vi.fn() }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  QueryClient: class { defaultOptions = {}; },
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock simplificado de Lucide Icons
vi.mock("lucide-react", () => ({
  Search: () => <span />,
  Filter: () => <span />,
  FileText: () => <span />,
  MoreVertical: () => <span />,
  MoreHorizontal: () => <span />,
  AlertCircle: () => <span />,
  ChevronRight: () => <span />,
  Download: () => <span />,
  Edit2: () => <span />,
  Eye: () => <span />,
  Trash2: () => <span />,
  Loader2: () => <span />,
  History: () => <span />,
}));

// Mock de componentes Radix/Shadcn
vi.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => <ol>{children}</ol>,
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  BreadcrumbLink: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  BreadcrumbSeparator: () => <span>/</span>,
  BreadcrumbPage: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("ContractsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default store state
    useUIStoreMock.mockReturnValue({
      contractFilters: { searchTerm: "", filterRisk: "all", sortOrder: "newest" },
      setContractFilters: vi.fn(),
      resetContractFilters: vi.fn(),
    });
  });

  it("deve renderizar a lista de contratos", async () => {
    render(<ContractsPage />);

    expect(screen.getByText("Meus Contratos")).toBeInTheDocument();
    expect(screen.getByText("Aluguel.pdf")).toBeInTheDocument();
    expect(screen.getByText("Trabalho.pdf")).toBeInTheDocument();
  });

  it("deve filtrar contratos por termo de busca", async () => {
    // Usamos um componente wrapper para simular a mudança de estado no store
    const TestWrapper = () => {
      const [searchTerm, setSearchTerm] = React.useState("");
      useUIStoreMock.mockReturnValue({
        contractFilters: { searchTerm, filterRisk: "all", sortOrder: "newest" },
        setContractFilters: (updates: { searchTerm?: string }) => {
          if (updates.searchTerm !== undefined) setSearchTerm(updates.searchTerm);
        },
        resetContractFilters: vi.fn(),
      });
      return <ContractsPage />;
    };

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Aluguel.pdf")).toBeInTheDocument();
      expect(screen.getByText("Trabalho.pdf")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Buscar por nome...");
    fireEvent.change(searchInput, { target: { value: "Aluguel" } });

    expect(searchInput).toHaveValue("Aluguel");

    await waitFor(() => {
      expect(screen.queryByText("Trabalho.pdf")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Aluguel.pdf")).toBeInTheDocument();
  });
});
