import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

async function getAuthToken() {
  return (await cookies()).get("auth_token")?.value;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthToken();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const response = await fetch(`${backendUrl}/contracts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return NextResponse.json({ error: "Failed to fetch contract" }, { status: response.status });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthToken();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${backendUrl}/contracts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) return NextResponse.json({ error: "Failed to update contract" }, { status: response.status });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthToken();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const response = await fetch(`${backendUrl}/contracts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return NextResponse.json({ error: "Failed to delete contract" }, { status: response.status });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
