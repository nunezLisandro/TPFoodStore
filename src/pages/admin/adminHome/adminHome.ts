import { getUser, logout } from "../../../utils/auth";

const toStore = document.getElementById('toStore');
const user = getUser();

if (user) {
  const h1 = document.querySelector('#app h1');
  if (h1) h1.textContent = `Bienvenido, ${user.name}`;
}

if (toStore) {
  toStore.addEventListener('click', () => {
    window.location.href = '/src/pages/store/home/home.html';
  });
}

// logout button is handled by initApp via [data-logout]
