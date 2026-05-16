import { Suspense } from "react";
import { fetchContracts } from "@/lib/server-api";
import { ContractsClient } from "./client";
import { Contract } from "@/types";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  let contracts: Contract[] = [];
  try {
    contracts = await fetchContracts();
  } catch (error) {
    console.error("Error fetching contracts server-side:", error);
  }

  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse space-y-4 flex flex-col items-center">
          <div className="h-10 w-10 bg-primary/20 rounded-full animate-bounce" />
          <div className="h-4 w-32 bg-muted rounded-md" />
        </div>
      </div>
    }>
      <ContractsClient initialContracts={contracts} />
    </Suspense>
  );
}
