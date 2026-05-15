import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from './page';
import { toast } from 'sonner';

// Mock do Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock global do fetch
    global.fetch = vi.fn();
  });

  it('deve renderizar o formulário de cadastro inicialmente', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Criar uma conta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('João Silva')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('nome@exemplo.com')).toBeInTheDocument();
  });

  it('deve avançar para a tela de OTP após registro bem-sucedido', async () => {
    const mockFetch = global.fetch as vi.Mock;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText('João Silva'), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByPlaceholderText('nome@exemplo.com'), { target: { value: 'joao@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Pass123!long' } });

    const submitButton = screen.getByRole('button', { name: /Criar minha conta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Verifique seu e-mail')).toBeInTheDocument();
    });

    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Conta criada'), expect.anything());
  });

  it('deve exibir o botão de reenvio com cooldown desabilitado inicialmente', async () => {
    const mockFetch = global.fetch as vi.Mock;
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<RegisterPage />);

    // Registrar
    fireEvent.change(screen.getByPlaceholderText('João Silva'), { target: { value: 'João' } });
    fireEvent.change(screen.getByPlaceholderText('nome@exemplo.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Pass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar minha conta/i }));

    await waitFor(() => {
      expect(screen.getByText('Reenviar código (60s)')).toBeInTheDocument();
    });

    const resendButton = screen.getByText(/Reenviar código/i);
    expect(resendButton).toBeDisabled();
  });
});
