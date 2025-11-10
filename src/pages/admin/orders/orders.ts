import { apiFetch } from "../../../api";
import { requireAdmin } from "../../../utils/auth";

// Verificar que el usuario sea administrador
try {
  const user = requireAdmin();
  const userInfo = document.getElementById('userInfo');
  if (userInfo) {
    userInfo.textContent = `👋 ${user.name}`;
  }
} catch (error) {
  console.error('Acceso denegado:', error);
}

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
  try {
    console.log('Admin: Cargando pedidos...');
    const orders = await apiFetch(`/pedidos`);
    console.log('Admin: Pedidos recibidos:', orders);
    
    if (!orders || orders.length === 0) {
      container.innerHTML = `<p>No hay pedidos todavía.</p>`;
      return;
    }

    // Ordenar pedidos por fecha (más recientes primero)
    const sortedOrders = orders.sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    container.innerHTML = sortedOrders
      .map((o: any) => renderOrderCard(o))
      .join("");
  } catch (err) {
    console.error('Admin: Error cargando pedidos:', err);
    container.innerHTML = `<p>Error al cargar pedidos: ${err}</p>`;
  }
}

function renderOrderCard(order: any) {
  const state = STATES[order.statusValue] || { label: order.statusValue, emoji: "❔", color: "#bdc3c7" };
  const products = order.orderItems.slice(0, 3).map((i: any) => i.productName).join(", ");
  const remaining = order.orderItems.length > 3 ? `+${order.orderItems.length - 3} más` : "";

  return `
    <div class="order-card" data-id="${order.id}">
      <div class="order-header">
        <strong>Pedido #${order.id}</strong>
        <span class="badge" style="background:${state.color}">${state.emoji} ${state.label}</span>
      </div>
      <div class="order-body">
        <p><b>Cliente:</b> ${order.userName || 'Usuario desconocido'}</p>
        <p><b>Fecha:</b> ${new Date(order.orderDate).toLocaleString()}</p>
        <p><b>Productos:</b> ${products} ${remaining}</p>
        <p><b>Total:</b> $${order.totalAmount.toFixed(2)}</p>
        <div class="admin-actions">
          <button class="btn btn-primary" onclick="changeOrderStatus('${order.id}', '${order.statusValue}')">
            🔄 Cambiar Estado
          </button>
        </div>
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
  const order = await apiFetch(`/pedidos/${id}`);
  const state = STATES[order.statusValue] || { label: order.statusValue, emoji: "❔", color: "#bdc3c7" };

  detailsBox.innerHTML = `
    <h2>Pedido #${order.id}</h2>
    <div style="margin-bottom: 20px;">
      <span style="color:${state.color}; font-size: 1.2em;">${state.emoji} ${state.label}</span>
    </div>
    <p><b>Cliente:</b> ${order.userName || 'Usuario desconocido'}</p>
    <p><b>Fecha:</b> ${new Date(order.orderDate).toLocaleString()}</p>
    <p><b>Dirección:</b> ${order.shippingAddress || "No especificada"}</p>
    <p><b>Teléfono:</b> ${order.phone || "No especificado"}</p>
    <p><b>Método de pago:</b> ${order.paymentMethod || "No especificado"}</p>
    
    <h3>Cambiar Estado del Pedido</h3>
    <div class="status-controls" style="margin-bottom: 20px;">
      <select id="statusSelect-${order.id}" style="padding: 8px; margin-right: 10px;">
        <option value="pending" ${order.statusValue === 'pending' ? 'selected' : ''}>⏳ Pendiente</option>
        <option value="processing" ${order.statusValue === 'processing' ? 'selected' : ''}>👨‍🍳 En preparación</option>
        <option value="completed" ${order.statusValue === 'completed' ? 'selected' : ''}>✅ Entregado</option>
        <option value="cancelled" ${order.statusValue === 'cancelled' ? 'selected' : ''}>❌ Cancelado</option>
      </select>
      <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}')">
        💾 Actualizar Estado
      </button>
    </div>

    <h3>Productos</h3>
    <ul>${order.orderItems.map((i: any) => `<li>${i.productName} x${i.quantity} - $${i.price.toFixed(2)}</li>`).join("")}</ul>
    <h3>Total</h3>
    <p><b>Total: $${order.totalAmount.toFixed(2)}</b></p>
    ${order.notes ? `<p><b>Notas:</b> ${order.notes}</p>` : ''}
  `;

  modal.classList.remove("hidden");
}

// Función para cambiar el estado de un pedido (desde las tarjetas)
async function changeOrderStatus(orderId: string, currentStatus: string) {
  const statusOptions = Object.keys(STATES);
  const currentIndex = statusOptions.indexOf(currentStatus);
  let newStatus = currentStatus;
  
  // Mostrar menú de selección
  const statusSelect = prompt(
    `Estado actual: ${STATES[currentStatus].label}\n\nSelecciona nuevo estado:\n` +
    `1 - ${STATES.pending.label}\n` +
    `2 - ${STATES.processing.label}\n` +
    `3 - ${STATES.completed.label}\n` +
    `4 - ${STATES.cancelled.label}\n\n` +
    `Ingresa el número (1-4):`,
    String(currentIndex + 1)
  );

  if (!statusSelect || statusSelect === String(currentIndex + 1)) {
    return; // Cancelado o mismo estado
  }

  const statusIndex = parseInt(statusSelect) - 1;
  if (statusIndex >= 0 && statusIndex < statusOptions.length) {
    newStatus = statusOptions[statusIndex];
  } else {
    alert('Opción inválida');
    return;
  }

  try {
    await apiFetch(`/pedidos/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus })
    });

    alert(`✅ Estado del pedido #${orderId} actualizado a: ${STATES[newStatus].label}`);
    await loadOrders(); // Recargar la lista
  } catch (error) {
    console.error('Error actualizando estado:', error);
    alert('❌ Error al actualizar el estado del pedido');
  }
}

// Función para actualizar el estado desde el modal de detalles
async function updateOrderStatus(orderId: string) {
  const selectElement = document.getElementById(`statusSelect-${orderId}`) as HTMLSelectElement;
  const newStatus = selectElement.value;

  try {
    await apiFetch(`/pedidos/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus })
    });

    alert(`✅ Estado del pedido #${orderId} actualizado a: ${STATES[newStatus].label}`);
    modal.classList.add("hidden"); // Cerrar modal
    await loadOrders(); // Recargar la lista
  } catch (error) {
    console.error('Error actualizando estado:', error);
    alert('❌ Error al actualizar el estado del pedido');
  }
}

// Hacer las funciones globales para que puedan ser llamadas desde el HTML
(window as any).changeOrderStatus = changeOrderStatus;
(window as any).updateOrderStatus = updateOrderStatus;

loadOrders();
