import { getUser, isLoggedIn } from '../../../utils/auth';
import { navigateToPage, navigateToHome } from '../../../utils/navigate';

interface OrderItem {
    productId: number;
    productName: string;
    precio: number;
    cantidad: number;
}

interface Order {
    id: number;
    orderItems: OrderItem[];
    totalAmount: number;
    orderDate: string;
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = getUser();
    if (!user || !isLoggedIn()) {
        navigateToPage('/src/pages/auth/login/login.html');
        return;
    }

    try {
        // Generate a simple order ID for display
        const orderId = Date.now().toString().slice(-6);
        
        // Get order data from localStorage (set during checkout)
        const orderDataStr = localStorage.getItem('lastOrder');
        let orderData = null;
        
        if (orderDataStr) {
            orderData = JSON.parse(orderDataStr);
        }
        
        // Update order ID display
        const orderIdElement = document.getElementById('order-id');
        if (orderIdElement) {
            orderIdElement.textContent = `#${orderId}`;
        }
        
        // Display order summary if we have order data
        if (orderData && orderData.items) {
            displayOrderSummary(orderData.items, orderData.total);
        }
        
        // Clear the cart and order data
        localStorage.removeItem('cart');
        localStorage.removeItem('lastOrder');
        
    } catch (error) {
        console.error('Error processing order confirmation:', error);
    }

    // Set up event listeners
    setupEventListeners();
});

function displayOrderSummary(items: any[], total: number) {
    const orderItemsContainer = document.querySelector('.order-items');
    const orderTotalElement = document.querySelector('.order-total .amount');
    
    if (!orderItemsContainer || !orderTotalElement) return;
    
    // Clear existing items
    orderItemsContainer.innerHTML = '';
    
    // Add each item
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="item-details">
                <span class="item-name">${item.nombre || item.productName || 'Producto'}</span>
                <span class="item-quantity">Cantidad: ${item.cantidad || item.quantity || 1}</span>
            </div>
            <div class="item-price">$${(item.precio || item.price || 0).toFixed(2)}</div>
        `;
        orderItemsContainer.appendChild(itemElement);
    });
    
    // Update total
    orderTotalElement.textContent = `$${total.toFixed(2)}`;
}

function setupEventListeners() {
    // Continue shopping button
    const continueBtn = document.getElementById('continue-shopping');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            // Add celebration effect before navigating
            addCelebrationEffect();
            setTimeout(() => {
                navigateToHome();
            }, 1000);
        });
    }
    
    // Order history button
    const orderHistoryBtn = document.getElementById('order-history');
    if (orderHistoryBtn) {
        orderHistoryBtn.addEventListener('click', () => {
            // For now, redirect to home since we don't have an order history page
            navigateToHome();
        });
    }
}

function addCelebrationEffect() {
    // Create confetti or additional celebration effects
    const celebration = document.querySelector('.celebration-message') as HTMLElement;
    if (celebration) {
        celebration.style.animation = 'celebration 0.8s ease-out';
        celebration.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        
        const message = celebration.querySelector('p') as HTMLElement;
        if (message) {
            message.style.color = 'white';
            message.textContent = '¡Redirigiendo al inicio! 🎉';
        }
    }
}