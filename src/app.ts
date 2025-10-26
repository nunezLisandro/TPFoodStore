export function initApp() {
	try {
		const logoutButtons = document.querySelectorAll('[data-logout]');
		logoutButtons.forEach((btn) =>
			btn.addEventListener('click', () => {
				try {
					localStorage.removeItem('user');
					window.location.href = '/src/pages/auth/login/login.html';
				} catch (e) {
					
				}
			})
		);
	} catch (e) {
	}
}
