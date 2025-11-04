import { apiFetch } from "../../../api";
import { getCartItems, getCartTotal, clearCart } from "../../../utils/cart";
import { getUser } from "../../../utils/auth";

const checkoutForm = document.getElementById("checkoutForm") as HTMLFormElement;
const orderItemsContainer = document.getElementById("orderItems") as HTMLElement;
const subtotalElement = document.getElementById("subtotal") as HTMLElement;
const totalElement = document.getElementById("total") as HTMLElement;
const loadingOverlay = document.getElementById("loadingOverlay") as HTMLElement;
const userInfo = document.getElementById("userInfo") as HTMLElement;

const SHIPPING_COST = 500;

const userData = localStorage.getItem("user");
if (!userData) {
    window.location.href = "/src/pages/auth/login/login.html";
} else {
    const user = JSON.parse(userData);
    if (userInfo) userInfo.textContent = `👋 Hola, ${user.name || "usuario"}`;
}

function loadOrderSummary() {
    const items = getCartItems();
    const subtotal = getCartTotal();
    const total = subtotal + SHIPPING_COST;

    if (items.length === 0) {
        window.location.href = "/src/pages/store/cart/cart.html";
        return;
    }

    orderItemsContainer.innerHTML = items
        .map(
            (item) => `
            <div class="order-item">
                <span class="item-quantity">x${item.quantity}</span>
                <span class="item-name">${item.product.nombre}</span>
                <span class="item-price">$${item.product.precio * item.quantity}</span>
            </div>
        `
        )
        .join("");

    subtotalElement.textContent = `$${subtotal}`;
    totalElement.textContent = `$${total}`;
}

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

    if (!user) {
        alert("Error: Usuario no encontrado");
        return;
    }

    try {
        loadingOverlay.classList.add("visible");

        const order = await apiFetch("/pedidos", {
            method: "POST",
            body: JSON.stringify({
                userId: user.id,
                items: items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.precio
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
            clearCart();
            
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

loadOrderSummary();