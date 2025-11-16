export function navigateToPage(path) {
    window.location.href = path;
}
export function navigateTo(path) {
    window.location.href = path;
}
export function navigateToLogin() {
    navigateToPage('/src/pages/auth/login/login.html');
}
export function navigateToRegister() {
    navigateToPage('/src/pages/auth/register/register.html');
}
export function navigateToHome() {
    navigateToPage('/src/pages/store/home/home.html');
}
export function navigateToAdminHome() {
    navigateToPage('/src/pages/admin/adminHome/adminHome.html');
}
export function navigateToCart() {
    navigateToPage('/src/pages/store/cart/cart.html');
}
export function navigateToProductDetail(productId) {
    navigateToPage(`/src/pages/store/productDetail/productDetail.html?id=${productId}`);
}
export function navigateToOrders() {
    navigateToPage('/src/pages/client/orders/orders.html');
}
export function navigateToAdminCategories() {
    navigateToPage('/src/pages/admin/categories/categories.html');
}
export function navigateToAdminProducts() {
    navigateToPage('/src/pages/admin/products/products.html');
}
export function navigateToAdminOrders() {
    navigateToPage('/src/pages/admin/orders/orders.html');
}
// Función para obtener parámetros de la URL
export function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
