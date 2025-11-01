import { getCartItems, updateQuantity, removeFromCart, getCartTotal } from "../../../utils/cart";
import { logout } from "../../../utils/auth";

const cartItemsContainer = document.getElementById("cart-items") as HTMLElement;
const subtotalElement = document.getElementById("subtotal") as HTMLElement;
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
    const total = getCartTotal();

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
            .map(
                (item) => `
                <div class="cart-item">
                    <img src="${item.imagen || "https://via.placeholder.com/100x75"}" alt="${
                    item.nombre
                }">
                    <div class="item-details">
                        <h3>${item.nombre}</h3>
                        <p class="item-price">$${item.precio}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="window.updateItemQuantity(${
                            item.id
                        }, ${item.cantidad - 1})">-</button>
                        <span>${item.cantidad}</span>
                        <button class="quantity-btn" onclick="window.updateItemQuantity(${
                            item.id
                        }, ${item.cantidad + 1})">+</button>
                        <button class="remove-btn" onclick="window.removeItem(${
                            item.id
                        })">🗑️</button>
                    </div>
                </div>
            `
            )
            .join("");
        checkoutBtn.disabled = false;
    }

    subtotalElement.textContent = `$${total}`;
    totalElement.textContent = `$${total}`;
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