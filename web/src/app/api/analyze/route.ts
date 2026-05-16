import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

    const response = await fetch(`${backendUrl}/api/v1/analysis/clauses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Erro desconhecido no servidor" }));
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
