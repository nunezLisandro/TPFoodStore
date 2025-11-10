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

function showPurchaseSuccess(callback: () => void) {
    // Crear overlay de éxito
    const successOverlay = document.createElement('div');
    successOverlay.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        ">
            <div style="
                background: white;
                padding: 3rem;
                border-radius: 20px;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideUp 0.5s ease-out;
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    animation: checkmarkPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both;
                ">
                    <span style="color: white; font-size: 2.5rem; font-weight: bold;">✓</span>
                </div>
                <h2 style="
                    color: #4CAF50;
                    margin-bottom: 1rem;
                    font-size: 2rem;
                    font-weight: 700;
                ">¡Compra Realizada!</h2>
                <p style="
                    color: #666;
                    margin-bottom: 2rem;
                    font-size: 1.1rem;
                    line-height: 1.5;
                ">Tu pedido ha sido procesado correctamente.<br>Redirigiendo al inicio...</p>
                <div style="
                    width: 100%;
                    height: 4px;
                    background: #f0f0f0;
                    border-radius: 2px;
                    overflow: hidden;
                ">
                    <div style="
                        width: 0%;
                        height: 100%;
                        background: linear-gradient(90deg, #4CAF50, #45a049);
                        animation: progressBar 2s ease-out;
                    "></div>
                </div>
            </div>
        </div>
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes checkmarkPop {
                0% { transform: scale(0); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            @keyframes progressBar {
                from { width: 0%; }
                to { width: 100%; }
            }
        </style>
    `;
    
    document.body.appendChild(successOverlay);
    
    // Redirigir después de 2.5 segundos
    setTimeout(() => {
        callback();
    }, 2500);
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

        // Validar que todos los items tienen IDs válidos
        for (const item of items) {
            console.log(`🔍 Validando item:`, item);
            if (!item.product.id || item.product.id === null || item.product.id === undefined) {
                throw new Error(`Error: Producto sin ID válido - ${item.product.nombre}`);
            }
            if (!item.quantity || item.quantity <= 0) {
                throw new Error(`Error: Cantidad inválida para ${item.product.nombre}: ${item.quantity}`);
            }
            if (!item.product.precio || item.product.precio <= 0) {
                throw new Error(`Error: Precio inválido para ${item.product.nombre}: ${item.product.precio}`);
            }
        }

        // Validar que el usuario tiene ID válido
        if (!user.id || user.id === null || user.id === undefined) {
            throw new Error("Error: Usuario sin ID válido");
        }

        // Verificar que el backend esté disponible
        try {
            await apiFetch("/productos");
            console.log('✅ Backend disponible');
        } catch (testError) {
            console.error('❌ Backend no disponible:', testError);
            throw new Error("El servidor no está disponible. Por favor, asegúrate de que el backend esté ejecutándose en el puerto 8081.");
        }

        // Debug: Mostrar información del usuario
        console.log('👤 Usuario actual:', user);
        console.log('🛒 Items del carrito:', items);
        console.log('💰 Total:', total);

        // Preparar datos del pedido
        const pedidoData = {
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
        };

        console.log('📤 Enviando pedido:', pedidoData);

        // Primero crear el pedido en la base de datos
        let order;
        try {
            order = await apiFetch("/pedidos", {
                method: "POST",
                body: JSON.stringify(pedidoData),
            });
            console.log('✅ Pedido creado exitosamente:', order);
        } catch (createError: any) {
            console.error('❌ Error al crear pedido:', createError);
            throw new Error(`Error al crear el pedido: ${createError?.message || createError}`);
        }

        if (!order || !order.id) {
            throw new Error("Error al crear el pedido en la base de datos: respuesta inválida");
        }

        // Luego reducir el stock de cada producto
        for (const item of items) {
            try {
                console.log(`Reduciendo stock del producto ${item.product.id} en ${item.quantity} unidades`);
                await apiFetch(`/productos/${item.product.id}/reduce-stock`, {
                    method: "PUT",
                    body: JSON.stringify({ cantidad: item.quantity }),
                });
            } catch (stockError) {
                console.error(`Error al reducir stock del producto ${item.product.id}:`, stockError);
                // Si falla la reducción de stock, podríamos revertir el pedido
                // Por ahora solo mostramos el error
                console.warn(`Stock no pudo ser reducido para ${item.product.nombre}, pero el pedido fue creado`);
            }
        }

        console.log(`Pedido ${order.id} creado exitosamente`);
        
        // Mostrar mensaje de compra realizada
        showPurchaseSuccess(() => {
            clearCart();
            window.location.href = "/src/pages/store/home/home.html";
        });

    } catch (error: any) {
        console.error('Error en checkout:', error);
        let errorMessage = "Error al procesar el pedido";
        
        if (error?.message) {
            if (error.message.includes("Not Found") || error.message.includes("404")) {
                errorMessage = "Servicio no disponible. Por favor, verifica que el servidor esté funcionando.";
            } else if (error.message.includes("Network") || error.message.includes("fetch")) {
                errorMessage = "Error de conexión. Por favor, verifica tu conexión a internet.";
            } else {
                errorMessage = error.message;
            }
        }
        
        alert(errorMessage);
    } finally {
        loadingOverlay.classList.remove("visible");
    }
});

loadOrderSummary();