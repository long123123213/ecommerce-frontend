document.addEventListener("DOMContentLoaded", function () {

  const API_URL = "http://localhost:5000/api";
  const list = document.getElementById("order-list");

  if (!list) return;

  // ==========================
  // LOAD ORDERS
  // ==========================
  async function loadOrders() {

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${API_URL}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orders = await res.json();

    if (!orders.length) {
      list.innerHTML = `
        <tr><td colspan="5">Không có đơn hàng</td></tr>
      `;
      return;
    }

    list.innerHTML = "";

    orders.forEach(order => {

      const date = new Date(order.createdAt)
        .toLocaleDateString("vi-VN");

      list.innerHTML += `
        <tr>
          <td>#${order._id.slice(-6)}</td>
          <td>${date}</td>
          <td>${order.total.toLocaleString()}₫</td>
          <td>
            <span class="order-status ${order.status}">
              ${order.status}
            </span>
             <br>
  <span class="payment-status" style="color:${order.paymentStatus==='PAID'?'green':'red'}">
    ${order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
  </span>
          </td>

          <td>
            <button class="btn-outline view-order" data-id="${order._id}">
              Xem chi tiết
            </button>
  
              ${order.status === "PENDING" && order.paymentStatus !== "PAID" &&order.shippingMethod==="VNPAY"
    ? `<button class="btn-pay-again" data-id="${order._id}">Hoàn tất thanh toán VNPAY</button>`
    : ""} 

            ${
              order.status === "PENDING"
                ? `<button class="btn-cancel cancel-order" data-id="${order._id}">
                    Hủy
                   </button>`
                : ""
            }
          </td>
        </tr>

        <tr class="order-detail" id="detail-${order._id}" style="display:none">
          <td colspan="5">

            <div class="order-products">

              ${order.items.map(item => {

                const product = item.idProductVariant.idProduct;
                const variant = item.idProductVariant;

                const img = product.images?.[0]
                  ? product.images[0]
                  : "https://via.placeholder.com/60";

                return `
                  <div class="order-item">
                    <img src="${img}">

                    <div class="order-item-info">
                      <div class="name">${product.nameProduct}</div>
                      <div class="variant">
                        Size ${variant.size} | Màu ${variant.color}
                      </div>
                    </div>

                    <div class="qty">x${item.quantity}</div>

                    <div class="order-price">
                      ${item.price.toLocaleString()}₫
                    </div>
                  </div>
                `;
              }).join("")}

            </div>

          </td>
        </tr>
      `;
    });
  }

  loadOrders();

  // ==========================
  // EVENT DELEGATION (🔥 CHUẨN)
  // ==========================
  document.addEventListener("click", async (e) => {

    const token = localStorage.getItem("token");

    // 👁️ TOGGLE DETAIL
    const viewBtn = e.target.closest(".view-order");

    if (viewBtn) {
      const id = viewBtn.dataset.id;
      const detail = document.getElementById("detail-" + id);

      detail.style.display =
        detail.style.display === "none"
          ? "table-row"
          : "none";
    }

    // Thanh toan vnpay
    // 🔹 PAY AGAIN VNPay
const payAgainBtn = e.target.closest(".btn-pay-again");

if (payAgainBtn) {
  const orderId = payAgainBtn.dataset.id;

  if (!token) {
    return alert("Bạn cần đăng nhập");
  }

  try {
    const res = await fetch(`${API_URL}/vnpay/recreate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ orderId })
    });

    const data = await res.json();

    if (!res.ok) {
      return alert(data.message || "Lỗi tạo link thanh toán");
    }

    if (!data.paymentUrl) {
      return alert("Không tạo được link VNPay");
    }

    // chuyển sang VNPay
    window.location.href = data.paymentUrl;

  } catch (error) {
    console.error(error);
    alert("Lỗi khi tạo link thanh toán");
  }
}
    // ❌ CANCEL ORDER
    const cancelBtn = e.target.closest(".cancel-order");

    if (cancelBtn) {
      const id = cancelBtn.dataset.id;

      if (!confirm("Bạn có chắc muốn hủy đơn này?")) return;

      const res = await fetch(`${API_URL}/orders/${id}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Hủy thành công");

      loadOrders(); // reload lại list
    }

  });

});