const API_URL = "http://localhost:5000/api/products";

const ITEMS_PER_PAGE = 40;

let currentPage = 1;
let totalPages = 1;
let products = [];


const params = new URLSearchParams(window.location.search);
const searchQuery = params.get("q") || "";


async function fetchProducts(page = 1){

try{

const urlParams = new URLSearchParams();

urlParams.append("page",page);
urlParams.append("limit",ITEMS_PER_PAGE);

if(searchQuery){
urlParams.append("search",searchQuery);
}

const res = await fetch(`${API_URL}?${urlParams.toString()}`);

const data = await res.json();

products = data.products;

currentPage = data.page;

totalPages = data.totalPages;

renderProducts();

renderPagination();

updateTitle(data.total);

}catch(error){
console.error(error);
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

function updateTitle(total){

const count = document.getElementById("search-count");

if(!searchQuery) return;

if(total === 0){

count.innerHTML = `
Không tìm thấy nội dung với từ khóa "<b>${searchQuery}</b>".
<br>
Vui lòng tìm kiếm với từ khóa khác.
`;

}else{

count.innerText = `Tìm thấy ${total} kết quả với từ khóa "${searchQuery}"`;

}

}



function renderProducts(){

const productList = document.getElementById("products-list");
productList.innerHTML = "";

// Không có sản phẩm
if (!products.length) {

document.getElementById("pagination").innerHTML = "";

return;

}

products.forEach(product=>{

const img = product.images?.[0] || "no-image.png";

const price = product.minPrice
? product.minPrice.toLocaleString()
: "Liên hệ";

// 🔥 build tag
const badges = buildBadges(product);

const badgeHTML = badges
.map(tag => `<span class="product__badge">${tag}</span>`)
.join("");

productList.innerHTML += `

<div class="product__item"
onclick="goToDetail('${product.slug}')">

<div class="product__image">

<img src="${img}">

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



function renderPagination(){

const pagination = document.getElementById("pagination");

pagination.innerHTML="";

for(let i=1;i<=totalPages;i++){

const btn=document.createElement("button");

btn.innerText=i;

if(i===currentPage){
btn.classList.add("active");
}

btn.onclick=()=>{

fetchProducts(i);

window.scrollTo({
top:0,
behavior:"smooth"
});

};

pagination.appendChild(btn);

}

}



function goToDetail(slug){

window.location.href=`/${slug}`;

}


fetchProducts();