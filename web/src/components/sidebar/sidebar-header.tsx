"use client";

import Link from "next/link";
import { ShieldCheck, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SidebarHeader as ShadcnHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarHeaderProps {
  onNavigate: (href: string, type: 'nav-forward' | 'nav-back') => void;
}

export function SidebarHeader({ onNavigate }: SidebarHeaderProps) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <ShadcnHeader className={cn("transition-all duration-300", isCollapsed ? "p-2 mt-2" : "p-6")}>
      {!isCollapsed ? (
        <div className="flex items-center justify-between overflow-hidden">
          <Link 
            href="/" 
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/', 'nav-back');
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
    </ShadcnHeader>
  );
}
