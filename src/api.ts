export const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080/api";

try {
  console.info('[api] API_URL =', API_URL);
} catch (e) {
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  try {
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!res.ok) {
      let body: any = null;
      try {
        body = await res.json();
      } catch (e) {
        // Si no puede parsear JSON, usar el status text
      }
      
      let message = body?.message || body?.error || res.statusText || 'Request failed';
      
      // Manejar errores específicos
      if (res.status === 404) {
        message = `Endpoint no encontrado: ${endpoint}`;
      } else if (res.status === 500) {
        message = "Error interno del servidor";
      } else if (res.status === 400) {
        message = body?.message || "Datos inválidos enviados al servidor";
      }
      
      console.error(`[API Error] ${res.status} - ${message}`);
      throw new Error(message);
    }
    
    if (res.status === 204) return null;
    const data = await res.json();
    console.log(`[API Success] ${options.method || 'GET'} ${url}`, data);
    return data;
    
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`[API Network Error] No se pudo conectar a ${url}`);
      throw new Error(`No se pudo conectar al servidor. Verifica que el backend esté funcionando en ${API_URL}`);
    }
    throw error;
  }
}
