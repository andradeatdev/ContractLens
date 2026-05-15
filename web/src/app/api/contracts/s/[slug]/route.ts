import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

async function getAuthToken() {
  return (await cookies()).get("auth_token")?.value;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const token = await getAuthToken();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const response = await fetch(`${backendUrl}/contracts/s/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return NextResponse.json({ error: "Failed to fetch contract by slug" }, { status: response.status });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
