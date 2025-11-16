import { apiFetch } from "../../../api";
import { addToCart, getCartItemCount } from "../../../utils/cart";
import { logout } from "../../../utils/auth";
const container = document.getElementById("products");
const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");
const loader = document.getElementById("loader");
const cartCount = document.getElementById("cartCount");
let allProducts = [];
let currentCategory = 'todos';
const userData = localStorage.getItem("user");
if (!userData) {
    window.location.href = "/src/pages/auth/login/login.html";
}
else {
    const user = JSON.parse(userData);
    if (userInfo)
        userInfo.textContent = `👋 Hola, ${user.name || "usuario"}`;
}
async function loadProducts() {
    if (!container)
        return;
    try {
        if (loader)
            loader.style.display = "block";
        const products = await apiFetch("/productos");
        if (!products || !Array.isArray(products) || products.length === 0) {
            container.innerHTML = `<p class="empty">No hay productos disponibles 😕</p>`;
            return;
        }
        allProducts = products;
        displayProducts(currentCategory);
        setupCategoryButtons();
        window.addToCart = (productId) => {
            const product = allProducts.find((p) => p.id === productId);
            if (product) {
                const cartProduct = {
                    id: product.id,
                    nombre: product.nombre,
                    precio: product.precio,
                    imagen: product.imagen,
                    stock: product.stock || 999
                };
                addToCart(cartProduct);
                updateCartCount();
            }
        };
    }
    catch (err) {
        if (container) {
            container.innerHTML = `<p class="error">⚠️ Error cargando productos: ${err?.message || "Error desconocido"}</p>`;
        }
    }
    finally {
        if (loader)
            loader.style.display = "none";
    }
}
function displayProducts(category) {
    if (!container)
        return;
    let productsToShow = allProducts;
    if (category !== 'todos') {
        productsToShow = allProducts.filter((product) => product.categoria?.nombre === category);
    }
    if (productsToShow.length === 0) {
        container.innerHTML = `<p class="empty">No hay productos disponibles en esta categoría 😕</p>`;
        return;
    }
    container.innerHTML = productsToShow
        .map((p) => `
      <div class="card" onclick="window.openProductModal(${p.id})">
        <img src="${p.imagen || "https://via.placeholder.com/200x150"}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <p class="price">$${p.precio}</p>
        <button class="add-btn" onclick="event.stopPropagation(); window.addToCart(${p.id})">Agregar</button>
      </div>
    `)
        .join("");
}
function setupCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target;
            const category = target.getAttribute('data-category') || 'todos';
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');
            currentCategory = category;
            displayProducts(category);
        });
    });
}
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        logout();
    });
}
function openProductModal(productId) {
    const product = allProducts.find((p) => p.id === productId);
    if (!product)
        return;
    const modal = document.getElementById('productModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalPrice = document.getElementById('modalPrice');
    const modalAddBtn = document.getElementById('modalAddBtn');
    if (modal && modalImage && modalTitle && modalDescription && modalPrice && modalAddBtn) {
        modalImage.src = product.imagen || "https://via.placeholder.com/400x300";
        modalImage.alt = product.nombre;
        modalTitle.textContent = product.nombre;
        modalDescription.textContent = product.descripcion || "Delicioso producto de nuestra cocina. Preparado con ingredientes frescos y de la mejor calidad.";
        modalPrice.textContent = `$${product.precio}`;
        modalAddBtn.onclick = () => {
            const cartProduct = {
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: product.imagen,
                stock: product.stock || 999
            };
            addToCart(cartProduct);
            updateCartCount();
            closeProductModal();
        };
        modal.style.display = 'block';
    }
}
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
    }
}
function setupModalEvents() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
}
window.openProductModal = openProductModal;
function updateCartCount() {
    if (cartCount) {
        cartCount.textContent = getCartItemCount().toString();
    }
}
loadProducts();
updateCartCount();
setupModalEvents();
