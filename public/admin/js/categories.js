const BASE = "https://ecommerce-backend-w960.onrender.com/api";
const API_URL = BASE;

let editingId = null; // lưu id đang sửa

// ================= LOAD =================
async function loadCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`);
    const categories = await res.json();

    const table = document.getElementById("categoryTable");
    table.innerHTML = "";

    categories.forEach(category => {
      table.innerHTML += `
        <tr>
          <td>${category.nameCategory}</td>
          <td>
            <button onclick="startEdit('${category._id}', '${category.nameCategory}')">
              Sửa
            </button>
            <button onclick="deleteCategory('${category._id}')">
              Xóa
            </button>
          </td>
        </tr>
      `;
    });

  } catch (error) {
    console.log(error);
  }
}

// ================= ADD / UPDATE =================
async function addCategory() {
  const name = document.getElementById("categoryName").value;

  if (!name) {
    alert("Nhập tên danh mục");
    return;
  }

  // Nếu đang edit thì gọi PUT
  if (editingId) {
    await fetch(`${API_URL}/categories/${editingId}`, {
      method: "PUT",
       headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
  },
      body: JSON.stringify({
        nameCategory: name
      })
    });

    editingId = null;
    document.querySelector("button[onclick='addCategory()']").innerText = "Thêm";

  } else {
    // Nếu không edit thì POST
    await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
  },
      body: JSON.stringify({
        nameCategory: name
      })
    });
  }

  document.getElementById("categoryName").value = "";
  loadCategories();
}

// ================= START EDIT =================
function startEdit(id, name) {
  editingId = id;
  document.getElementById("categoryName").value = name;
  document.querySelector("button[onclick='addCategory()']").innerText = "Cập nhật";
}

// ================= DELETE =================
async function deleteCategory(id) {
  if (!confirm("Bạn chắc chắn muốn xóa?")) return;

  await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE" ,headers:{ 
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`
    },
  });

  loadCategories();
}

loadCategories();