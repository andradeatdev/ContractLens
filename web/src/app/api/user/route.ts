import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const token = (await cookies()).get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
    const response = await fetch(`${backendUrl}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Falha ao buscar perfil no servidor" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar perfil" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = (await cookies()).get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

    const response = await fetch(`${backendUrl}/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Falha ao atualizar perfil no servidor" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar perfil" },
      { status: 500 }
    );
  }
}

// Fallback para POST caso o cliente use POST
export async function POST(request: NextRequest) {
  return PUT(request);
}
