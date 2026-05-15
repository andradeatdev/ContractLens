import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

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
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: React.ComponentPropsWithoutRef<'span'>) => <span {...props}>{children}</span>,
    header: ({ children, ...props }: React.ComponentPropsWithoutRef<'header'>) => <header {...props}>{children}</header>,
    nav: ({ children, ...props }: React.ComponentPropsWithoutRef<'nav'>) => <nav {...props}>{children}</nav>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));
