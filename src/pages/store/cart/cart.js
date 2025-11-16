import { getCartItems, updateQuantity, removeFromCart } from "../../../utils/cart";
import { logout } from "../../../utils/auth";
const cartItemsContainer = document.getElementById("cart-items");
const subtotalElement = document.getElementById("subtotal");
const shippingElement = document.getElementById("shipping");
const totalElement = document.getElementById("total");
const checkoutBtn = document.getElementById("checkout-btn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const userData = localStorage.getItem("user");
if (!userData) {
    window.location.href = "/src/pages/auth/login/login.html";
}
else {
    const user = JSON.parse(userData);
    if (userInfo)
        userInfo.textContent = `👋 Hola, ${user.name || "usuario"}`;
}
function renderCart() {
    const items = getCartItems();
    // Calcular subtotal
    const subtotal = items.reduce((sum, item) => {
        const precio = typeof item.product.precio === 'string' ?
            parseFloat(item.product.precio) : item.product.precio || 0;
        const quantity = item.quantity || 0;
        return sum + (precio * quantity);
    }, 0);
    // Calcular envío (gratis si el carrito está vacío)
    const shipping = items.length > 0 ? 500 : 0;
    // Calcular total
    const total = subtotal + shipping;
    if (items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Tu carrito está vacío</h3>
                <p>¿Por qué no agregas algunos productos?</p>
                <a href="/src/pages/store/home/home.html" class="back-btn">Volver a la tienda</a>
            </div>
        `;
        checkoutBtn.disabled = true;
    }
    else {
        cartItemsContainer.innerHTML = items
            .map((item) => {
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
window.updateItemQuantity = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
    renderCart();
};
window.removeItem = (productId) => {
    removeFromCart(productId);
    renderCart();
};
checkoutBtn.addEventListener("click", () => {
    const items = getCartItems();
    if (items.length === 0)
        return;
    window.location.href = "/src/pages/store/checkout/checkout.html";
});
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        logout();
    });
}
renderCart();
