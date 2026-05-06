"use client";

import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { DirectionalTransition } from "@/components/view-transition-wrapper";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function DashboardNotFound() {
  return (
    <DirectionalTransition>
      <div className="flex flex-col h-full bg-background">
        {/* Header - Consistent with Dashboard */}
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md px-8 flex items-center sticky top-0 z-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <span className="text-sm font-medium text-muted-foreground">App</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Página não encontrada</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Professional Minimalist Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Empty className="max-w-md border-none">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileQuestion className="h-6 w-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle className="text-2xl font-semibold tracking-tight">Esta página não existe</EmptyTitle>
              <EmptyDescription className="text-sm leading-relaxed">
                O recurso que você está tentando acessar pode ter sido removido ou o link está incorreto.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row items-center justify-center gap-3 pt-4">
              <Button asChild variant="default" className="w-full sm:w-auto px-8 font-medium h-10">
                <Link href="/dashboard">Voltar ao início</Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto px-6 font-medium h-10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Página anterior
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    </DirectionalTransition>
  );
}
