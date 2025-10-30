import { apiFetch, API_URL } from "../../../api";
import { loginUser } from "../../../utils/auth";

const form = document.getElementById('registerForm') as HTMLFormElement | null;
const errorBox = document.getElementById('registerError');

function showError(msg: string){
  if (errorBox) { errorBox.textContent = msg; errorBox.classList.add('visible'); }
  else alert(msg);
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (document.getElementById('name') as HTMLInputElement).value.trim();
    const email = (document.getElementById('email') as HTMLInputElement).value.trim();
    const password = (document.getElementById('password') as HTMLInputElement).value.trim();

    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!name) return showError('Nombre requerido');
    if (!emailRe.test(email)) return showError('Email inválido');
    if (password.length < 6) return showError('La contraseña debe tener al menos 6 caracteres');

    try {
      const body = { name, email, password };
      // debug logs to help diagnose failed requests
      // eslint-disable-next-line no-console
      console.info('[register] POST', `${API_URL}/auth/register`, body);

      const user = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      // eslint-disable-next-line no-console
      console.info('[register] response', user);

        if (user && user.id) {
    if (errorBox) {
      errorBox.textContent = 'Registro correcto. Redirigiendo al login...';
      errorBox.classList.add('visible');
    }
    
    // Espera un segundo para mostrar el mensaje
    setTimeout(() => {
      window.location.href = '/src/pages/auth/login/login.html'; // 👈 redirige al login
    }, 1000);
  } else {
    showError('Error al registrar');
  }

    } catch (err: any) {
      // Show full error (backend message or whole body) and log to console
      const msg = err?.message || 'Error en el registro';
      // eslint-disable-next-line no-console
      console.error('[register] error', err);
      showError(msg);
    }
  });
}
