import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const baseId = formData.get("base_id");
    const file = formData.get("file");

    if (!baseId || !file) {
      return NextResponse.json({ error: "Dados incompletos (base_id ou arquivo ausente)" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

    const apiFormData = new FormData();
    apiFormData.append("base_id", baseId);
    apiFormData.append("file", file);

    const response = await fetch(`${backendUrl}/api/v1/contracts/compare`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: apiFormData,
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
    console.error("Comparison proxy error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
