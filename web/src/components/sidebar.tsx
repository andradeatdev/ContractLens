"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  Settings, 
  LogOut, 
  ShieldCheck,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { startTransition, addTransitionType, useEffect, useState } from "react";
import { useModal } from "@/components/modal-provider";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Meus contratos", href: "/dashboard/contracts" },
  { icon: History, label: "Histórico", href: "/dashboard/history" },
];

const footerItems = [
  { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
  { icon: HelpCircle, label: "Ajuda", href: "/dashboard/help" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const modal = useModal();
  const { state, toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isCollapsed = state === "collapsed";

  useEffect(() => setMounted(true), []);

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
      message: "Tem certeza que deseja encerrar sua sessão?",
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
      <SidebarHeader className={cn("transition-all duration-300", isCollapsed ? "p-2 mt-2" : "p-6")}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between overflow-hidden">
            <Link 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                navigateWithTransition('/', 'nav-back');
              }}
              className="flex items-center gap-2 group shrink-0 transition-all hover:opacity-80"
            >
              <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20 shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
            </Link>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 text-muted-foreground hover:bg-background active:scale-90 shrink-0"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Recolher menu</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-10 w-10 text-muted-foreground hover:bg-background active:scale-90"
                >
                  <PanelLeftOpen className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Expandir menu</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={cn("px-4 transition-all", isCollapsed ? "px-2" : "px-4")}>
        <SidebarMenu className="gap-1">
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
                  navigateWithTransition(item.href, 'nav-forward');
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

      <SidebarFooter className={cn("p-4 mt-auto transition-all", isCollapsed ? "p-2" : "p-4")}>
        {!isCollapsed && (
          <div className="px-4 py-3 mb-4 rounded-2xl bg-background/50 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              {mounted && theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="text-xs font-bold uppercase tracking-wider">Tema</span>
            </div>
            <Switch 
              checked={mounted && theme === "dark"} 
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        )}

        <SidebarMenu className="gap-1">
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                size="lg"
                className="text-muted-foreground hover:bg-background hover:text-foreground transition-all"
              >
                <Link href={item.href}>
                  <item.icon className="shrink-0 size-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <Separator className="my-2 bg-border/50" />

          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="text-muted-foreground hover:bg-background hover:text-foreground transition-all group"
              onClick={handleLogout}
              tooltip="Sair da conta"
            >
              {isCollapsed ? (
                <LogOut className="size-5 text-red-500 transition-colors" />
              ) : (
                <>
                  <Avatar className="h-7 w-7 border border-border">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">AD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="font-bold text-xs truncate">Gabriel Andrade</span>
                    <span className="text-[10px] text-muted-foreground/60 truncate">Sair da conta</span>
                  </div>
                  <LogOut className="ml-auto h-5 w-5 text-red-500 transition-transform group-hover:-translate-x-1" />
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

      </SidebarFooter>
    </ShadcnSidebar>
  );
}
