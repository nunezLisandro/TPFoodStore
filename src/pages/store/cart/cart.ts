import { getCartItems, updateQuantity, removeFromCart, getCartTotal } from "../../../utils/cart";
import { logout } from "../../../utils/auth";

const cartItemsContainer = document.getElementById("cart-items") as HTMLElement;
const subtotalElement = document.getElementById("subtotal") as HTMLElement;
const shippingElement = document.getElementById("shipping") as HTMLElement;
const totalElement = document.getElementById("total") as HTMLElement;
const checkoutBtn = document.getElementById("checkout-btn") as HTMLButtonElement;
const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement;
const userInfo = document.getElementById("userInfo") as HTMLElement;


const userData = localStorage.getItem("user");
if (!userData) {
    window.location.href = "/src/pages/auth/login/login.html";
} else {
    const user = JSON.parse(userData);
    if (userInfo) userInfo.textContent = `👋 Hola, ${user.name || "usuario"}`;
}


function renderCart() {
    const items = getCartItems();
    
    console.log('Cart items:', items); // Debug: ver estructura de items
    console.log('Raw localStorage cart:', localStorage.getItem('foodstore_cart')); // Debug: ver datos en localStorage
    
    // Calcular subtotal
    const subtotal = items.reduce((sum, item) => {
        console.log('Processing item for subtotal:', item); // Debug: ver cada item
        const precio = typeof item.product.precio === 'string' ? 
            parseFloat(item.product.precio) : item.product.precio || 0;
        const quantity = item.quantity || 0;
        console.log('Precio:', precio, 'Quantity:', quantity); // Debug
        return sum + (precio * quantity);
    }, 0);
    
    // Calcular envío (gratis si el carrito está vacío)
    const shipping = items.length > 0 ? 500 : 0;
    
    // Calcular total
    const total = subtotal + shipping;

    console.log('Subtotal:', subtotal, 'Shipping:', shipping, 'Total:', total); // Debug

    if (items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Tu carrito está vacío</h3>
                <p>¿Por qué no agregas algunos productos?</p>
                <a href="/src/pages/store/home/home.html" class="back-btn">Volver a la tienda</a>
            </div>
        `;
        checkoutBtn.disabled = true;
    } else {
        cartItemsContainer.innerHTML = items
            .map((item) => {
                console.log('Rendering item:', item); // Debug: ver cada item
                return `
                <div class="cart-item">
                    <img src="${item.product.imagen || "https://via.placeholder.com/100x75"}" alt="${item.product.nombre}">
                    <div class="item-details">
                        <h3>${item.product.nombre}</h3>
                        <p class="item-price">$${item.product.precio}</p>
                        <p class="item-subtotal">Subtotal: $${item.product.precio * item.quantity}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="window.updateItemQuantity(${item.product.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="window.updateItemQuantity(${item.product.id}, ${item.quantity + 1})">+</button>
                        <button class="remove-btn" onclick="window.removeItem(${item.product.id})" title="Eliminar producto">🗑️</button>
                    </div>
                </div>
            `;
            })
            .join("");
        checkoutBtn.disabled = false;
    }

    // Actualizar valores en el DOM
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    shippingElement.textContent = `$${shipping}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

(window as any).updateItemQuantity = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
    renderCart();
};

(window as any).removeItem = (productId: number) => {
    removeFromCart(productId);
    renderCart();
};


checkoutBtn.addEventListener("click", () => {
    const items = getCartItems();
    if (items.length === 0) return;
    window.location.href = "/src/pages/store/checkout/checkout.html";
});


if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        logout();
    });
}


renderCart();