const CART_STORAGE_KEY = 'foodstore_cart';
const SHIPPING_COST = 500;
// Obtener carrito del localStorage
export function getCart() {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (cartData) {
        return JSON.parse(cartData);
    }
    return { items: [], total: 0 };
}
// Guardar carrito en localStorage
export function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}
// Calcular total del carrito
export function calculateCartTotal(items) {
    return items.reduce((total, item) => total + (item.product.precio * item.quantity), 0);
}
// Agregar producto al carrito
export function addToCart(product, quantity = 1) {
    const cart = getCart();
    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(item => item.product.id === product.id);
    if (existingItemIndex >= 0) {
        // Si ya existe, aumentar cantidad
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity <= product.stock) {
            cart.items[existingItemIndex].quantity = newQuantity;
        }
        else {
            return false; // No hay suficiente stock
        }
    }
    else {
        // Si no existe, agregar nuevo item
        if (quantity <= product.stock) {
            cart.items.push({
                product,
                quantity
            });
        }
        else {
            return false; // No hay suficiente stock
        }
    }
    cart.total = calculateCartTotal(cart.items);
    saveCart(cart);
    return true;
}
// Remover producto del carrito
export function removeFromCart(productId) {
    const cart = getCart();
    cart.items = cart.items.filter(item => item.product.id !== productId);
    cart.total = calculateCartTotal(cart.items);
    saveCart(cart);
}
// Actualizar cantidad de un producto en el carrito
export function updateCartItemQuantity(productId, quantity) {
    const cart = getCart();
    const itemIndex = cart.items.findIndex(item => item.product.id === productId);
    if (itemIndex >= 0) {
        if (quantity <= 0) {
            // Si la cantidad es 0 o menos, remover el item
            cart.items.splice(itemIndex, 1);
        }
        else if (quantity <= cart.items[itemIndex].product.stock) {
            // Actualizar cantidad si hay stock suficiente
            cart.items[itemIndex].quantity = quantity;
        }
        else {
            return false; // No hay suficiente stock
        }
        cart.total = calculateCartTotal(cart.items);
        saveCart(cart);
        return true;
    }
    return false;
}
// Obtener cantidad de items en el carrito
export function getCartItemCount() {
    const cart = getCart();
    return cart.items.reduce((count, item) => count + item.quantity, 0);
}
// Vaciar carrito
export function clearCart() {
    const emptyCart = { items: [], total: 0 };
    saveCart(emptyCart);
}
// Obtener total con envío
export function getCartTotalWithShipping() {
    const cart = getCart();
    return cart.total + SHIPPING_COST;
}
// Obtener costo de envío
export function getShippingCost() {
    return SHIPPING_COST;
}
// Funciones de compatibilidad para las páginas existentes
export function getCartItems() {
    return getCart().items;
}
export function getCartTotal() {
    const cart = getCart();
    return cart.total;
}
export function updateQuantity(productId, quantity) {
    return updateCartItemQuantity(productId, quantity);
}
