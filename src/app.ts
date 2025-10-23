export function initApp() {
	// Minimal app initialization that's safe to import on any page.
	// Attach global handlers only if the corresponding elements exist.
	try {
		const logoutButtons = document.querySelectorAll('[data-logout]');
		logoutButtons.forEach((btn) =>
			btn.addEventListener('click', () => {
				try {
					localStorage.removeItem('user');
					window.location.href = '/src/pages/auth/login/login.html';
				} catch (e) {
					// noop
				}
			})
		);
	} catch (e) {
		// If running in an environment without DOM (tests, SSR), fail gracefully
		// No-op
	}
}
