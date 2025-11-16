import { getUser, isLoggedIn, logout } from '../../../utils/auth';
import { apiFetch } from '../../../api';
import { navigateToPage } from '../../../utils/navigate';
const statusConfig = {
    pending: { icon: '⏳', text: 'Pendiente', class: 'status-pending' },
    processing: { icon: '👨‍🍳', text: 'En Preparación', class: 'status-processing' },
    completed: { icon: '✅', text: 'Entregado', class: 'status-completed' },
    cancelled: { icon: '❌', text: 'Cancelado', class: 'status-cancelled' }
};
const statusMessages = {
    pending: 'Tu pedido ha sido recibido y está siendo procesado. Te notificaremos cuando esté listo.',
    processing: 'Tu pedido está siendo preparado con mucho cuidado. Pronto estará listo para entrega.',
    completed: '¡Tu pedido ha sido entregado exitosamente! Esperamos que lo hayas disfrutado.',
    cancelled: 'Este pedido ha sido cancelado. Si tienes preguntas, contáctanos.'
};
document.addEventListener('DOMContentLoaded', async () => {
    const user = getUser();
    if (!user || !isLoggedIn()) {
        navigateToPage('/src/pages/auth/login/login.html');
        return;
    }
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement && user.name) {
        userInfoElement.textContent = `👋 Hola, ${user.name}`;
    }
    setupEventListeners();
    await loadOrders();
});
function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
            navigateToPage('/src/pages/auth/login/login.html');
        });
    }
    const closeModal = document.getElementById('closeModal');
    const modalOverlay = document.getElementById('orderDetailModal');
    if (closeModal && modalOverlay) {
        closeModal.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.style.display = 'none';
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });
}
async function loadOrders() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const ordersContainer = document.getElementById('ordersContainer');
    try {
        if (loadingState)
            loadingState.style.display = 'block';
        if (emptyState)
            emptyState.style.display = 'none';
        if (ordersContainer)
            ordersContainer.style.display = 'none';
        const user = getUser();
        console.log('👤 Usuario en orders:', user);
        if (!user?.id) {
            throw new Error('Usuario no encontrado');
        }
        console.log(`🔍 Consultando pedidos para usuario ID: ${user.id}`);
        const orders = await apiFetch(`/pedidos/usuario/${user.id}`);
        console.log('📦 Pedidos recibidos:', orders);
        if (loadingState)
            loadingState.style.display = 'none';
        if (!orders || orders.length === 0) {
            if (emptyState)
                emptyState.style.display = 'block';
            return;
        }
        displayOrders(orders);
        if (ordersContainer)
            ordersContainer.style.display = 'block';
        const ordersCount = document.getElementById('ordersCount');
        if (ordersCount) {
            ordersCount.textContent = `${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'}`;
        }
    }
    catch (error) {
        console.error('Error loading orders:', error);
        if (loadingState)
            loadingState.style.display = 'none';
        if (emptyState)
            emptyState.style.display = 'block';
    }
}
function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList)
        return;
    const sortedOrders = orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    ordersList.innerHTML = sortedOrders.map(order => createOrderCard(order)).join('');
    sortedOrders.forEach(order => {
        const orderCard = document.getElementById(`order-${order.id}`);
        if (orderCard) {
            orderCard.addEventListener('click', () => showOrderDetail(order));
        }
    });
}
function createOrderCard(order) {
    const statusInfo = statusConfig[order.statusValue];
    const orderDate = new Date(order.orderDate);
    const formattedDate = orderDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const previewProducts = order.orderItems.slice(0, 3);
    const remainingCount = Math.max(0, order.orderItems.length - 3);
    return `
        <div class="order-card" id="order-${order.id}">
            <div class="order-header">
                <div>
                    <div class="order-number">Pedido #${order.id}</div>
                    <div class="order-date">${formattedDate}</div>
                </div>
                <div class="status-badge ${statusInfo.class}">
                    ${statusInfo.icon} ${statusInfo.text}
                </div>
            </div>
            
            <div class="order-summary">
                <div class="products-preview">
                    ${previewProducts.map(item => `<span class="product-tag">${item.productName} x${item.quantity}</span>`).join('')}
                    ${remainingCount > 0 ?
        `<span class="product-tag more-products">+${remainingCount} más</span>` : ''}
                </div>
            </div>
            
            <div class="order-total">
                <span class="total-label">Total del pedido:</span>
                <span class="total-amount">$${order.totalAmount.toFixed(2)}</span>
            </div>
        </div>
    `;
}
function showOrderDetail(order) {
    const modal = document.getElementById('orderDetailModal');
    const content = document.getElementById('orderDetailContent');
    if (!modal || !content)
        return;
    content.innerHTML = createOrderDetailHTML(order);
    modal.style.display = 'flex';
}
function createOrderDetailHTML(order) {
    const statusInfo = statusConfig[order.statusValue];
    const orderDate = new Date(order.orderDate);
    const formattedDate = orderDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const formattedTime = orderDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const subtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 500;
    const total = order.totalAmount;
    return `
        <div class="order-detail">
            <div class="detail-header">
                <div class="detail-status">
                    <span class="status-icon">${statusInfo.icon}</span>
                    <span class="status-text ${statusInfo.class}">${statusInfo.text}</span>
                </div>
                <h3>Pedido #${order.id}</h3>
            </div>

            <div class="order-info-grid">
                <div class="info-section">
                    <h3>📅 Información del Pedido</h3>
                    <div class="info-item">
                        <span class="info-label">Fecha:</span>
                        <span class="info-value">${formattedDate}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Hora:</span>
                        <span class="info-value">${formattedTime}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Estado:</span>
                        <span class="info-value">${statusInfo.text}</span>
                    </div>
                </div>

                <div class="info-section">
                    <h3>🚚 Información de Entrega</h3>
                    <div class="info-item">
                        <span class="info-label">Dirección:</span>
                        <span class="info-value">${order.shippingAddress}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Teléfono:</span>
                        <span class="info-value">${order.phone}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Pago:</span>
                        <span class="info-value">${order.paymentMethod}</span>
                    </div>
                </div>
            </div>

            <div class="products-detail">
                <h3>🛒 Productos Pedidos</h3>
                ${order.orderItems.map(item => `
                    <div class="product-item">
                        <div class="product-info">
                            <div class="product-name">${item.productName}</div>
                            <div class="product-quantity">Cantidad: ${item.quantity}</div>
                        </div>
                        <div class="product-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>

            <div class="cost-breakdown">
                <h3>💰 Desglose de Costos</h3>
                <div class="cost-item">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="cost-item">
                    <span>Envío:</span>
                    <span>$${shipping.toFixed(2)}</span>
                </div>
                ${order.notes ? `
                    <div class="cost-item">
                        <span>Notas:</span>
                        <span>${order.notes}</span>
                    </div>
                ` : ''}
                <div class="cost-item total">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            </div>

            <div class="status-message ${order.statusValue}">
                <p>${statusMessages[order.statusValue]}</p>
            </div>
        </div>
    `;
}
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        cartCount.textContent = totalItems.toString();
    }
}
updateCartCount();
window.addEventListener('cartUpdated', updateCartCount);
