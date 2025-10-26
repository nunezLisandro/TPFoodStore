export const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080/api";

// Log API URL in dev for easier debugging
try {
  // eslint-disable-next-line no-console
  console.info('[api] API_URL =', API_URL);
} catch (e) {
  // ignore
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
      // ignore parse errors
    }
    const message = body?.message || body?.error || (body ? JSON.stringify(body) : null) || res.statusText || 'Request failed';
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}
