import { apiFetch } from "../../../api";

const container = document.getElementById("products")!;

async function loadProducts() {
  const products = await apiFetch("/productos");
  container.innerHTML = products
    .map(
      (p: any) =>
        `<div><h3>${p.nombre}</h3><p>$${p.precio}</p><button>Agregar</button></div>`
    )
    .join("");
}

loadProducts();
