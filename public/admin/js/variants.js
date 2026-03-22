const API_URL = "http://localhost:5000/api";

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

let editingId = null;

async function loadVariants() {

  const res = await fetch(`${API_URL}/products/${productId}`);
  const product = await res.json();

  const table = document.getElementById("variantTable");
  table.innerHTML = "";

  product.variants.forEach(v => {

    table.innerHTML += `
      <tr>
        <td>${v.size}</td>
        <td>${v.color}</td>
        <td>${v.price}</td>
        <td>${v.stock}</td>
        <td>
          <button onclick="editVariant('${v._id}','${v.size}','${v.color}',${v.price},${v.stock})">Edit</button>
          <button onclick="deleteVariant('${v._id}')">Delete</button>
        </td>
      </tr>
    `;

  });
}

async function addVariant() {

  const size = document.getElementById("size").value;
  const color = document.getElementById("color").value;
  const price = document.getElementById("price").value;
  const stock = document.getElementById("stock").value;

  if (editingId) {

    await fetch(`${API_URL}/variants/${editingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        size,
        color,
        price,
        stock
      })
    });

    editingId = null;

  } else {

    await fetch(`${API_URL}/variants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idProduct: productId,
        size,
        color,
        price,
        stock
      })
    });

  }

  clearForm();
  loadVariants();
}

function editVariant(id, size, color, price, stock) {

  document.getElementById("size").value = size;
  document.getElementById("color").value = color;
  document.getElementById("price").value = price;
  document.getElementById("stock").value = stock;

  editingId = id;
}

async function deleteVariant(id) {

  if (!confirm("Bạn có chắc muốn xóa variant?")) return;

  await fetch(`${API_URL}/variants/${id}`, {
    method: "DELETE"
  });

  loadVariants();
}

function clearForm() {

  document.getElementById("size").value = "";
  document.getElementById("color").value = "";
  document.getElementById("price").value = "";
  document.getElementById("stock").value = "";

}

loadVariants();