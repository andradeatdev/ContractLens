import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContractsClient } from './client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUIStore } from '@/lib/store';

// Mocks
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('@/components/modal-provider', () => ({
  useModal: () => ({
    confirm: vi.fn(),
    prompt: vi.fn(),
    alert: vi.fn(),
  })
}));

const mockContracts = [
  {
    id: 1,
    filename: "Aluguel.pdf",
    slug: "aluguel-123",
    created_at: new Date().toISOString(),
    risks: [
      { id: 1, severity: "high", title: "Risco alto", explanation: "", suggestion: "", clause: "" },
      { id: 2, severity: "low", title: "Risco baixo", explanation: "", suggestion: "", clause: "" }
    ]
  },
  {
    id: 2,
    filename: "Trabalho.pdf",
    slug: "trabalho-456",
    created_at: new Date().toISOString(),
    risks: []
  }
];

// Sobrescrevendo global fetch para mockar API call
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockContracts),
  })
) as jest.Mock;

describe('ContractsClient', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    useUIStore.setState({
      contractFilters: {
        searchTerm: '',
        filterRisk: 'all',
        sortOrder: 'newest'
      }
    });
    vi.clearAllMocks();
  });

  const TestWrapper = () => (
    <QueryClientProvider client={queryClient}>
      <ContractsClient initialContracts={mockContracts} />
    </QueryClientProvider>
  );

  it('deve renderizar a lista de contratos', async () => {
    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Meus Contratos")).toBeInTheDocument();
      expect(screen.getByText("Aluguel.pdf")).toBeInTheDocument();
      expect(screen.getByText("Trabalho.pdf")).toBeInTheDocument();
    });
  });

  it('deve filtrar contratos por termo de busca', async () => {
    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Aluguel.pdf")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Buscar por nome...");
    fireEvent.change(searchInput, { target: { value: 'trabalho' } });

    await waitFor(() => {
      expect(screen.getByText("Trabalho.pdf")).toBeInTheDocument();
      expect(screen.queryByText("Aluguel.pdf")).not.toBeInTheDocument();
    });
  });
});
