import { navigateTo } from '../../../utils/navigate.js';
import { apiDelete, apiGet } from '../../../utils/api.js';
import { requireAdmin } from '../../../utils/auth.js';
class UserManagement {
    users = [];
    filteredUsers = [];
    currentFilter = 'all';
    loadingElement;
    usersGridElement;
    roleFilterElement;
    deleteModal;
    userToDelete = null;
    constructor() {
        console.log('UserManagement constructor called');
        // Verify admin access first
        try {
            const currentUser = requireAdmin();
            console.log('Admin access verified for:', currentUser.name);
            // Update user info display
            const userInfo = document.getElementById('userInfo');
            if (userInfo) {
                userInfo.textContent = `👋 ${currentUser.name}`;
            }
        }
        catch (error) {
            console.error('Access denied:', error);
            navigateTo('/src/pages/auth/login/login.html');
            return;
        }
        this.loadingElement = document.getElementById('loading-state');
        this.usersGridElement = document.getElementById('users-grid');
        this.roleFilterElement = document.getElementById('roleFilter');
        this.deleteModal = document.getElementById('deleteModal');
        console.log('DOM elements:', {
            loadingElement: this.loadingElement,
            usersGridElement: this.usersGridElement,
            roleFilterElement: this.roleFilterElement,
            deleteModal: this.deleteModal
        });
        this.init();
    }
    async init() {
        console.log('Initializing UserManagement...');
        console.log('Elements found:', {
            loading: !!this.loadingElement,
            usersGrid: !!this.usersGridElement,
            roleFilter: !!this.roleFilterElement,
            deleteModal: !!this.deleteModal
        });
        await this.loadUsers();
        this.setupEventListeners();
        this.renderUsers();
        this.updateStats();
        console.log('UserManagement initialization complete');
    }
    setupEventListeners() {
        // Filter by role
        this.roleFilterElement?.addEventListener('change', (e) => {
            const target = e.target;
            this.currentFilter = target.value;
            this.filterUsers();
        });
        // Back button
        document.getElementById('backBtn')?.addEventListener('click', () => {
            navigateTo('/src/pages/admin/adminHome/adminHome.html');
        });
        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            navigateTo('/src/pages/auth/login/login.html');
        });
        // Modal close buttons
        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.hideDeleteModal();
        });
        document.getElementById('cancelDelete')?.addEventListener('click', () => {
            this.hideDeleteModal();
        });
        // Confirm delete button
        document.getElementById('confirmDelete')?.addEventListener('click', () => {
            this.confirmDelete();
        });
        // Close modal when clicking outside
        this.deleteModal?.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) {
                this.hideDeleteModal();
            }
        });
    }
    async loadUsers() {
        try {
            this.showLoading();
            console.log('Loading users from API...');
            // Add timeout to the request
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 10000);
            });
            const response = await Promise.race([
                apiGet('/api/users'),
                timeoutPromise
            ]);
            console.log('Users loaded successfully:', response);
            console.log('Response type:', typeof response);
            console.log('Is array:', Array.isArray(response));
            if (Array.isArray(response)) {
                this.users = response;
                this.filteredUsers = [...this.users];
                console.log('Users processed:', this.users.length, 'users');
            }
            else {
                console.error('Response is not an array:', response);
                this.showNotification('Error: respuesta del servidor no válida', 'error');
                return;
            }
        }
        catch (error) {
            console.error('Error loading users:', error);
            this.showNotification('Error al cargar usuarios: ' + error.message, 'error');
        }
        finally {
            this.hideLoading();
        }
    }
    filterUsers() {
        if (this.currentFilter === 'all') {
            this.filteredUsers = [...this.users];
        }
        else {
            this.filteredUsers = this.users.filter(user => user.role === this.currentFilter);
        }
        this.renderUsers();
        this.updateStats();
    }
    renderUsers() {
        console.log('Rendering users...');
        console.log('Users grid element:', this.usersGridElement);
        console.log('Filtered users count:', this.filteredUsers.length);
        if (!this.usersGridElement) {
            console.error('Users grid element not found, cannot render');
            return;
        }
        if (this.filteredUsers.length === 0) {
            console.log('No users to display');
            this.usersGridElement.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <h3>No hay usuarios para mostrar</h3>
                    <p>No se encontraron usuarios con el filtro seleccionado.</p>
                </div>
            `;
            return;
        }
        console.log('Rendering', this.filteredUsers.length, 'users');
        this.usersGridElement.innerHTML = this.filteredUsers.map(user => `
            <div class="user-card ${user.role}">
                <div class="user-header">
                    <div class="user-info">
                        <h3>${user.name || 'Usuario sin nombre'}</h3>
                        <div class="user-email">${user.email}</div>
                    </div>
                    <span class="role-badge ${user.role}">${user.role}</span>
                </div>
                
                <div class="user-actions">
                    <button class="btn btn-danger" onclick="userManagement.showDeleteModal(${user.id})" 
                            ${this.isLastAdmin(user) ? 'disabled title="No se puede eliminar el último administrador"' : ''}>
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `).join('');
        console.log('Users rendered successfully');
    }
    isLastAdmin(user) {
        if (user.role !== 'admin')
            return false;
        const adminCount = this.users.filter(u => u.role === 'admin').length;
        return adminCount <= 1;
    }
    showDeleteModal(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user)
            return;
        if (this.isLastAdmin(user)) {
            this.showNotification('No se puede eliminar el último administrador', 'error');
            return;
        }
        this.userToDelete = user;
        // Update modal content
        const userNameElement = document.getElementById('deleteUserName');
        const userEmailElement = document.getElementById('deleteUserEmail');
        if (userNameElement && userEmailElement) {
            userNameElement.textContent = user.name || 'Usuario sin nombre';
            userEmailElement.textContent = user.email;
        }
        this.deleteModal?.classList.remove('hidden');
    }
    hideDeleteModal() {
        this.deleteModal?.classList.add('hidden');
        this.userToDelete = null;
    }
    async confirmDelete() {
        if (!this.userToDelete)
            return;
        try {
            console.log('Deleting user:', this.userToDelete.id);
            await apiDelete(`/api/users/${this.userToDelete.id}`);
            // Remove user from local arrays
            this.users = this.users.filter(u => u.id !== this.userToDelete.id);
            this.filteredUsers = this.filteredUsers.filter(u => u.id !== this.userToDelete.id);
            this.showNotification('Usuario eliminado correctamente', 'success');
            // Play success sound
            this.playSound();
            // Re-render
            this.renderUsers();
            this.updateStats();
        }
        catch (error) {
            console.error('Error deleting user:', error);
            this.showNotification('Error al eliminar usuario', 'error');
        }
        finally {
            this.hideDeleteModal();
        }
    }
    updateStats() {
        const stats = {
            total: this.users.length,
            admins: this.users.filter(u => u.role === 'admin').length,
            clients: this.users.filter(u => u.role === 'cliente').length
        };
        // Update stats display
        const totalElement = document.getElementById('totalUsers');
        const adminsElement = document.getElementById('totalAdmins');
        const clientsElement = document.getElementById('totalClients');
        if (totalElement)
            totalElement.textContent = stats.total.toString();
        if (adminsElement)
            adminsElement.textContent = stats.admins.toString();
        if (clientsElement)
            clientsElement.textContent = stats.clients.toString();
    }
    showLoading() {
        console.log('Showing loading state');
        if (this.loadingElement) {
            this.loadingElement.classList.remove('hidden');
            console.log('Loading element shown');
        }
        else {
            console.error('Loading element not found');
        }
        if (this.usersGridElement) {
            this.usersGridElement.classList.add('hidden');
        }
    }
    hideLoading() {
        console.log('Hiding loading state');
        if (this.loadingElement) {
            this.loadingElement.classList.add('hidden');
            console.log('Loading element hidden');
        }
        if (this.usersGridElement) {
            this.usersGridElement.classList.remove('hidden');
            console.log('Users grid shown');
        }
    }
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.temp-notification');
        existing.forEach(el => el.remove());
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `temp-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    playSound() {
        try {
            // Create audio context for success sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Create a simple success tone
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            // Configure sound
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            // Play sound
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        }
        catch (error) {
            console.log('Could not play sound:', error);
        }
    }
}
// Global instance for HTML onclick handlers
let userManagement;
// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserManagement);
}
else {
    initUserManagement();
}
function initUserManagement() {
    console.log('Initializing user management...');
    userManagement = new UserManagement();
    // Make it globally available for HTML onclick handlers
    window.userManagement = userManagement;
}
export { UserManagement };
