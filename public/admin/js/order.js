const BASE = "https://ecommerce-backend-w960.onrender.com/api";
const API_URL = BASE;

let allOrders = [];
let currentPage = 1;
const perPage = 5;

async function loadOrders(){

const token = localStorage.getItem("adminToken");

const res = await fetch(`${API_URL}/orders`,{
headers:{
Authorization:`Bearer ${token}`
}
});

const data = await res.json();
allOrders = data;

renderStats();

renderOrders();

}

function renderStats(){

document.getElementById("totalOrders").innerText = allOrders.length;

document.getElementById("pendingOrders").innerText =
allOrders.filter(o=>o.status==="PENDING").length;

document.getElementById("shippingOrders").innerText =
allOrders.filter(o=>o.status==="SHIPPING").length;

document.getElementById("doneOrders").innerText =
allOrders.filter(o=>o.status==="DONE").length;

}

function renderOrders(){

const list = document.getElementById("order-list");

let orders = filterOrders();

const start = (currentPage-1)*perPage;
const paginated = orders.slice(start,start+perPage);

list.innerHTML="";

paginated.forEach(order=>{

const date=new Date(order.createdAt)
.toLocaleDateString("vi-VN");

const items=order.items || [];

const itemsHtml = items.map(item=>{

const product=item.idProductVariant?.idProduct || {};
const variant=item.idProductVariant || {};

const img=product.images?.[0]
? product.images[0]
: "https://via.placeholder.com/60";

return`

<div class="order-item">

<img src="${img}">

<div class="order-item-info">
<div><b>${product.nameProduct}</b></div>
<div>Size ${variant.size} | ${variant.color}</div>
</div>

<div>x${item.quantity}</div>

<div>${item.price.toLocaleString()}₫</div>

</div>

`;

}).join("");

list.innerHTML+=`

<tr>

<td>#${order._id.slice(-6)}</td>

<td>
<b>${order.idUser?.name}</b><br>
${order.idUser?.email}
</td>

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
${order.shippingMethod || "COD"} 
</td>
<td>

<select class="status-select" data-id="${order._id}">
<option value="PENDING">PENDING</option>
<option value="CONFIRMED">CONFIRMED</option>
<option value="SHIPPING">SHIPPING</option>
<option value="DONE">DONE</option>
<option value="CANCEL">CANCEL</option>
</select>

<button class="view-order" data-id="${order._id}">
Chi tiết
</button>

</td>

</tr>

<tr class="order-detail" id="detail-${order._id}" style="display:none">

<td colspan="7">

<div class="order-products">

<div class="customer-box">

<div><b>Receiver:</b> ${order.receiverName}</div>
<div><b>Phone:</b> ${order.phone}</div>
<div><b>Address:</b> ${order.addressLine}, ${order.district}, ${order.city}</div>

</div>

${itemsHtml}

</div>

</td>

</tr>

`;

});

renderPagination(orders.length);

bindEvents();

}

function filterOrders(){

const search=document.getElementById("searchOrder").value.toLowerCase();

const status=document.getElementById("statusFilter").value;

return allOrders.filter(order=>{

const matchSearch=
order._id.includes(search) ||
order.idUser?.email?.toLowerCase().includes(search);

const matchStatus=
!status || order.status===status;

return matchSearch && matchStatus;

});

}

function renderPagination(total){

const pageCount=Math.ceil(total/perPage);

const container=document.getElementById("pagination");

container.innerHTML="";

for(let i=1;i<=pageCount;i++){

container.innerHTML+=`
<button class="page-btn ${i===currentPage?"active":""}" data-page="${i}">
${i}
</button>
`;

}

document.querySelectorAll(".page-btn").forEach(btn=>{
btn.onclick=()=>{
currentPage=Number(btn.dataset.page);
renderOrders();
}
});

}

function bindEvents(){

document.querySelectorAll(".view-order").forEach(btn=>{

btn.onclick=()=>{

const id=btn.dataset.id;

const row=document.getElementById("detail-"+id);

row.style.display=row.style.display==="none"
?"table-row"
:"none";

}

});

document.querySelectorAll(".status-select").forEach(select=>{

select.value=allOrders.find(o=>o._id===select.dataset.id).status;

select.onchange=async()=>{

const id=select.dataset.id;
const status=select.value;

await fetch(`${API_URL}/orders/${id}/status`,{

method:"PUT",

headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${localStorage.getItem("adminToken")}`
},

body:JSON.stringify({status})

});

loadOrders();

};

});

}

document.getElementById("searchOrder").oninput=()=>{
currentPage=1;
renderOrders();
};

document.getElementById("statusFilter").onchange=()=>{
currentPage=1;
renderOrders();
};

loadOrders();