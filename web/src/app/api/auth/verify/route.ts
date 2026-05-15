import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${backendUrl}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Falha na verificação" },
        { status: response.status }
      );
    }

    const res = NextResponse.json({ success: true, message: data.message });

    // Definir cookie HTTP-Only para login automático
    if (data.token) {
      res.cookies.set("auth_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 horas
        path: "/",
      });
    }

    return res;
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
