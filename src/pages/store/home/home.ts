import { apiFetch } from "../../../api";
import { addToCart, getCartItemCount } from "../../../utils/cart";


const container = document.getElementById("products") as HTMLElement | null;
const userInfo = document.getElementById("userInfo") as HTMLElement | null;
const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement | null;
const loader = document.getElementById("loader") as HTMLElement | null;
const cartCount = document.getElementById("cartCount") as HTMLElement | null;


const userData = localStorage.getItem("user");
if (!userData) {
  window.location.href = "/src/pages/auth/login/login.html";
} else {
  const user = JSON.parse(userData);
  if (userInfo) userInfo.textContent = `👋 Hola, ${user.name || "usuario"}`;
}


async function loadProducts() {
  if (!container) return;

  try {
    if (loader) loader.style.display = "block";

    const products = await apiFetch("/productos");

    if (!products || !Array.isArray(products) || products.length === 0) {
      container.innerHTML = `<p class="empty">No hay productos disponibles 😕</p>`;
      return;
    }

    container.innerHTML = products
      .map(
        (p: any) => `
        <div class="card">
          <img src="${p.imagen || "https://via.placeholder.com/200x150"}" alt="${p.nombre}">
          <h3>${p.nombre}</h3>
          <p class="price">$${p.precio}</p>
          <button class="add-btn" onclick="window.addToCart(${p.id})">Agregar</button>
        </div>
      `
      )
      .join("");

    (window as any).addToCart = (productId: number) => {
      const product = products.find((p: any) => p.id === productId);
      if (product) {
        addToCart(product);
        updateCartCount();
      }
    };
  } catch (err: any) {
    container.innerHTML = `<p class="error">⚠️ Error cargando productos: ${err?.message || "Error desconocido"}</p>`;
  } finally {
    if (loader) loader.style.display = "none";
  }
}


if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "/src/pages/auth/login/login.html";
  });
}


function updateCartCount() {
  if (cartCount) {
    cartCount.textContent = getCartItemCount().toString();
  }
}


loadProducts();
updateCartCount(); 
