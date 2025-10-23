const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    // try to extract error message from body
    let body: any = null;
    try {
      body = await res.json();
    } catch (e) {
      // ignore parse errors
    }
    const message = body?.message || res.statusText || 'Request failed';
    throw new Error(message);
  }

  // If response has no body (204), return null
  if (res.status === 204) return null;

  return res.json();
}
