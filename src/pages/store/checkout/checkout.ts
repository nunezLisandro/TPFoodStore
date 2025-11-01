import { apiFetch } from "../../../api";
import { getCartItems, getCartTotal, clearCart } from "../../../utils/cart";
import { getUser } from "../../../utils/auth";

// Elementos del DOM
const checkoutForm = document.getElementById("checkoutForm") as HTMLFormElement;
const orderItemsContainer = document.getElementById("orderItems") as HTMLElement;
const subtotalElement = document.getElementById("subtotal") as HTMLElement;
const totalElement = document.getElementById("total") as HTMLElement;
const loadingOverlay = document.getElementById("loadingOverlay") as HTMLElement;
const userInfo = document.getElementById("userInfo") as HTMLElement;

// Constantes
const SHIPPING_COST = 200; // Costo fijo de envío

// --- Verificar sesión ---
const userData = localStorage.getItem("user");
if (!userData) {
    window.location.href = "/src/pages/auth/login/login.html";
} else {
    const user = JSON.parse(userData);
    if (userInfo) userInfo.textContent = `👋 Hola, ${user.name || "usuario"}`;
}

// --- Cargar resumen del pedido ---
function loadOrderSummary() {
    const items = getCartItems();
    const subtotal = getCartTotal();
    const total = subtotal + SHIPPING_COST;

    if (items.length === 0) {
        window.location.href = "/src/pages/store/cart/cart.html";
        return;
    }

    // Mostrar items
    orderItemsContainer.innerHTML = items
        .map(
            (item) => `
            <div class="order-item">
                <span class="item-quantity">x${item.cantidad}</span>
                <span class="item-name">${item.nombre}</span>
                <span class="item-price">$${item.precio * item.cantidad}</span>
            </div>
        `
        )
        .join("");

    // Actualizar totales
    subtotalElement.textContent = `$${subtotal}`;
    totalElement.textContent = `$${total}`;
}

// --- Manejar envío del formulario ---
checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(checkoutForm);
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const notes = formData.get("notes") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    
    const items = getCartItems();
    const total = getCartTotal() + SHIPPING_COST;
    const user = getUser();

    try {
        loadingOverlay.classList.add("visible");

        const order = await apiFetch("/pedidos", {
            method: "POST",
            body: JSON.stringify({
                userId: user.id,
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.cantidad,
                    price: item.precio
                })),
                shippingAddress: address,
                phone,
                notes,
                paymentMethod,
                total,
                status: "pending"
            }),
        });

        if (order && order.id) {
            // Limpiar carrito
            clearCart();
            
            // Guardar ID del pedido y redirigir a confirmación
            localStorage.setItem("lastOrderId", order.id);
            window.location.href = "/src/pages/store/confirmation/confirmation.html";
        } else {
            throw new Error("Error al crear el pedido");
        }
    } catch (error: any) {
        alert(error?.message || "Error al procesar el pedido");
    } finally {
        loadingOverlay.classList.remove("visible");
    }
});

// --- Inicialización ---
loadOrderSummary();