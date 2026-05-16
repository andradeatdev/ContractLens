"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, History } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { GlobalSearch } from "@/app/dashboard/components/global-search";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Meus contratos", href: "/dashboard/contracts" },
  { icon: History, label: "Histórico", href: "/dashboard/history" },
];

interface SidebarNavProps {
  onNavigate: (href: string, type: 'nav-forward' | 'nav-back') => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarContent className={cn("px-4 transition-all", isCollapsed ? "px-2" : "px-4")}>
      <SidebarMenu className="gap-1">
        <GlobalSearch />
        <div className="h-px bg-border my-2 mx-2" />
        
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
              size="lg"
              className={cn(
                "transition-all",
                pathname === item.href 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" 
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              )}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.href, 'nav-forward');
              }}
            >
              <Link href={item.href}>
                <item.icon className="shrink-0 size-5" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
  );
}
