import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const authHeaders: Record<string, string> = {};
  if (session?.access_token) {
    authHeaders["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || error.error || res.statusText);
  }

  return res.json();
}
