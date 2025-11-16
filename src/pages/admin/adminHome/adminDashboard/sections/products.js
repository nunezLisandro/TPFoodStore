export function renderProductsSection(container) {
    container.innerHTML = `
    <div class="section">
      <button class="primary" id="addProductBtn">+ Agregar producto</button>
      <ul id="productList"></ul>
    </div>
  `;
    const productList = container.querySelector("#productList");
    const addProductBtn = container.querySelector("#addProductBtn");
    addProductBtn?.addEventListener("click", () => {
        alert("Abrir modal o formulario para agregar producto");
    });
    fetch("http://localhost:8080/api/products")
        .then((res) => res.json())
        .then((products) => {
        productList.innerHTML = products
            .map((p) => `
        <li>
          <span>${p.name} - $${p.price}</span>
          <button class="delete" data-id="${p.id}">🗑️</button>
        </li>
      `)
            .join("");
    })
        .catch(() => {
        productList.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    });
}
