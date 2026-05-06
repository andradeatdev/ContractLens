"use client";

import { startTransition } from "react";
import { History, ChevronRight, Clock, ArrowUpRight, Loader2 } from "lucide-react";
import { DirectionalTransition } from "@/components/view-transition-wrapper";
import { useRouter } from "next/navigation";
import { addTransitionType } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function HistoryPage() {
  const router = useRouter();

  const navigateToContract = (slug: string) => {
    startTransition(() => {
      addTransitionType('nav-forward');
      router.push(`/dashboard/contracts/${slug}`);
    });
  };

  const { data: activities = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const response = await fetch("/api/activity");
      if (!response.ok) throw new Error("Falha ao carregar histórico");
      return response.json();
    }
  });

  const error = queryError ? (queryError as Error).message : null;

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: ptBR 
      });
    } catch (error) {
      return "Há pouco";
    }
  };

  return (
    <DirectionalTransition>
      <div className="flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard" className="transition-colors hover:text-primary">App</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-bold">Histórico</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 overflow-y-auto bg-background p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Atividade recente</h2>
              <p className="text-muted-foreground">Acompanhe todas as suas interações e análises passadas.</p>
            </div>

            {loading ? (
              <div className="relative space-y-4">
                <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-border hidden md:block" />
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="relative bg-background rounded-[2rem] border border-border/50 overflow-hidden">
                    <CardContent className="p-6 flex flex-col md:flex-row gap-4">
                      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="p-20 text-center space-y-4">
                <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto">
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold">Erro ao carregar histórico</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            ) : !activities || activities.length === 0 ? (
              <Empty className="py-20 bg-muted/20 border-border/50 rounded-[2rem]">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <History className="h-10 w-10 text-muted-foreground/30" />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl tracking-tight">Nenhuma atividade registrada</EmptyTitle>
                  <EmptyDescription className="text-sm">
                    Suas análises e conversas aparecerão aqui.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="relative space-y-4">
                <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-border hidden md:block" />
                
                {activities.map((item: any) => (
                  <Card 
                    key={`${item.action}-${item.id}-${item.time}`} 
                    onClick={() => navigateToContract(item.contract_slug)}
                    className="relative bg-background rounded-[2rem] border border-border hover:border-primary/30 transition-all shadow-sm group cursor-pointer overflow-hidden"
                  >
                    <CardContent className="p-6 flex flex-col md:flex-row gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary z-10 shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-sm text-foreground">{item.action}</p>
                          <p className="text-sm text-muted-foreground">{item.target}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-medium text-muted-foreground">{formatTime(item.time)}</span>
                          <div className="p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DirectionalTransition>
  );
}
