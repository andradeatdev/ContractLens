import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

    let response: Response;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      response = await fetch(`${backendUrl}/api/v1/contracts`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData,
      });
    } else {
      const body = await req.json();
      response = await fetch(`${backendUrl}/api/v1/analysis/clauses`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Erro desconhecido no servidor" }));
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
