import { apiFetch } from "../../../api";
import { loginUser } from "../../../utils/auth";

// Esperar a que el DOM esté completamente cargado
setTimeout(() => {
  const loginButton = document.getElementById("loginButton") as HTMLButtonElement;
  
  if (loginButton) {
    loginButton.onclick = async (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      const emailInput = document.getElementById("email") as HTMLInputElement;
      const passwordInput = document.getElementById("password") as HTMLInputElement;
      const errorBox = document.getElementById("loginError") as HTMLElement;

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      // Limpiar errores anteriores
      errorBox.style.display = "none";

      if (!email || !password) {
        errorBox.textContent = "Completa todos los campos";
        errorBox.style.display = "block";
        return;
      }

      try {
        const user = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        if (user && user.id) {
          // Guardar usuario ANTES de redirigir
          loginUser(user);
          
          // Esperar un momento para asegurar que localStorage se actualice
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verificar que se guardó correctamente
          const savedUser = localStorage.getItem('user');
          
          if (savedUser) {
            // Usar location.href que es más confiable
            if (user.role === "admin") {
              window.location.href = "../../admin/adminHome/adminHome.html";
            } else {
              window.location.href = "../../store/home/home.html";
            }
          } else {
            console.error('Failed to save user to localStorage');
            errorBox.textContent = "Error al guardar sesión";
            errorBox.style.display = "block";
          }
        } else {
          errorBox.textContent = "Credenciales inválidas";
          errorBox.style.display = "block";
        }
      } catch (err: any) {
        errorBox.textContent = err?.message || "Error al iniciar sesión";
        errorBox.style.display = "block";
      }
    };
  }
}, 100);
