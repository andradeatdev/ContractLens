import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ContractsPage from "./page";
import React from "react";

// Variáveis hoisted para uso em vi.mock
const { useUIStoreMock, mockData } = vi.hoisted(() => ({
  useUIStoreMock: vi.fn(),
  mockData: [
    { id: 1, slug: "contrato-1", filename: "Aluguel.pdf", created_at: "2026-01-01T10:00:00Z", risks: [] },
    { id: 2, slug: "contrato-2", filename: "Trabalho.pdf", created_at: "2026-02-01T10:00:00Z", risks: [] }
  ]
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
  ModalProvider: ({ children }: any) => children,
}));

// Mock do View Transition
vi.mock("@/components/view-transition-wrapper", () => ({
  DirectionalTransition: ({ children }: any) => children,
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
  QueryClient: class { constructor() { (this as any).defaultOptions = {}; } },
  QueryClientProvider: ({ children }: any) => children,
}));

// Mock simplificado de Lucide Icons
vi.mock("lucide-react", () => ({
  Search: () => <span />,
  Filter: () => <span />,
  FileText: () => <span />,
  MoreVertical: () => <span />,
  AlertCircle: () => <span />,
  ChevronRight: () => <span />,
  Download: () => <span />,
  Edit2: () => <span />,
  Eye: () => <span />,
  Trash2: () => <span />,
  Loader2: () => <span />,
}));

// Mock de componentes Radix/Shadcn
vi.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children }: any) => <nav>{children}</nav>,
  BreadcrumbList: ({ children }: any) => <ol>{children}</ol>,
  BreadcrumbItem: ({ children }: any) => <li>{children}</li>,
  BreadcrumbLink: ({ children }: any) => <>{children}</>,
  BreadcrumbSeparator: () => <span>/</span>,
  BreadcrumbPage: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <>{children}</>,
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <>{children}</>,
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

    expect(screen.getByText("Seus documentos")).toBeInTheDocument();
    expect(screen.getByText("Aluguel.pdf")).toBeInTheDocument();
    expect(screen.getByText("Trabalho.pdf")).toBeInTheDocument();
  });

  it("deve filtrar contratos por termo de busca", async () => {
    // Usamos um componente wrapper para simular a mudança de estado no store
    const TestWrapper = () => {
      const [searchTerm, setSearchTerm] = React.useState("");
      useUIStoreMock.mockReturnValue({
        contractFilters: { searchTerm, filterRisk: "all", sortOrder: "newest" },
        setContractFilters: (updates: any) => {
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

    const searchInput = screen.getByPlaceholderText("Buscar contrato...");
    fireEvent.change(searchInput, { target: { value: "Aluguel" } });

    expect(searchInput).toHaveValue("Aluguel");

    await waitFor(() => {
      expect(screen.queryByText("Trabalho.pdf")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Aluguel.pdf")).toBeInTheDocument();
  });
});
