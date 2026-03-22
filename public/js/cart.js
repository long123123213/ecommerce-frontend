
const BASE = "https://ecommerce-backend-w960.onrender.com/api";
const API_URL = BASE;

async function loadCart() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      document.querySelector(".cart-items").innerHTML =
        "<p>Bạn cần đăng nhập</p>";
      return;
    }

    const res = await fetch(`${API_URL}/cart`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Lỗi load cart");

    const data = await res.json();

    const items =
      data.items ||
      data.cart?.items ||
      data.data?.items ||
      [];

    if (items.length === 0) {
      document.querySelector(".cart-items").innerHTML =
        "<p>Giỏ hàng trống</p>";
      document.getElementById("cartTotal").innerText = "0 đ";
      return;
    }

    await renderCart(items);

  } catch (err) {
    console.error(err);
  }
}

async function renderCart(items) {
  const container = document.querySelector(".cart-items");
  container.innerHTML = "";

  let totalMoney = 0;

  for (const item of items) {

    const variant = item.idProductVariant;
    if (!variant) continue;

    // 🔥 LẤY PRODUCT ĐỂ HIỂN THỊ ẢNH + TÊN
    const productRes = await fetch(
      `${API_URL}/products/${variant.idProduct}`
    );

    if (!productRes.ok) continue;

    const productData = await productRes.json();
    const product = productData.product;

    const price = variant.price || 0;
    const quantity = item.quantity || 0;
    const total = price * quantity;

    totalMoney += total;

    container.innerHTML += `
      <div class="cart-row">

        <div class="cart-product">
        <a href="/${product.slug}">
          <img 
            src="${product.images?.[0] || ''}" 
            width="80"
            onerror="this.src='default.png'"
          >
          <div>
            <h4>${product.nameProduct || ''}</h4></a>
            <p>Size: ${variant.size || ''}</p>
            <p>Color: ${variant.color || ''}</p>
            <span>${price.toLocaleString("vi-VN")} đ</span>
          </div>
        </div>

        <div class="cart-quantity">
          <button onclick="changeQuantity('${item._id}', ${quantity - 1})">-</button>
          <span>${quantity}</span>
          <button onclick="changeQuantity('${item._id}', ${quantity + 1})">+</button>
        </div>

        <div class="cart-total">
          ${total.toLocaleString("vi-VN")} đ
        </div>

        <div class="cart-remove">
          <button onclick="removeItem('${item._id}')">X</button>
        </div>

      </div>
    `;
  }

  document.getElementById("cartTotal").innerText =
    totalMoney.toLocaleString("vi-VN") + " đ";
}

/* ===== UPDATE QUANTITY ===== */
async function changeQuantity(idItem, quantity) {

  if (quantity < 1) return;

  const token = localStorage.getItem("token");

  await fetch(`${API_URL}/cart/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      idItem,
      quantity
    })
  });

  loadCart();
}

/* ===== REMOVE ITEM ===== */
async function removeItem(idItem) {

  const token = localStorage.getItem("token");

  await fetch(`${API_URL}/cart/remove/${idItem}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token
    }
  });

  loadCart();
}

function goCheckout() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Bạn cần đăng nhập");
    return;
  }

  window.location.href = "/checkout";
}

/* LOAD CART */
if (document.querySelector(".cart-items")) {
  loadCart();
}