import { apiFetch } from "../../../api";
import { loginUser } from "../../../utils/auth";

const form = document.getElementById("loginForm") as HTMLFormElement | null;

if (form) {
  const errorBox = document.getElementById('loginError');

  function showError(msg: string) {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.classList.add('visible');
    } else {
      alert(msg);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailEl = document.getElementById("email") as HTMLInputElement | null;
    const passwordEl = document.getElementById("password") as HTMLInputElement | null;
    const email = (emailEl?.value || "").trim();
    const password = (passwordEl?.value || "").trim();

    // Validaciones simples
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRe.test(email)) {
      showError('Ingresa un correo electrónico válido');
      return;
    }
    if (password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const user = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (user && user.role) {
        loginUser(user);
        if (user.role === "admin")
          window.location.href = "/src/pages/admin/adminHome/adminHome.html";
        else window.location.href = "/src/pages/store/home/home.html";
      } else {
        showError("Credenciales inválidas");
      }
    } catch (err: any) {
      showError(err?.message || "Error al autenticar");
    }
  });
} else {
  // Page doesn't contain a login form; nothing to do
}
