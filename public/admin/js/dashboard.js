async function loadDashboard() {
  const res = await fetch("http://localhost:5000/api/admin/dashboard");
  const data = await res.json();

  document.getElementById("totalProducts").innerText = data.totalProducts;
  document.getElementById("totalOrders").innerText = data.totalOrders;
  document.getElementById("totalUsers").innerText = data.totalUsers;
  document.getElementById("revenue").innerText =
    data.revenue.toLocaleString("vi-VN");

  renderStatusChart(data.statusStats);
  loadRevenueChart();
  loadRecentOrders();
  loadTopProducts();
  loadTopUsers();
}

// ===== STATUS =====
function renderStatusChart(statusStats) {
  new Chart(document.getElementById("statusChart"), {
    type: "bar",
    data: {
      labels: Object.keys(statusStats),
      datasets: [{
        label: "Orders",
        data: Object.values(statusStats)
      }]
    }
  });
}

// ===== REVENUE =====
async function loadRevenueChart() {
  const month = document.getElementById("month")?.value;
  const year = document.getElementById("year")?.value;

  const res = await fetch(
    `http://localhost:5000/api/admin/revenue-by-date?month=${month}&year=${year}`
  );

  const data = await res.json();

  new Chart(document.getElementById("revenueChart"), {
    type: "line",
    data: {
      labels: data.map(i => i.date),
      datasets: [{
        label: "Revenue",
        data: data.map(i => i.revenue)
      }]
    }
  });
}

// ===== RECENT =====
// ===== RECENT =====
async function loadRecentOrders() {
  try {
    const token = localStorage.getItem("adminToken");

    const res = await fetch("http://localhost:5000/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    // handle trường hợp backend trả {orders: []}
    const orders = Array.isArray(data) ? data : data.orders;

    if (!orders || orders.length === 0) {
      document.getElementById("recentOrders").innerHTML =
        "<tr><td colspan='4'>No orders</td></tr>";
      return;
    }

    const recent = [...orders]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 5);

    document.getElementById("recentOrders").innerHTML =
      recent.map(o => `
        <tr>
          <td>#${o._id.slice(-6)}</td>
          <td>${(o.total || 0).toLocaleString("vi-VN")} đ</td>
          <td>${o.status}</td>
          <td>${new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
        </tr>
      `).join("");

  } catch (err) {
    console.error("Recent orders error:", err);
  }
}

// ===== TOP PRODUCTS =====
async function loadTopProducts() {
  const res = await fetch("http://localhost:5000/api/admin/top-products");
  const data = await res.json();

  new Chart(document.getElementById("topProductsChart"), {
    type: "bar",
    data: {
      labels: data.map(i => i._id),
      datasets: [{
        label: "Sold",
        data: data.map(i => i.totalSold)
      }]
    }
  });
}

// ===== TOP USERS =====
async function loadTopUsers() {
  const res = await fetch("http://localhost:5000/api/admin/top-users");
  const data = await res.json();

  new Chart(document.getElementById("topUsersChart"), {
    type: "bar",
    data: {
      labels: data.map(i => i._id),
      datasets: [{
        label: "Spent",
        data: data.map(i => i.totalSpent)
      }]
    }
  });
}

loadDashboard();