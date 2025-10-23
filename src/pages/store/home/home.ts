import { apiFetch } from "../../../api";

const container = document.getElementById("products");

async function loadProducts() {
  if (!container) return;

  try {
    const products = await apiFetch("/productos");
    if (!products || !Array.isArray(products)) {
      container.innerHTML = '<p>No hay productos disponibles</p>';
      return;
    }

    container.innerHTML = products
      .map(
        (p: any) =>
          `<div><h3>${p.nombre}</h3><p>$${p.precio}</p><button>Agregar</button></div>`
      )
      .join("");
  } catch (err: any) {
    container.innerHTML = `<p>Error cargando productos: ${err?.message || ''}</p>`;
  }
}

loadProducts();
