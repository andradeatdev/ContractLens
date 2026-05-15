import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
    const authHeader = request.headers.get("Authorization");

    console.log(`[Proxy Export] Chamando backend: ${backendUrl}/contracts/${id}/export`);

    const response = await fetch(`${backendUrl}/contracts/${id}/export`, {
      method: "GET",
      headers: { 
        ...(authHeader ? { "Authorization": authHeader } : {})
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Falha ao exportar análise" },
        { status: response.status }
      );
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
