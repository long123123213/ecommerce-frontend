


  const API_URL = "http://localhost:5000/api/products";
  const BANNER_API = "http://localhost:5000/api/banners";
const ITEMS_PER_PAGE = 40;

let allProducts = [];
let currentPage = 1;

// ==============================
// Lấy page từ URL
// ==============================
function getPageFromURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get("page")) || 1;
}

// ==============================
// Cập nhật URL không reload
// ==============================
function updateURL(page) {
  const newURL = `?page=${page}`;
  window.history.pushState({ page }, "", newURL);
}

// ==============================
// Fetch sản phẩm
// ==============================
async function fetchProducts() {
  try {

    currentPage = getPageFromURL();

    const res = await fetch(`${API_URL}?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
    const data = await res.json();

    allProducts = data.products;

    renderProducts();

    renderPagination(data.totalPages);

  } catch (error) {
    console.error("Lỗi fetch:", error);
  }
}
// ==============================
// Render sản phẩm
// ==============================
function renderProducts() {

  const productList = document.getElementById("products-list");
  productList.innerHTML = "";

  const productsToShow = allProducts;

  productsToShow.forEach(product => {

    const firstImage = product.images[0] || "default.jpg";

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
    badges = badges.slice(0,3);

    const badgeHTML = badges
.map(tag => `<span class="product__badge">${tag}</span>`)
.join("");

const html = `
<div class="product__item" onclick="goToDetail('${product.slug}')">

  <div class="product__image">

    <img src="${firstImage}" alt="${product.nameProduct}">

    <div class="product__badges">
      ${badgeHTML}
    </div>

  </div>

  <h3 class="product__name">${product.nameProduct}</h3>

  <div class="product__price">
    ${product.minPrice || "Liên hệ"} VND
  </div>

</div>
`;

    productList.innerHTML += html;

  });

}

// ==============================
// Render phân trang
// ==============================
function renderPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.innerText = i;

    if (i === currentPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      currentPage = i;
      updateURL(i);
      fetchProducts();   // 🔥 gọi lại API
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    pagination.appendChild(button);
  }
}

function initSwiper(){

  new Swiper(".mySwiper", {
    loop: true,
    autoplay: {
      delay: 3000,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

}

async function loadBanners(){

  const res = await fetch(BANNER_API);
  const banners = await res.json();

  const bannerList = document.getElementById("banner-list");

  bannerList.innerHTML = "";

  banners.forEach(banner => {

    bannerList.innerHTML += `
      <div class="swiper-slide">
        <a href="${banner.link || '#'}">
          <img src="${banner.image}">
        </a>
      </div>
    `;

  });

  initSwiper();

}
function goToDetail(slug) {
  window.location.href = `/${slug}`;
}

// ==============================
// Khi back / forward trình duyệt
// ==============================
window.addEventListener("popstate", (event) => {
  currentPage = getPageFromURL();
  renderProducts();
  renderPagination();
});

// ==============================
// Khởi chạy
// ==============================
loadBanners();
fetchProducts();
