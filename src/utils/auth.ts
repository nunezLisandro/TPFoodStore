export function loginUser(userData: any) {
  localStorage.setItem("user", JSON.stringify(userData));
}

export function getUser() {
  return JSON.parse(localStorage.getItem("user") || "null");
}

export function logout() {
  localStorage.removeItem("user");
  window.location.href = "/src/pages/auth/login/login.html";
}
