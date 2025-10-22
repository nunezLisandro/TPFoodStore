import { apiFetch } from "../../../api";
import { loginUser } from "../../../utils/auth";

const form = document.getElementById("loginForm") as HTMLFormElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = (document.getElementById("email") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement).value;

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
    alert("Credenciales inválidas");
  }
});
