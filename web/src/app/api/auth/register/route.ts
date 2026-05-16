import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
    
    console.log(`[Proxy Register] Chamando backend: ${backendUrl}/api/v1/auth/register`);

    const response = await fetch(`${backendUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Falha no registro" }));
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, user: data });
  } catch (error: unknown) {
    console.error("Register error:", error);
    return NextResponse.json({ error: `Erro interno no servidor: ${(error as Error).message}` }, { status: 500 });
  }
}
