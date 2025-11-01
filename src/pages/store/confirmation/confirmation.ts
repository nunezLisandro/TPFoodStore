const userData = localStorage.getItem("user");
if (!userData) {
    window.location.href = "/src/pages/auth/login/login.html";
}

const orderIdElement = document.getElementById("orderId");
const lastOrderId = localStorage.getItem("lastOrderId");

if (orderIdElement && lastOrderId) {
    orderIdElement.textContent = `#${lastOrderId}`;
    localStorage.removeItem("lastOrderId");
} else {
    window.location.href = "/src/pages/store/home/home.html";
}