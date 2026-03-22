const BASE = "https://ecommerce-backend-w960.onrender.com/api";
const API_URL = `${BASE}/banners`;
// LOAD BANNERS
async function loadBanners(){

const res = await fetch(API_URL);
const banners = await res.json();

const tbody = document.querySelector("#banner-table tbody");

tbody.innerHTML = "";

banners.forEach(banner => {

tbody.innerHTML += `
<tr>

<td>
<img src="${banner.image}" width="120">
</td>

<td>${banner.title || ""}</td>

<td>${banner.order}</td>

<td>${banner.status ? "Active" : "Hidden"}</td>

<td>
<button onclick="editBanner('${banner._id}')">Edit</button>
<button onclick="deleteBanner('${banner._id}')">Delete</button>
</td>

</tr>
`;

});

}

loadBanners();


// ADD BANNER
async function addBanner(){

const image = document.getElementById("image").files[0];
if (!image) {
  alert("Chọn ảnh");
  return;
}

if (image.size > 2 * 1024 * 1024) {
  alert("Ảnh phải nhỏ hơn 2MB ");
  return;
}
const title = document.getElementById("title").value;
const link = document.getElementById("link").value;
const order = document.getElementById("order").value;

const formData = new FormData();

formData.append("image", image);
formData.append("title", title);
formData.append("link", link);
formData.append("order", order);

await fetch(API_URL,{
method:"POST",
 headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
  },
body:formData
});

document.getElementById("title").value="";
document.getElementById("link").value="";
document.getElementById("order").value="";
document.getElementById("image").value="";

loadBanners();

}

async function editBanner(id){

const title = prompt("New title");
const link = prompt("New link");
const order = prompt("New order");

await fetch(`${API_URL}/${id}`,{
method:"PUT",
headers:{
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
title,
link,
order
})
});

loadBanners();

}

// DELETE
async function deleteBanner(id){

if(!confirm("Delete banner?")) return;

await fetch(`${API_URL}/${id}`,{
method:"DELETE",headers:{ 
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
},
});

loadBanners();

}