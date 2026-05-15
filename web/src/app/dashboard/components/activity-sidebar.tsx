"use client";

import React from "react";
import Link from "next/link";
import { Clock, ArrowRight, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

import { Activity } from "@/types";

interface ActivitySidebarProps {
  recentActivity: Activity[];
  loading: boolean;
  formatRelativeTime: (time: string) => string;
}

export function ActivitySidebar({ recentActivity, loading, formatRelativeTime }: ActivitySidebarProps) {
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivitySkeleton />
          <ActivitySkeleton />
          <ActivitySkeleton />
        </>
      );
    }

    if (recentActivity.length === 0) {
      return (
        <Empty className="rounded-3xl bg-muted/20 border-border/50 py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle className="text-xs">Sem atividades</EmptyTitle>
            <EmptyDescription className="text-[10px]">
              Suas atividades aparecerão aqui.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }

    return recentActivity.map((activity, i) => (
      <Card key={i} className="rounded-2xl shadow-sm hover:border-primary/20 transition-all group">
        <CardContent>
          <p className="text-xs font-bold text-foreground truncate">{activity.action}</p>
          <p className="text-[10px] text-muted-foreground truncate">{activity.target}</p>
          <p className="text-[10px] text-primary mt-1 font-medium">
            {formatRelativeTime(activity.time)}
          </p>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Atividade recente
        </h3>
        <Link href="/dashboard/history" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          Ver tudo
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {renderContent()}
      </div>

      <Card className="bg-primary/5 border-primary/10 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Dica Pro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Você pode baixar a versão textual do contrato a qualquer momento no menu de ações da lista de documentos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardContent className="pt-4">
        <Skeleton className="h-3 w-3/4 mb-2" />
        <Skeleton className="h-2 w-1/2 mb-2" />
        <Skeleton className="h-2 w-1/4" />
      </CardContent>
    </Card>
  );
}
