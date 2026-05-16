import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const token = (await cookies()).get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

    const response = await fetch(`${backendUrl}/api/v1/contracts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      try {
        const errorJson = await response.json();
        return NextResponse.json(errorJson, { status: response.status });
      } catch {
        const errorText = await response.text();
        return NextResponse.json({ error: `Erro no servidor: ${errorText}` }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Contracts fetch error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
