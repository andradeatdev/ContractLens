import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
    const authHeader = request.headers.get("Authorization");

    const response = await fetch(`${backendUrl}/contracts/notes/${id}`, {
      method: "DELETE",
      headers: { 
        ...(authHeader ? { "Authorization": authHeader } : {})
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Falha ao excluir nota" },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Delete Note error:", error);
    return NextResponse.json({ error: `Erro interno: ${error.message}` }, { status: 500 });
  }
}
