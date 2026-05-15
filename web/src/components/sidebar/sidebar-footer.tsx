"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, HelpCircle, LogOut, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/hooks/use-has-mounted";
import {
  SidebarFooter as ShadcnFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const footerItems = [
  { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
  { icon: HelpCircle, label: "Ajuda", href: "/dashboard/help" },
];

interface SidebarFooterProps {
  onLogout: () => void;
}

export function SidebarFooter({ onLogout }: SidebarFooterProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { theme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const isCollapsed = state === "collapsed";

  return (
    <ShadcnFooter className={cn("p-4 mt-auto transition-all", isCollapsed ? "p-2" : "p-4")}>
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
            onClick={onLogout}
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
    </ShadcnFooter>
  );
}
