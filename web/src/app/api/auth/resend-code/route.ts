import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
    
    console.log(`[Proxy Resend Code] Chamando backend: ${backendUrl}/api/v1/auth/resend-code`);

    const response = await fetch(`${backendUrl}/api/v1/auth/resend-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Falha ao reenviar código" }));
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, message: data.message });
  } catch (error: unknown) {
    console.error("Resend code error:", error);
    return NextResponse.json({ error: `Erro interno no servidor: ${(error as Error).message}` }, { status: 500 });
  }
}
