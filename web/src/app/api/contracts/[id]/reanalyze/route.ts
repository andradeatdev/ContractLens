import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
    const token = (await cookies()).get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Proxy Reanalyze] Chamando backend: ${backendUrl}/api/v1/contracts/${id}/reanalyze`);

    const response = await fetch(`${backendUrl}/api/v1/contracts/${id}/reanalyze`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Falha ao reanalisar contrato" }));
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Reanalyze error:", error);
    return NextResponse.json({ error: `Erro interno: ${(error as Error).message}` }, { status: 500 });
  }
}
