"use client";

import { usePathname, useRouter } from "next/navigation";
import { startTransition, addTransitionType } from "react";
import { useModal } from "@/components/modal-provider";
import { Sidebar as ShadcnSidebar } from "@/components/ui/sidebar";

// Refactored sub-components
import { SidebarHeader } from "./sidebar-header";
import { SidebarNav } from "./sidebar-nav";
import { SidebarFooter } from "./sidebar-footer";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const modal = useModal();

  const navigateWithTransition = (href: string, type: 'nav-forward' | 'nav-back') => {
    if (pathname === href) return;
    
    startTransition(() => {
      addTransitionType(type);
      router.push(href);
    });
  };

  const handleLogout = async () => {
    modal.confirm({
      title: "Sair da conta",
      message: "Tem certeza que deseja encerrar sua sessão",
      confirmLabel: "Sair",
      type: "destructive",
      onConfirm: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/login");
        } catch (error) {
          console.error("Logout error:", error);
        }
      }
    });
  };

  return (
    <ShadcnSidebar collapsible="icon" className="border-r border-border bg-muted/20">
      <SidebarHeader onNavigate={navigateWithTransition} />
      <SidebarNav onNavigate={navigateWithTransition} />
      <SidebarFooter onLogout={handleLogout} />
    </ShadcnSidebar>
  );
}
