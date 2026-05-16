import { cookies } from "next/headers";
import { Stats, Activity } from "@/types";

export async function fetchStats(): Promise<Stats> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Unauthorized");

  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
  const res = await fetch(`${backendUrl}/api/v1/users/me/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Falha ao buscar estatísticas");
  return res.json();
}

export async function fetchActivity(): Promise<Activity[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Unauthorized");

  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
  const res = await fetch(`${backendUrl}/api/v1/users/me/activity`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Falha ao buscar atividade");
  const data = await res.json();
  return data.slice(0, 3);
}

export async function fetchContracts(): Promise<any[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Unauthorized");

  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
  const res = await fetch(`${backendUrl}/api/v1/contracts`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Falha ao buscar contratos");
  return res.json();
}
