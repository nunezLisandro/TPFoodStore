import { requireAdmin } from "../../../utils/auth";
import { getCategories, getProducts } from "../../../utils/api";
import type { IProduct } from "../../../types/IProduct";
import type { ICategoria } from "../../../types/ICategoria";

// Función genérica para hacer peticiones API
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const API_BASE_URL = 'http://localhost:8081/api';
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Verificar que el usuario sea administrador
try {
  const user = requireAdmin();
  const userInfo = document.getElementById('userInfo');
  if (userInfo) {
    userInfo.textContent = `👋 ${user.name}`;
  }
} catch (error) {
  console.error('Acceso denegado:', error);
}

// Estados de la aplicación
let allProducts: IProduct[] = [];
let allCategories: ICategoria[] = [];
let filteredProducts: IProduct[] = [];

// Elementos del DOM
const loadingEl = document.getElementById('loading') as HTMLDivElement;
const productsGrid = document.getElementById('productsGrid') as HTMLDivElement;
const noProductsEl = document.getElementById('noProducts') as HTMLDivElement;
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const categoryFilter = document.getElementById('categoryFilter') as HTMLSelectElement;
const stockFilter = document.getElementById('stockFilter') as HTMLSelectElement;
const refreshBtn = document.getElementById('refreshBtn') as HTMLButtonElement;

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  await loadCategories();
  await loadProducts();
  setupEventListeners();
});

// Cargar categorías
async function loadCategories() {
  try {
    const categories = await apiRequest<ICategoria[]>('/categorias');
    allCategories = categories;
    
    // Llenar select de categorías
    categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
    categories.forEach((category: ICategoria) => {
      const option = document.createElement('option');
      option.value = category.id.toString();
      option.textContent = category.nombre;
      categoryFilter.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

// Cargar productos
async function loadProducts() {
  try {
    showLoading();
    const products = await apiRequest<IProduct[]>('/productos');
    allProducts = products;
    filteredProducts = [...products];
    renderProducts();
  } catch (error) {
    console.error('Error cargando productos:', error);
    showError('Error al cargar los productos');
  }
}

// Mostrar productos
function renderProducts() {
  hideLoading();
  
  if (filteredProducts.length === 0) {
    showNoProducts();
    return;
  }
  
  hideNoProducts();
  
  productsGrid.innerHTML = filteredProducts.map(product => 
    createProductCard(product)
  ).join('');
  
  // Agregar event listeners a los botones de stock
  setupStockControls();
}

// Crear tarjeta de producto
function createProductCard(product: IProduct): string {
  const stockClass = getStockClass(product.stock);
  const categoryName = allCategories.find(c => c.id === product.categoria.id)?.nombre || 'Sin categoría';
  
  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-header">
        <div>
          <div class="product-title">${product.nombre}</div>
          <div style="color: #718096; font-size: 0.9rem;">${categoryName}</div>
        </div>
        <div class="product-price">$${product.precio}</div>
      </div>
      
      <div class="stock-info">
        <span>Stock actual:</span>
        <span class="stock-value ${stockClass}">${product.stock} unidades</span>
      </div>
      
      <div class="stock-controls">
        <input 
          type="number" 
          class="stock-input" 
          placeholder="Cantidad"
          min="1"
          id="stock-input-${product.id}"
        />
        <button 
          class="btn btn-success add-stock-btn" 
          data-product-id="${product.id}"
        >
          ➕ Agregar
        </button>
        <button 
          class="btn btn-warning set-stock-btn" 
          data-product-id="${product.id}"
        >
          📝 Establecer
        </button>
      </div>
      
      <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #718096;">
        ${product.descripcion}
      </div>
    </div>
  `;
}

// Obtener clase de stock según el nivel
function getStockClass(stock: number): string {
  if (stock <= 5) return 'stock-low';
  if (stock <= 20) return 'stock-medium';
  return 'stock-high';
}

// Configurar controles de stock
function setupStockControls() {
  // Botones para agregar stock
  document.querySelectorAll('.add-stock-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const productId = (e.target as HTMLElement).dataset.productId;
      const input = document.getElementById(`stock-input-${productId}`) as HTMLInputElement;
      const amount = parseInt(input.value);
      
      if (!amount || amount <= 0) {
        alert('Por favor ingresa una cantidad válida mayor a 0');
        return;
      }
      
      await addStock(parseInt(productId!), amount);
      input.value = '';
    });
  });
  
  // Botones para establecer stock
  document.querySelectorAll('.set-stock-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const productId = (e.target as HTMLElement).dataset.productId;
      const input = document.getElementById(`stock-input-${productId}`) as HTMLInputElement;
      const amount = parseInt(input.value);
      
      if (!amount || amount < 0) {
        alert('Por favor ingresa una cantidad válida mayor o igual a 0');
        return;
      }
      
      await setStock(parseInt(productId!), amount);
      input.value = '';
    });
  });
}

// Agregar stock a un producto
async function addStock(productId: number, amount: number) {
  try {
    const btn = document.querySelector(`[data-product-id="${productId}"].add-stock-btn`) as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = '⏳ Agregando...';
    
    await apiRequest(`/productos/${productId}/add-stock`, {
      method: 'POST',
      body: JSON.stringify({ stock: amount })
    });
    
    // Actualizar producto en la lista
    const productIndex = allProducts.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      allProducts[productIndex].stock += amount;
    }
    
    // Re-renderizar
    applyFilters();
    
    alert(`✅ Se agregaron ${amount} unidades al stock correctamente`);
  } catch (error) {
    console.error('Error agregando stock:', error);
    alert('❌ Error al agregar stock. Inténtalo de nuevo.');
  }
}

// Establecer stock de un producto
async function setStock(productId: number, amount: number) {
  try {
    const btn = document.querySelector(`[data-product-id="${productId}"].set-stock-btn`) as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = '⏳ Estableciendo...';
    
    await apiRequest(`/productos/${productId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stock: amount })
    });
    
    // Actualizar producto en la lista
    const productIndex = allProducts.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      allProducts[productIndex].stock = amount;
    }
    
    // Re-renderizar
    applyFilters();
    
    alert(`✅ Stock establecido a ${amount} unidades correctamente`);
  } catch (error) {
    console.error('Error estableciendo stock:', error);
    alert('❌ Error al establecer stock. Inténtalo de nuevo.');
  }
}

// Aplicar filtros
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;
  const selectedStock = stockFilter.value;
  
  filteredProducts = allProducts.filter(product => {
    // Filtro de búsqueda
    const matchesSearch = !searchTerm || 
      product.nombre.toLowerCase().includes(searchTerm) ||
      product.descripcion.toLowerCase().includes(searchTerm);
    
    // Filtro de categoría
    const matchesCategory = !selectedCategory || 
      product.categoria.id.toString() === selectedCategory;
    
    // Filtro de stock
    let matchesStock = true;
    if (selectedStock === 'low') {
      matchesStock = product.stock <= 5;
    } else if (selectedStock === 'medium') {
      matchesStock = product.stock > 5 && product.stock <= 20;
    } else if (selectedStock === 'high') {
      matchesStock = product.stock > 20;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });
  
  renderProducts();
}

// Configurar event listeners
function setupEventListeners() {
  searchInput.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
  stockFilter.addEventListener('change', applyFilters);
  refreshBtn.addEventListener('click', loadProducts);
}

// Funciones de utilidad para mostrar/ocultar elementos
function showLoading() {
  loadingEl.style.display = 'block';
  productsGrid.style.display = 'none';
  noProductsEl.style.display = 'none';
}

function hideLoading() {
  loadingEl.style.display = 'none';
  productsGrid.style.display = 'grid';
}

function showNoProducts() {
  productsGrid.style.display = 'none';
  noProductsEl.style.display = 'block';
}

function hideNoProducts() {
  noProductsEl.style.display = 'none';
}

function showError(message: string) {
  hideLoading();
  productsGrid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #e53e3e;">
      <h3>❌ Error</h3>
      <p>${message}</p>
      <button onclick="location.reload()" class="btn btn-primary">Reintentar</button>
    </div>
  `;
  productsGrid.style.display = 'grid';
}