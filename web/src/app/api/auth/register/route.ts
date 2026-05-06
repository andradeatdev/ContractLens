import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

    const response = await fetch(`${backendUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Falha no registro" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
