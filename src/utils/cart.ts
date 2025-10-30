interface CartItem {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    imagen?: string;
}

interface Cart {
    items: CartItem[];
    total: number;
}

const CART_KEY = 'cart';

function getCart(): Cart {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return { items: [], total: 0 };
    return JSON.parse(stored);
}

function saveCart(cart: Cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product: any, cantidad: number = 1) {
    const cart = getCart();
    const existing = cart.items.find(item => item.id === product.id);

if (existing) {
    existing.cantidad += cantidad;
} else {
    cart.items.push({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad,
        imagen: product.imagen
    });
    }

cart.total = calculateTotal(cart.items);
saveCart(cart);
return cart;
}

export function removeFromCart(productId: number) {
    const cart = getCart();
    cart.items = cart.items.filter(item => item.id !== productId);
    cart.total = calculateTotal(cart.items);
    saveCart(cart);
    return cart;
}

export function updateQuantity(productId: number, cantidad: number) {
    const cart = getCart();
    const item = cart.items.find(item => item.id === productId);

if (item) {
    item.cantidad = Math.max(0, cantidad);
    if (item.cantidad === 0) {
        return removeFromCart(productId);
    }
}

    cart.total = calculateTotal(cart.items);
    saveCart(cart);
    return cart;
}

export function getCartItems(): CartItem[] {
    return getCart().items;
}

export function getCartTotal(): number {
    return getCart().total;
}

export function clearCart() {
    localStorage.removeItem(CART_KEY);
    return { items: [], total: 0 };
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

export function getCartItemCount(): number {
    const cart = getCart();
    return cart.items.reduce((count, item) => count + item.cantidad, 0);
}