import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const response = await fetch(`${backendUrl}/api/v1/push/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      try {
        const errorJson = await response.json();
        return NextResponse.json(errorJson, { status: response.status });
      } catch {
        return NextResponse.json({ error: "Erro ao se desinscrever das notificações" }, { status: response.status });
      }
    }

    return NextResponse.json({ message: "Removido com sucesso" });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
