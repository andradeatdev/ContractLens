import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";

    const apiFormData = new FormData();
    apiFormData.append("file", file);

    const response = await fetch(`${backendUrl}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Backend error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
