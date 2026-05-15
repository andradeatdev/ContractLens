"use client";

import { Card, CardContent } from "@/components/ui/card";

interface ContractPdfViewerProps {
  contractId: number;
}

export function ContractPdfViewer({ contractId }: ContractPdfViewerProps) {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-0 pt-0 bg-muted/5 min-h-[600px] lg:h-[calc(100dvh-15rem)]">
        <iframe
          src={`/api/contracts/${contractId}/download?inline=true`}
          className="w-full h-full min-h-[600px] lg:h-full border-0"
          title="Documento Original"
        />
      </CardContent>
    </Card>
  );
}
