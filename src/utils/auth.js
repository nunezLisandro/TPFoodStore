const USER_STORAGE_KEY = 'user'; // Cambiar de vuelta a la clave original
const CART_STORAGE_KEY = 'foodstore_cart'; // Misma clave que usa cart.ts
// Guardar datos del usuario en localStorage
export function loginUser(userData) {
    // Obtener el usuario anterior (si existe)
    const previousUserData = localStorage.getItem(USER_STORAGE_KEY);
    const previousUser = previousUserData ? JSON.parse(previousUserData) : null;
    // Siempre limpiar el carrito al hacer login (para evitar confusiones)
    // Esto asegura que cada sesión tenga un carrito limpio
    localStorage.removeItem(CART_STORAGE_KEY);
    // Guardar el nuevo usuario
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    // Disparar evento personalizado para notificar que el carrito cambió
    window.dispatchEvent(new Event('cartUpdated'));
}
// Obtener datos del usuario desde localStorage
export function getUser() {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
}
// Verificar si hay una sesión activa
export function isLoggedIn() {
    return getUser() !== null;
}
// Verificar si el usuario es administrador
export function isAdmin() {
    const user = getUser();
    return user?.role === 'admin';
}
// Cerrar sesión
export function logout() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(CART_STORAGE_KEY); // Limpiar carrito al cerrar sesión
    window.location.href = "/src/pages/auth/login/login.html";
}
// Proteger rutas - redirige al login si no está autenticado
export function requireAuth() {
    const user = getUser();
    if (!user) {
        window.location.href = "/src/pages/auth/login/login.html";
        throw new Error('Usuario no autenticado');
    }
    return user;
}
// Proteger rutas de administrador
export function requireAdmin() {
    const user = requireAuth();
    if (user.role !== 'admin') {
        window.location.href = "/src/pages/store/home/home.html";
        throw new Error('Acceso denegado: se requieren permisos de administrador');
    }
    return user;
}
// Redirigir después del login según el rol
export function redirectAfterLogin(user) {
    if (user.role === 'admin') {
        window.location.href = "/src/pages/admin/adminHome/adminHome.html";
    }
    else {
        window.location.href = "/src/pages/store/home/home.html";
    }
}
