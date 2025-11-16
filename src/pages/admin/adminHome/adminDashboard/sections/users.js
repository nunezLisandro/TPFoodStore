export function renderUsersSection(container) {
    container.innerHTML = `
    <div class="section">
      <h3>Usuarios registrados</h3>
      <ul id="userList"></ul>
    </div>
  `;
    const userList = container.querySelector("#userList");
    fetch("http://localhost:8080/api/users")
        .then((res) => res.json())
        .then((users) => {
        userList.innerHTML = users
            .map((u) => `<li>${u.name} (${u.email})</li>`)
            .join("");
    })
        .catch(() => {
        userList.innerHTML = "<p>No se pudieron cargar los usuarios.</p>";
    });
}
