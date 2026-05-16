import { DirectionalTransition } from "@/components/view-transition-wrapper";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Suspense } from "react";
import { StatCardSkeleton } from "./components/stat-section";
import { DashboardClient } from "./components/dashboard-client";
import { fetchStats, fetchActivity } from "@/lib/server-api";
import { Stats, Activity } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats: Stats | undefined;
  let recentActivity: Activity[] = [];
  
  try {
    stats = await fetchStats();
    recentActivity = await fetchActivity();
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Em caso de erro, defaults
    stats = { total_contracts: 0, total_risks: 0, high_risks: 0 };
  }

  return (
    <DirectionalTransition>
      <div className="flex flex-col h-screen overflow-hidden selection:bg-primary/20 bg-background">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0 z-20 sticky top-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard" className="transition-colors hover:text-primary">App</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-bold">Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer font-bold">
                  Upgrade
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Liberar recursos premium</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto p-8 min-h-full">
            <Suspense fallback={
              <div className="max-w-4xl mx-auto py-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </div>
              </div>
            }>
              <DashboardClient stats={stats} recentActivity={recentActivity} />
            </Suspense>
          </div>
        </main>
      </div>
    </DirectionalTransition>
  );
}
