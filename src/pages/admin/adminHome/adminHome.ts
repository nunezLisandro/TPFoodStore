import { getUser, logout, requireAdmin } from "../../../utils/auth";

try {
  const user = requireAdmin();
  const userInfo = document.getElementById('userInfo');
  if (userInfo) {
    userInfo.textContent = `👋 ${user.name}`;
  }
} catch (error) {
  console.error('Acceso denegado:', error);
}

const productsCard = document.getElementById('productsCard');
const ordersCard = document.getElementById('ordersCard');
const usersCard = document.getElementById('usersCard');
const storeCard = document.getElementById('storeCard');
const logoutBtn = document.getElementById('logoutBtn');

if (productsCard) {
  productsCard.addEventListener('click', () => {
    window.location.href = '/src/pages/admin/products/products.html';
  });
}

if (ordersCard) {
  ordersCard.addEventListener('click', () => {
    window.location.href = '/src/pages/admin/orders/orders.html';
  });
}

if (usersCard) {
  usersCard.addEventListener('click', () => {
    window.location.href = '/src/pages/admin/users/users.html';
  });
}

if (storeCard) {
  storeCard.addEventListener('click', () => {
    window.location.href = '/src/pages/store/home/home.html';
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    logout();
  });
}



