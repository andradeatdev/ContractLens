import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

    const response = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Falha na autenticação" },
        { status: response.status }
      );
    }

    const res = NextResponse.json({ success: true, user: data.user });

    // Definir cookie HTTP-Only
    res.cookies.set("auth_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
