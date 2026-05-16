import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Token de autorização ausente" }, { status: 401 });
    }

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

    const response = await fetch(`${backendUrl}/api/v1/contracts/${id}/export`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Falha ao exportar análise" }));
      return NextResponse.json(data, { status: response.status });
    }

    const content = await response.text();
    const contentDisposition = response.headers.get("content-disposition");
    const filename = contentDisposition?.split("filename=")[1] || `analise_${id}.md`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
    });
  } catch (error: unknown) {
    console.error("Export error:", error);
    return NextResponse.json({ error: `Erro interno: ${(error as Error).message}` }, { status: 500 });
  }
}
