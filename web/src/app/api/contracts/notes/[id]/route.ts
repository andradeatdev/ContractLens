import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
    const token = (await cookies()).get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/api/v1/contracts/notes/${id}`, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      try {
        const errorJson = await response.json();
        return NextResponse.json(errorJson, { status: response.status });
      } catch {
        return NextResponse.json(
          { error: "Falha ao excluir nota" },
          { status: response.status }
        );
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("Delete Note error:", error);
    return NextResponse.json({ error: `Erro interno: ${(error as Error).message}` }, { status: 500 });
  }
}
