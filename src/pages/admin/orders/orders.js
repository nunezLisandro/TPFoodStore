import { apiFetch } from "../../../api";
import { requireAdmin } from "../../../utils/auth";
try {
    const user = requireAdmin();
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        userInfo.textContent = `👋 ${user.name}`;
    }
}
catch (error) {
    console.error('Acceso denegado:', error);
}
const container = document.getElementById("ordersContainer");
const modal = document.getElementById("orderModal");
const detailsBox = document.getElementById("orderDetails");
const closeModal = document.getElementById("closeModal");
const STATES = {
    pending: { label: "Pendiente", emoji: "⏳", color: "#f1c40f" },
    processing: { label: "En preparación", emoji: "👨‍🍳", color: "#3498db" },
    completed: { label: "Entregado", emoji: "✅", color: "#2ecc71" },
    cancelled: { label: "Cancelado", emoji: "❌", color: "#e74c3c" },
};
// Función para reproducir sonidos de notificación
function playNotificationSound(type) {
    // Crear contexto de audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const playTone = (frequency, duration, delay = 0) => {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        }, delay);
    };
    // Diferentes sonidos según el tipo
    switch (type) {
        case 'success':
            // Sonido de éxito (do-mi-sol)
            playTone(523.25, 0.15, 0); // Do
            playTone(659.25, 0.15, 100); // Mi
            playTone(783.99, 0.25, 200); // Sol
            break;
        case 'cancelled':
            // Sonido especial para cancelación con restauración de stock (fa-re-la)
            playTone(349.23, 0.2, 0); // Fa
            playTone(293.66, 0.15, 150); // Re
            playTone(440.00, 0.25, 250); // La (sonido de "restauración")
            break;
        case 'error':
            // Sonido de error (dos tonos bajos)
            playTone(220, 0.2, 0);
            playTone(196, 0.3, 150);
            break;
        case 'info':
            // Sonido informativo (un tono suave)
            playTone(440, 0.2, 0);
            break;
    }
}
// Función para mostrar notificación visual temporal
function showTemporaryNotification(message, type) {
    // Eliminar notificación existente si hay una
    const existingNotification = document.querySelector('.temp-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `temp-notification ${type}`;
    notification.textContent = message;
    // Estilos CSS inline
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-weight: 500;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    max-width: 300px;
  `;
    document.body.appendChild(notification);
    // Animación de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
async function loadOrders() {
    try {
        console.log('Admin: Cargando pedidos...');
        const orders = await apiFetch(`/pedidos`);
        console.log('Admin: Pedidos recibidos:', orders);
        if (!orders || orders.length === 0) {
            container.innerHTML = `<p>No hay pedidos todavía.</p>`;
            return;
        }
        const sortedOrders = orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        container.innerHTML = sortedOrders
            .map((o) => renderOrderCard(o))
            .join("");
        // Sonido sutil cuando se cargan los pedidos
        playNotificationSound('info');
    }
    catch (err) {
        console.error('Admin: Error cargando pedidos:', err);
        container.innerHTML = `<p>Error al cargar pedidos: ${err}</p>`;
        playNotificationSound('error');
        showTemporaryNotification('❌ Error al cargar los pedidos', 'error');
    }
}
function renderOrderCard(order) {
    const state = STATES[order.statusValue] || { label: order.statusValue, emoji: "❔", color: "#bdc3c7" };
    const products = order.orderItems.slice(0, 3).map((i) => i.productName).join(", ");
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
    const card = e.target.closest(".order-card");
    if (card)
        showOrderDetail(card.dataset.id);
});
closeModal.addEventListener("click", () => modal.classList.add("hidden"));
async function showOrderDetail(id) {
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
    <ul>${order.orderItems.map((i) => `<li>${i.productName} x${i.quantity} - $${i.price.toFixed(2)}</li>`).join("")}</ul>
    <h3>Total</h3>
    <p><b>Total: $${order.totalAmount.toFixed(2)}</b></p>
    ${order.notes ? `<p><b>Notas:</b> ${order.notes}</p>` : ''}
  `;
    modal.classList.remove("hidden");
}
// Función para cambiar el estado de un pedido (desde las tarjetas)
async function changeOrderStatus(orderId, currentStatus) {
    const statusOptions = Object.keys(STATES);
    const currentIndex = statusOptions.indexOf(currentStatus);
    let newStatus = currentStatus;
    // Mostrar menú de selección
    const statusSelect = prompt(`Estado actual: ${STATES[currentStatus].label}\n\nSelecciona nuevo estado:\n` +
        `1 - ${STATES.pending.label}\n` +
        `2 - ${STATES.processing.label}\n` +
        `3 - ${STATES.completed.label}\n` +
        `4 - ${STATES.cancelled.label}\n\n` +
        `Ingresa el número (1-4):`, String(currentIndex + 1));
    if (!statusSelect || statusSelect === String(currentIndex + 1)) {
        return; // Cancelado o mismo estado
    }
    const statusIndex = parseInt(statusSelect) - 1;
    if (statusIndex >= 0 && statusIndex < statusOptions.length) {
        newStatus = statusOptions[statusIndex];
    }
    else {
        playNotificationSound('error');
        showTemporaryNotification('❌ Opción inválida', 'error');
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
        // Sonido especial para pedidos cancelados
        if (newStatus === 'cancelled') {
            playNotificationSound('cancelled');
            showTemporaryNotification(`🔄 Pedido #${orderId} cancelado y stock restaurado automáticamente`, 'success');
        }
        else {
            playNotificationSound('success');
            showTemporaryNotification(`✅ Estado del pedido #${orderId} actualizado a: ${STATES[newStatus].label}`, 'success');
        }
        await loadOrders();
    }
    catch (error) {
        console.error('Error actualizando estado:', error);
        playNotificationSound('error');
        showTemporaryNotification('❌ Error al actualizar el estado del pedido', 'error');
    }
}
// Función para actualizar el estado desde el modal de detalles
async function updateOrderStatus(orderId) {
    const selectElement = document.getElementById(`statusSelect-${orderId}`);
    const newStatus = selectElement.value;
    try {
        await apiFetch(`/pedidos/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });
        // Sonido especial para pedidos cancelados
        if (newStatus === 'cancelled') {
            playNotificationSound('cancelled');
            showTemporaryNotification(`🔄 Pedido #${orderId} cancelado y stock restaurado automáticamente`, 'success');
        }
        else {
            playNotificationSound('success');
            showTemporaryNotification(`✅ Estado del pedido #${orderId} actualizado a: ${STATES[newStatus].label}`, 'success');
        }
        modal.classList.add("hidden");
        await loadOrders();
    }
    catch (error) {
        console.error('Error actualizando estado:', error);
        playNotificationSound('error');
        showTemporaryNotification('❌ Error al actualizar el estado del pedido', 'error');
    }
}
// Hacer las funciones globales para que puedan ser llamadas desde el HTML
window.changeOrderStatus = changeOrderStatus;
window.updateOrderStatus = updateOrderStatus;
loadOrders();
