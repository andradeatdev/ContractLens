import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

    const response = await fetch(`${backendUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ error: errorJson.error || errorJson.message || "Erro desconhecido no servidor" }, { status: response.status });
      } catch {
        return NextResponse.json({ error: `Erro no servidor: ${errorText}` }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Chat proxy error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
