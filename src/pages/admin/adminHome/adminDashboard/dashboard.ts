import { getUser, logout } from "@utils/auth";

const user = getUser();

if (!user || user.role !== "ADMIN") {
  window.location.href = "/src/pages/auth/login/login.html";
}

const sectionTitle = document.getElementById("sectionTitle") as HTMLElement;
const sectionContent = document.getElementById("sectionContent") as HTMLElement;

document.querySelector("[data-logout]")?.addEventListener("click", () => {
  logout();
});

document.querySelectorAll("[data-section]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const target = e.currentTarget as HTMLElement;
    const section = target.getAttribute("data-section");
    loadSection(section!);
  });
});

function loadSection(section: string) {
  switch (section) {
    case "products":
      sectionTitle.textContent = "Gestión de Productos";
      sectionContent.innerHTML = `
        <div class="section">
          <button class="primary" id="addProduct">+ Agregar producto</button>
          <ul id="productList"></ul>
        </div>
      `;
      loadProducts();
      break;

    case "users":
      sectionTitle.textContent = "Usuarios Registrados";
      sectionContent.innerHTML = `
        <div class="section">
          <ul id="userList"></ul>
        </div>
      `;
      loadUsers();
      break;

    case "texts":
      sectionTitle.textContent = "Editar Textos de la Tienda";
      sectionContent.innerHTML = `
        <div class="section">
          <textarea id="storeText" rows="6" style="width:100%;"></textarea>
          <button class="primary" id="saveText">Guardar</button>
        </div>
      `;
      const saveBtn = document.getElementById("saveText");
      const textArea = document.getElementById("storeText") as HTMLTextAreaElement;
      const saved = localStorage.getItem("storeText");
      if (saved) textArea.value = saved;
      saveBtn?.addEventListener("click", () => {
        localStorage.setItem("storeText", textArea.value);
        alert("Texto guardado correctamente ✅");
      });
      break;

    default:
      sectionTitle.textContent = "Bienvenido al panel";
      sectionContent.innerHTML = `<p>Seleccioná una sección de la izquierda.</p>`;
  }
}

async function loadProducts() {
  try {
    const res = await fetch("http://localhost:8080/api/products");
    const products = await res.json();
    const list = document.getElementById("productList")!;
    list.innerHTML = products
      .map(
        (p: any) =>
          `<li>${p.name} - $${p.price} <button data-id="${p.id}" class="delete">🗑️</button></li>`
      )
      .join("");
    list.addEventListener("click", async (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("delete")) {
        const id = target.getAttribute("data-id");
        await fetch(`http://localhost:8080/api/products/${id}`, { method: "DELETE" });
        loadProducts();
      }
    });
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}

async function loadUsers() {
  try {
    const res = await fetch("http://localhost:8080/api/users");
    const users = await res.json();
    const list = document.getElementById("userList")!;
    list.innerHTML = users
      .map((u: any) => `<li>${u.name} (${u.email})</li>`)
      .join("");
  } catch (err) {
    console.error("Error cargando usuarios:", err);
  }
}
