import { apiFetch } from "../../../api";
import { loginUser } from "../../../utils/auth";

const form = document.getElementById("loginForm") as HTMLFormElement | null;
const errorBox = document.getElementById("loginError");

function showError(msg: string) {
  if (errorBox) {
    errorBox.textContent = msg;
    errorBox.classList.add("visible");
  } else {
    alert(msg);
  }
}

function clearError() {
  if (errorBox) {
    errorBox.textContent = "";
    errorBox.classList.remove("visible");
  }
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const email = (document.getElementById("email") as HTMLInputElement)?.value.trim();
    const password = (document.getElementById("password") as HTMLInputElement)?.value.trim();

    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRe.test(email)) return showError("Ingresa un correo electrónico válido");
    if (password.length < 6) return showError("La contraseña debe tener al menos 6 caracteres");

    try {
      const user = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (user && user.role) {
        loginUser(user);
        // Redirección según rol
        window.location.href =
          user.role === "admin"
            ? "/src/pages/admin/adminHome/adminHome.html"
            : "/src/pages/store/home/home.html";
      } else {
        showError("Credenciales inválidas");
      }
    } catch (err: any) {
      showError(err?.message || "Error al autenticar");
    }
  });
}
