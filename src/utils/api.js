const API_BASE_URL = 'http://localhost:8081/api';
// Función genérica para hacer peticiones HTTP
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
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
    }
    catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}
// ========== AUTENTICACIÓN ==========
export async function loginAPI(email, password) {
    return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}
export async function registerAPI(name, email, password) {
    return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}
// ========== CATEGORÍAS ==========
export async function getCategories() {
    return apiRequest('/categorias');
}
export async function createCategory(categoria) {
    return apiRequest('/categorias', {
        method: 'POST',
        body: JSON.stringify(categoria),
    });
}
export async function updateCategory(id, categoria) {
    return apiRequest(`/categorias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoria),
    });
}
export async function deleteCategory(id) {
    return apiRequest(`/categorias/${id}`, {
        method: 'DELETE',
    });
}
// ========== PRODUCTOS ==========
export async function getProducts() {
    return apiRequest('/productos');
}
export async function getProductById(id) {
    return apiRequest(`/productos/${id}`);
}
export async function getProductsByCategory(categoryId) {
    return apiRequest(`/productos/categoria/${categoryId}`);
}
export async function createProduct(producto) {
    return apiRequest('/productos', {
        method: 'POST',
        body: JSON.stringify(producto),
    });
}
export async function updateProduct(id, producto) {
    return apiRequest(`/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(producto),
    });
}
export async function deleteProduct(id) {
    return apiRequest(`/productos/${id}`, {
        method: 'DELETE',
    });
}
// ========== PEDIDOS ==========
export async function createOrder(pedido) {
    return apiRequest('/pedidos', {
        method: 'POST',
        body: JSON.stringify(pedido),
    });
}
export async function getOrdersByUser(userId) {
    return apiRequest(`/pedidos/usuario/${userId}`);
}
export async function getAllOrders() {
    return apiRequest('/pedidos');
}
export async function updateOrderStatus(id, estado) {
    return apiRequest(`/pedidos/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado }),
    });
}
// ========== USUARIOS ==========
export async function apiGet(endpoint) {
    return apiRequest(endpoint, {
        method: 'GET',
    });
}
export async function apiPost(endpoint, data) {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
export async function apiPut(endpoint, data) {
    return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}
export async function apiDelete(endpoint) {
    return apiRequest(endpoint, {
        method: 'DELETE',
    });
}
