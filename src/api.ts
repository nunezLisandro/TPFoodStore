export const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8081/api";

try {
  console.info('[api] API_URL =', API_URL);
} catch (e) {
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let body: any = null;
    try {
      body = await res.json();
    } catch (e) {
      
    }
    const message = body?.message || body?.error || (body ? JSON.stringify(body) : null) || res.statusText || 'Request failed';
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}
