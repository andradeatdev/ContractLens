import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
    const authHeader = request.headers.get("Authorization");
    const body = await request.json();

    const response = await fetch(`${backendUrl}/contracts/notes`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {})
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.error || "Falha ao criar nota" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Create Note error:", error);
    return NextResponse.json({ error: `Erro interno: ${error.message}` }, { status: 500 });
  }
}
