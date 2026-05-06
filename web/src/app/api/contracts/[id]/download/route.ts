import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const response = await fetch(`${backendUrl}/contracts/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return NextResponse.json({ error: "Failed to download" }, { status: response.status });

    const blob = await response.blob();
    const inline = request.nextUrl.searchParams.get("inline") === "true";
    let contentDisposition = response.headers.get("Content-Disposition") || "attachment; filename=contract.txt";

    if (inline && contentDisposition.includes("attachment")) {
      contentDisposition = contentDisposition.replace("attachment", "inline");
    }

    return new NextResponse(blob, {
      headers: {
        "Content-Disposition": contentDisposition,
        "Content-Type": response.headers.get("Content-Type") || "text/plain",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
