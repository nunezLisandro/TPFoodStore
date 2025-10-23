import { apiFetch } from "../../../api";
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
      const user = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (user && user.id) {
        // auto login
        loginUser(user);
        window.location.href = user.role === 'admin' ? '/src/pages/admin/adminHome/adminHome.html' : '/src/pages/store/home/home.html';
      } else {
        showError('Error al registrar');
      }
    } catch (err: any) {
      showError(err?.message || 'Error en el registro');
    }
  });
}
