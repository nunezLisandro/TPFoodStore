export function navigateToPage(path: string): void {
  window.location.href = path;
}

export function navigateToLogin(): void {
  navigateToPage('/src/pages/auth/login/login.html');
}

export function navigateToRegister(): void {
  navigateToPage('/src/pages/auth/register/register.html');
}

export function navigateToHome(): void {
  navigateToPage('/src/pages/store/home/home.html');
}

export function navigateToAdminHome(): void {
  navigateToPage('/src/pages/admin/adminHome/adminHome.html');
}

export function navigateToCart(): void {
  navigateToPage('/src/pages/store/cart/cart.html');
}

export function navigateToProductDetail(productId: number): void {
  navigateToPage(`/src/pages/store/productDetail/productDetail.html?id=${productId}`);
}

export function navigateToOrders(): void {
  navigateToPage('/src/pages/client/orders/orders.html');
}

export function navigateToAdminCategories(): void {
  navigateToPage('/src/pages/admin/categories/categories.html');
}

export function navigateToAdminProducts(): void {
  navigateToPage('/src/pages/admin/products/products.html');
}

export function navigateToAdminOrders(): void {
  navigateToPage('/src/pages/admin/orders/orders.html');
}

// Función para obtener parámetros de la URL
export function getUrlParameter(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}