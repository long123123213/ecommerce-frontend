async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    // 🔥 CHECK ROLE ADMIN
    if (data.user.role !== "ADMIN") {
      alert("Bạn không có quyền admin");
      return;
    }

    // Lưu token + user
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.user));

    // chuyển trang
    window.location.href = "/admin/dashboard";

  } catch (error) {
    alert("Lỗi server");
  }
}

function checkAdmin() {
  const token = localStorage.getItem("adminToken");
  const user = JSON.parse(localStorage.getItem("adminUser"));

  if (!token || !user || user.role !== "ADMIN") {
    window.location.replace("/admin/login");
  }
}

function logout() {
  localStorage.clear();
  window.location.replace("/admin/login");
}
function logout() {
  localStorage.clear();
  window.location.replace("/admin/login");
}

const path = window.location.pathname;
const token = localStorage.getItem("adminToken");
const user = JSON.parse(localStorage.getItem("adminUser"));

// 🔥 Nếu đang ở trang login mà đã đăng nhập rồi
if (path === "/admin/login" && token && user?.role === "ADMIN") {
  window.location.replace("/admin/dashboard");
}

// 🔥 Nếu không phải login thì phải check
if (path !== "/admin/login") {
  checkAdmin();
}