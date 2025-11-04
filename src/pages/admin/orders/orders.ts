import { apiFetch } from "../../../api";
import { getUser } from "../../../utils/auth";

const container = document.getElementById("ordersContainer")!;
const modal = document.getElementById("orderModal")!;
const detailsBox = document.getElementById("orderDetails")!;
const closeModal = document.getElementById("closeModal")!;

// Colores y emojis por estado
const STATES: Record<string, { label: string; emoji: string; color: string }> = {
  pending: { label: "Pendiente", emoji: "⏳", color: "#f1c40f" },
  processing: { label: "En preparación", emoji: "👨‍🍳", color: "#3498db" },
  completed: { label: "Entregado", emoji: "✅", color: "#2ecc71" },
  cancelled: { label: "Cancelado", emoji: "❌", color: "#e74c3c" },
};

async function loadOrders() {
  const user = getUser();
  if (!user) {
    window.location.href = "/src/pages/auth/login/login.html";
    return;
  }

  try {
    const orders = await apiFetch(`/orders/user/${user.id}`);
    if (!orders.length) {
      container.innerHTML = `<p>No tenés pedidos todavía.</p>`;
      return;
    }

    container.innerHTML = orders
      .map((o: any) => renderOrderCard(o))
      .join("");
  } catch (err) {
    container.innerHTML = `<p>Error al cargar pedidos.</p>`;
  }
}

function renderOrderCard(order: any) {
  const state = STATES[order.status] || { label: order.status, emoji: "❔", color: "#bdc3c7" };
  const products = order.items.slice(0, 3).map((i: any) => i.productName).join(", ");
  const remaining = order.items.length > 3 ? `+${order.items.length - 3} más` : "";

  return `
    <div class="order-card" data-id="${order.id}">
      <div class="order-header">
        <strong>Pedido #${order.id}</strong>
        <span class="badge" style="background:${state.color}">${state.emoji} ${state.label}</span>
      </div>
      <div class="order-body">
        <p><b>Fecha:</b> ${new Date(order.date).toLocaleString()}</p>
        <p><b>Productos:</b> ${products} ${remaining}</p>
        <p><b>Total:</b> $${order.total.toFixed(2)}</p>
      </div>
    </div>
  `;
}

container.addEventListener("click", (e) => {
  const card = (e.target as HTMLElement).closest(".order-card") as HTMLElement | null;
  if (card) showOrderDetail(card.dataset.id!);
});

closeModal.addEventListener("click", () => modal.classList.add("hidden"));

async function showOrderDetail(id: string) {
  const order = await apiFetch(`/orders/${id}`);
  const state = STATES[order.status] || { label: order.status, emoji: "❔", color: "#bdc3c7" };

  detailsBox.innerHTML = `
    <h2>Pedido #${order.id}</h2>
    <p><span style="color:${state.color}">${state.emoji} ${state.label}</span></p>
    <p><b>Entrega:</b> ${order.deliveryInfo || "Retiro en local"}</p>
    <h3>Productos</h3>
    <ul>${order.items.map((i: any) => `<li>${i.productName} x${i.quantity} - $${i.price}</li>`).join("")}</ul>
    <h3>Totales</h3>
    <p>Subtotal: $${order.subtotal}</p>
    <p>Envío: $${order.shipping}</p>
    <p><b>Total: $${order.total}</b></p>
    <p>${state.label === "Pendiente" ? "Tu pedido está siendo procesado." : ""}</p>
  `;

  modal.classList.remove("hidden");
}

loadOrders();
