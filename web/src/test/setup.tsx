import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do useRouter do Next.js
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock do View Transition Wrapper se necessário
vi.mock('@/components/view-transition-wrapper', () => ({
  DirectionalTransition: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock do react-transition-group ou similar se der problema
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    addTransitionType: vi.fn(),
  };
});

// Mock do ResizeObserver para o component input-otp
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

// Mock do framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
  },
  AnimatePresence: ({ children }: any) => children,
}));
