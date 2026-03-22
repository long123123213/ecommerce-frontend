const BASE = "https://ecommerce-backend-w960.onrender.com/api";
const API_URL = `${BASE}/products`;
const ITEMS_PER_PAGE = 40;

let currentPage = 1;
let totalPages = 1;
let products = [];

/* =========================
   LOAD FILTER OPTIONS
========================= */

async function loadFilters() {
  try {

    const res = await fetch(`${API_URL}/filters`);
    const data = await res.json();

    const sizeSelect = document.getElementById("filter-size");
    const colorSelect = document.getElementById("filter-color");
    const categorySelect = document.getElementById("filter-category");

    sizeSelect.innerHTML = `<option value="">Kích thước</option>`;
    colorSelect.innerHTML = `<option value="">Màu sắc</option>`;
    categorySelect.innerHTML = `<option value="">Loại</option>`;

    data.sizes.forEach(size => {
      sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
    });

    data.colors.forEach(color => {
      colorSelect.innerHTML += `<option value="${color}">${color}</option>`;
    });

    data.categories.forEach(cat => {
      categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    });

  } catch (error) {
    console.error("Load filters error:", error);
  }
}

function buildBadges(product) {

  let badges = [];

  // =========================
  // PCS / SOLD OUT
  // =========================
  if (product.selectedTags?.includes("PCS")) {

    if (product.totalStock > 0) {
      badges.push(`${product.totalStock} PCS`);
    } else {
      badges.push("SOLD OUT");
    }

  }

  // =========================
  // admin tags
  // =========================
  if (product.selectedTags) {
    product.selectedTags.forEach(tag => {
      if (tag !== "PCS") {
        badges.push(tag);
      }
    });
  }

  // =========================
  // custom tags
  // =========================
  if (product.customTags) {
    badges.push(...product.customTags);
  }

  // tối đa 3 tag
  return badges.slice(0, 3);
}

/* =========================
   GET FILTER VALUES
========================= */

function getFilters() {
  return {
    size: document.getElementById("filter-size").value,
    color: document.getElementById("filter-color").value,
    category: document.getElementById("filter-category").value,
    price: document.getElementById("filter-price").value,
    sort: document.getElementById("filter-sort").value
  };
}

/* =========================
   UPDATE URL
========================= */

function updateURL(page) {

  const filters = getFilters();

  const params = new URLSearchParams();

  params.set("page", page);

  if (filters.size) params.set("size", filters.size);
  if (filters.color) params.set("color", filters.color);
  if (filters.category) params.set("category", filters.category);
  if (filters.price) params.set("price", filters.price);
  if (filters.sort) params.set("sort", filters.sort);

  const newURL = `/shop?${params.toString()}`;

  window.history.pushState({}, "", newURL);

}

/* =========================
   READ URL PARAMETERS
========================= */

function getParamsFromURL() {

  const params = new URLSearchParams(window.location.search);

  return {
    page: parseInt(params.get("page")) || 1,
    size: params.get("size") || "",
    color: params.get("color") || "",
    category: params.get("category") || "",
    price: params.get("price") || "",
    sort: params.get("sort") || ""
  };

}

/* =========================
   APPLY URL FILTERS TO UI
========================= */

function applyURLFilters() {

  const params = getParamsFromURL();

  document.getElementById("filter-size").value = params.size;
  document.getElementById("filter-color").value = params.color;
  document.getElementById("filter-category").value = params.category;
  document.getElementById("filter-price").value = params.price;
  document.getElementById("filter-sort").value = params.sort;

  currentPage = params.page;

}

/* =========================
   FETCH PRODUCTS
========================= */

async function fetchProducts(page = 1) {

  try {

    const filters = getFilters();
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", ITEMS_PER_PAGE);

    if (filters.size) params.append("size", filters.size);
    if (filters.color) params.append("color", filters.color);
    if (filters.category) params.append("category", filters.category);
    if (filters.price) params.append("price", filters.price);
    if (filters.sort) params.append("sort", filters.sort);

    updateURL(page);

    const res = await fetch(`${API_URL}?${params.toString()}`);
    const data = await res.json();

    products = data.products;
    currentPage = data.page;
    totalPages = data.totalPages;

    renderProducts();
    renderPagination();

  } catch (error) {
    console.error("Fetch products error:", error);
  }

}

/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts() {

  const productList = document.getElementById("products-list");
  productList.innerHTML = "";

  if (!products.length) {
    productList.innerHTML = "<p>Không có sản phẩm</p>";
    return;
  }

  products.forEach(product => {

    const firstImage = product.images?.[0] || "no-image.png";

    const price = product.minPrice
      ? product.minPrice.toLocaleString()
      : "Liên hệ";

    // 🔥 BUILD TAG
    const badges = buildBadges(product);

    const badgeHTML = badges
      .map(tag => `<span class="product__badge">${tag}</span>`)
      .join("");

    productList.innerHTML += `
    
    <div class="product__item"
    onclick="goToDetail('${product.slug}')">

      <div class="product__image">

        <img src="${firstImage}" alt="${product.nameProduct}">

        <div class="product__badges">
          ${badgeHTML}
        </div>

      </div>

      <h3 class="product__name">
        ${product.nameProduct}
      </h3>

      <div class="product__price">
        ${price} VND
      </div>

    </div>
    
    `;

  });

}

/* =========================
   PAGINATION
========================= */

function renderPagination() {

  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {

    const button = document.createElement("button");

    button.innerText = i;

    if (i === currentPage) {
      button.classList.add("active");
    }

    button.onclick = () => {

      fetchProducts(i);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    };

    pagination.appendChild(button);

  }

}


function resetFilters(){

document.getElementById("filter-size").value=""
document.getElementById("filter-color").value=""
document.getElementById("filter-category").value=""
document.getElementById("filter-price").value=""
document.getElementById("filter-sort").value=""

fetchProducts(1)

}
/* =========================
   APPLY FILTER
========================= */

function applyFilters() {
  fetchProducts(1);
}

/* =========================
   EVENTS
========================= */

function setupEvents() {

  document
    .getElementById("filter-size")
    .addEventListener("change", applyFilters);

  document
    .getElementById("filter-color")
    .addEventListener("change", applyFilters);

  document
    .getElementById("filter-category")
    .addEventListener("change", applyFilters);

  document
    .getElementById("filter-price")
    .addEventListener("change", applyFilters);

  document
    .getElementById("filter-sort")
    .addEventListener("change", applyFilters);
document
.getElementById("reset-filters")
.addEventListener("click", resetFilters);

}

/* =========================
   PRODUCT DETAIL
========================= */

function goToDetail(slug) {
  window.location.href = `/${slug}`;
}

/* =========================
   INIT
========================= */

async function init() {

  setupEvents();

  await loadFilters();

  applyURLFilters();

  fetchProducts(currentPage);

}

init();

/* =========================
   BACK/FORWARD BROWSER
========================= */

window.addEventListener("popstate", () => {

  applyURLFilters();

  fetchProducts(currentPage);

});

