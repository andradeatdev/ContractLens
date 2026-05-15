"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FileText, ShieldAlert, CheckCircle2 } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

export function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <Card className="rounded-[2rem] shadow-sm hover:border-primary/20 transition-all group">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-2xl", color)}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-2xl font-black tabular-nums">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="rounded-[2rem] shadow-sm border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Stats } from "@/types";

interface StatSectionProps {
  stats: Stats | undefined;
  loading: boolean;
}

export function StatSection({ stats, loading }: StatSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={<FileText className="h-5 w-5" />}
        label="Contratos Analisados"
        value={stats?.total_contracts || 0}
        color="bg-blue-500/10 text-blue-500"
      />
      <StatCard
        icon={<ShieldAlert className="h-5 w-5" />}
        label="Riscos Totais"
        value={stats?.total_risks || 0}
        color="bg-amber-500/10 text-amber-500"
      />
      <StatCard
        icon={<CheckCircle2 className="h-5 w-5" />}
        label="Riscos Críticos"
        value={stats?.high_risks || 0}
        color="bg-red-500/10 text-red-500"
      />
    </div>
  );
}
