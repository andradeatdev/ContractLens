import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
    
    console.log(`[Proxy Resend Code] Chamando backend: ${backendUrl}/auth/resend-code`);

    const response = await fetch(`${backendUrl}/auth/resend-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      
      if (!response.ok) {
        return NextResponse.json(
          { error: data.error || "Falha ao reenviar código" },
          { status: response.status }
        );
      }
      
      return NextResponse.json({ success: true, message: data.message });
    } else {
      const text = await response.text();
      console.error(`[Proxy Resend Code] Erro: Backend retornou não-JSON (${response.status}):`, text.slice(0, 500));
      return NextResponse.json(
        { error: "Backend indisponível ou erro de configuração" },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("Resend code error:", error);
    return NextResponse.json({ error: `Erro interno no servidor: ${error.message}` }, { status: 500 });
  }
}
