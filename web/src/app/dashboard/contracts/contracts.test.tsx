import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ContractsPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalProvider } from "@/components/modal-provider";

// Mock do Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mocks agressivos para componentes Shadcn/Radix que travam o JSDOM
vi.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children }: any) => <nav>{children}</nav>,
  BreadcrumbList: ({ children }: any) => <ol>{children}</ol>,
  BreadcrumbItem: ({ children }: any) => <li>{children}</li>,
  BreadcrumbLink: ({ children }: any) => <a>{children}</a>,
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

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <>{children}</>,
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const mockContracts = [
  {
    id: 1,
    slug: "contrato-1",
    filename: "Aluguel.pdf",
    created_at: "2026-01-01T10:00:00Z",
    risks: [{ severity: "high" }],
    content: "abc"
  },
  {
    id: 2,
    slug: "contrato-2",
    filename: "Trabalho.pdf",
    created_at: "2026-02-01T10:00:00Z",
    risks: [{ severity: "low" }],
    content: "def"
  }
];

describe("ContractsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockContracts),
    });
  });

  it("deve renderizar a lista de contratos", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <ContractsPage />
        </ModalProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText("Seus documentos")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("Aluguel.pdf")).toBeInTheDocument();
      expect(screen.getByText("Trabalho.pdf")).toBeInTheDocument();
    });
  });

  it("deve filtrar contratos por termo de busca", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <ContractsPage />
        </ModalProvider>
      </QueryClientProvider>
    );

    await waitFor(() => screen.getByText("Aluguel.pdf"));

    const searchInput = screen.getByPlaceholderText("Buscar contrato...");
    fireEvent.change(searchInput, { target: { value: "Aluguel" } });

    expect(screen.getByText("Aluguel.pdf")).toBeInTheDocument();
    expect(screen.queryByText("Trabalho.pdf")).not.toBeInTheDocument();
  });
});
