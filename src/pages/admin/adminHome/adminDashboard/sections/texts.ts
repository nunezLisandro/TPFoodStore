export function renderTextsSection(container: HTMLElement) {
  container.innerHTML = `
    <div class="section">
      <textarea id="storeText" rows="6" style="width:100%;" placeholder="Texto de portada o descripción de la tienda..."></textarea>
      <button class="primary" id="saveText">Guardar</button>
    </div>
  `;

  const saveBtn = container.querySelector("#saveText");
  const textArea = container.querySelector("#storeText") as HTMLTextAreaElement;

  // Cargar texto actual (desde backend o localStorage)
  const saved = localStorage.getItem("storeText");
  if (saved) textArea.value = saved;

  saveBtn?.addEventListener("click", () => {
    localStorage.setItem("storeText", textArea.value);
    alert("Texto guardado correctamente ✅");
  });
}
