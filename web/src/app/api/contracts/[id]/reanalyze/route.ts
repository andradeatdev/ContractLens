import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
    const authHeader = request.headers.get("Authorization");

    console.log(`[Proxy Reanalyze] Chamando backend: ${backendUrl}/contracts/${id}/reanalyze`);

    const response = await fetch(`${backendUrl}/contracts/${id}/reanalyze`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {})
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.error || "Falha ao reanalisar contrato" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Reanalyze error:", error);
    return NextResponse.json({ error: `Erro interno: ${(error as Error).message}` }, { status: 500 });
  }
}
