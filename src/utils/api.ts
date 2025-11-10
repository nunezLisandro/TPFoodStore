const API_BASE_URL = 'http://localhost:8081/api';

// Función genérica para hacer peticiones HTTP
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// ========== AUTENTICACIÓN ==========
export async function loginAPI(email: string, password: string) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerAPI(name: string, email: string, password: string) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// ========== CATEGORÍAS ==========
export async function getCategories() {
  return apiRequest('/categorias');
}

export async function createCategory(categoria: { nombre: string; descripcion: string; imagen: string }) {
  return apiRequest('/categorias', {
    method: 'POST',
    body: JSON.stringify(categoria),
  });
}

export async function updateCategory(id: number, categoria: { nombre: string; descripcion: string; imagen: string }) {
  return apiRequest(`/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoria),
  });
}

export async function deleteCategory(id: number) {
  return apiRequest(`/categorias/${id}`, {
    method: 'DELETE',
  });
}

// ========== PRODUCTOS ==========
export async function getProducts() {
  return apiRequest('/productos');
}

export async function getProductById(id: number) {
  return apiRequest(`/productos/${id}`);
}

export async function getProductsByCategory(categoryId: number) {
  return apiRequest(`/productos/categoria/${categoryId}`);
}

export async function createProduct(producto: {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: number;
  imagen: string;
  disponible: boolean;
}) {
  return apiRequest('/productos', {
    method: 'POST',
    body: JSON.stringify(producto),
  });
}

export async function updateProduct(id: number, producto: {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: number;
  imagen: string;
  disponible: boolean;
}) {
  return apiRequest(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(producto),
  });
}

export async function deleteProduct(id: number) {
  return apiRequest(`/productos/${id}`, {
    method: 'DELETE',
  });
}

// ========== PEDIDOS ==========
export async function createOrder(pedido: {
  usuarioId: number;
  items: Array<{ productoId: number; cantidad: number }>;
  telefono: string;
  direccion: string;
  metodoPago: string;
  notas?: string;
}) {
  return apiRequest('/pedidos', {
    method: 'POST',
    body: JSON.stringify(pedido),
  });
}

export async function getOrdersByUser(userId: number) {
  return apiRequest(`/pedidos/usuario/${userId}`);
}

export async function getAllOrders() {
  return apiRequest('/pedidos');
}

export async function updateOrderStatus(id: number, estado: string) {
  return apiRequest(`/pedidos/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ estado }),
  });
}