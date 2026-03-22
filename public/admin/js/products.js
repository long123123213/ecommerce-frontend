const API_URL = "http://localhost:5000/api";

let page = 1;
let totalPages = 1;

let editingProductId = null;
let oldImages = [];

// LOAD CATEGORY
async function loadCategoriesToSelect() {

  const res = await fetch(`${API_URL}/categories`);
  const categories = await res.json();

  const select = document.getElementById("categorySelect");

  select.innerHTML = "";

  categories.forEach(c => {

    select.innerHTML += `
      <option value="${c._id}">
        ${c.nameCategory}
      </option>
    `;

  });

}

// LOAD PRODUCTS
async function loadProducts() {

  const search = document.getElementById("searchInput").value;

  const res = await fetch(
    `${API_URL}/products?page=${page}&limit=10&search=${search}`
  );

  const data = await res.json();

  totalPages = data.totalPages;

  document.getElementById("pageInfo").innerText =
    `Page ${page} / ${totalPages}`;

  const table = document.getElementById("productTable");

  table.innerHTML = "";

  data.products.forEach(product => {

    const image = product.images?.[0] || "";
   // tạo tag cho từng product
    const tags = [
      ...(product.selectedTags || []),
      ...(product.customTags || [])
    ].join(", ");
    table.innerHTML += `
      <tr>

        <td>
          <img src="${image}" width="60">
        </td>

        <td>${product.nameProduct}</td>

        <td>
          ${(product.description || "").slice(0,80)}...
        </td>

        <td>${product.minPrice || 0} đ</td>

        <td>${product.totalStock || 0}</td>

        <td>${tags}</td>

        <td>

          <button onclick="goToVariants('${product._id}')">
            Variants
          </button>

          <button onclick="editProduct('${product._id}')">
            Edit
          </button>

          <button onclick="deleteProduct('${product._id}')">
            Delete
          </button>

        </td>

      </tr>
    `;

  });

}

// ADD / UPDATE PRODUCT
async function addProduct() {

  const name = document.getElementById("productName").value;

  const description = editor.getData();

  const categoryId = document.getElementById("categorySelect").value;

  const files = document.getElementById("productImages").files;

  const formData = new FormData();

  formData.append("nameProduct", name);
  formData.append("description", description);
  formData.append("idCategory", categoryId);

  formData.append("oldImages", JSON.stringify(oldImages));

  for (let i = 0; i < files.length; i++) {
    formData.append("images", files[i]);
  }

  let url = `${API_URL}/products`;
  let method = "POST";

  if (editingProductId) {
    url = `${API_URL}/products/${editingProductId}`;
    method = "PATCH";
  }
const selectedTags = [];

document
.querySelectorAll(".tag-checkbox:checked")
.forEach(cb=>{
  selectedTags.push(cb.value);
});

const customTags = document
.getElementById("customTags")
.value
.split(",")
.map(t=>t.trim())
.filter(Boolean);

formData.append(
"selectedTags",
JSON.stringify(selectedTags)
);

formData.append(
"customTags",
JSON.stringify(customTags)
);
  const res = await fetch(url, {
    method: method,
    body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  clearForm();

  loadProducts();

}

// EDIT PRODUCT
async function editProduct(id) {

  const res = await fetch(`${API_URL}/products/${id}`);

  const data = await res.json();

  const product = data.product;

  document.getElementById("productName").value =
    product.nameProduct;

  editor.setData(product.description || "");

  document.getElementById("categorySelect").value =
    product.idCategory?._id;

  oldImages = product.images || [];

  editingProductId = id;
 // RESET checkbox
  document.querySelectorAll(".tag-checkbox")
  .forEach(cb => cb.checked = false);

  // SET selectedTags
  if(product.selectedTags){

    product.selectedTags.forEach(tag=>{

      const checkbox = document.querySelector(
        `.tag-checkbox[value="${tag}"]`
      );

      if(checkbox) checkbox.checked = true;

    });

  }

  // SET customTags
  if(product.customTags){

    document.getElementById("customTags").value =
      product.customTags.join(", ");

  }
}

// DELETE
async function deleteProduct(id) {

  if (!confirm("Bạn chắc chắn muốn xóa?")) return;

  await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE"
  });

  loadProducts();

}

// VARIANTS
function goToVariants(productId) {

  window.location.href =
    `/admin/variants.html?id=${productId}`;

}

// PAGINATION
function nextPage() {

  if (page < totalPages) {

    page++;

    loadProducts();

  }

}

function prevPage() {

  if (page > 1) {

    page--;

    loadProducts();

  }

}

// RESET FORM
function clearForm() {

  editingProductId = null;

  oldImages = [];

  document.getElementById("productName").value = "";

  editor.setData("");

  document.getElementById("productImages").value = "";
document
.querySelectorAll(".tag-checkbox")
.forEach(cb => cb.checked = false);

document.getElementById("customTags").value = "";
}

// INIT
loadCategoriesToSelect();
loadProducts();