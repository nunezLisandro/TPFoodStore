import { getUser, logout, requireAdmin } from "../../../utils/auth";

// Verificar que el usuario sea administrador
try {
  const user = requireAdmin();
  
  // Actualizar información del usuario
  const userInfo = document.getElementById('userInfo');
  if (userInfo) {
    userInfo.textContent = `👋 ${user.name}`;
  }
} catch (error) {
  // requireAdmin ya redirige automáticamente si no es admin
  console.error('Acceso denegado:', error);
}

// Navegación
const categoriesCard = document.getElementById('categoriesCard');
const productsCard = document.getElementById('productsCard');
const ordersCard = document.getElementById('ordersCard');
const usersCard = document.getElementById('usersCard');
const storeCard = document.getElementById('storeCard');
const logoutBtn = document.getElementById('logoutBtn');

if (categoriesCard) {
  categoriesCard.addEventListener('click', () => {
    window.location.href = '/src/pages/admin/adminDashboard/dashboard.html?tab=categories';
  });
}

if (productsCard) {
  productsCard.addEventListener('click', () => {
    window.location.href = '/src/pages/admin/products/products.html';
  });
}

if (ordersCard) {
  ordersCard.addEventListener('click', () => {
    window.location.href = '/src/pages/admin/adminDashboard/dashboard.html?tab=orders';
  });
}

if (usersCard) {
  usersCard.addEventListener('click', () => {
    window.location.href = '/src/pages/admin/adminDashboard/dashboard.html?tab=users';
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



