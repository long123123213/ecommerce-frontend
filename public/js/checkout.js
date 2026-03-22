const API_URL = "http://localhost:5000/api";

let addressList = [];


/* ===============================
   VALIDATE
================================ */

function validateCheckout(data) {
  const errors = {};

  // trim
  for (let key in data) {
    if (typeof data[key] === "string") {
      data[key] = data[key].trim();
    }
  }

  if (!data.receiverName) {
    errors.receiverName = "Tên người nhận không được để trống";
  }

  if (!data.phone) {
    errors.phone = "SĐT không được để trống";
  } else {
    const phoneRegex = /^(0|\+84)[3-9][0-9]{8}$/;
    if (!phoneRegex.test(data.phone)) {
      errors.phone = "SĐT không hợp lệ";
    }
  }

  if (!data.addressLine) {
    errors.addressLine = "Địa chỉ không được để trống";
  }

  if (!data.ward) {
    errors.ward = "Phường/Xã không được để trống";
  }

  if (!data.district) {
    errors.district = "Quận/Huyện không được để trống";
  }

  if (!data.city) {
    errors.city = "Tỉnh/Thành phố không được để trống";
  }

  return errors;
}

function showErrors(errors) {
  document.querySelectorAll(".error-text").forEach(e => e.remove());

  for (let key in errors) {
    const input = document.getElementById(key);
    if (!input) continue;

    const error = document.createElement("p");
    error.className = "error-text";
    error.style.color = "red";
    error.style.fontSize = "12px";
    error.innerText = errors[key];

    input.parentNode.appendChild(error);
  }
}

// clear lỗi realtime
document.querySelectorAll("input").forEach(input => {
  input.addEventListener("input", () => {
    const err = input.parentNode.querySelector(".error-text");
    if (err) err.remove();
  });
});


/* ===============================
   LOAD CART
================================ */

async function loadCheckoutCart(){

const token = localStorage.getItem("token");

if(!token){
alert("Bạn cần đăng nhập");
window.location.href="/login";
return;
}

const res = await fetch(`${API_URL}/cart`,{
headers:{Authorization:"Bearer "+token}
});

const data = await res.json();
const items = data.items || [];

const container = document.getElementById("orderItems");
container.innerHTML="";

let subTotal = 0;
const shippingFee = 30000;

for(const item of items){

const variant = item.idProductVariant;
if(!variant) continue;

const productRes = await fetch(`${API_URL}/products/${variant.idProduct}`);
const productData = await productRes.json();
const product = productData.product;

const price = variant.price || 0;
const quantity = item.quantity || 0;

const itemTotal = price * quantity;

subTotal += itemTotal;

container.innerHTML += `
<div class="order-item">

<div class="order-product">

<img
src="${product.images?.[0]||""}"
onerror="this.src='default.png'"
>

<div class="order-info">
<p class="order-name">${product.nameProduct}</p>
<p>Size: ${variant.size}</p>
<p>Color: ${variant.color}</p>
<p>Số lượng: ${quantity}</p>
</div>

</div>

<div class="order-price">
${itemTotal.toLocaleString("vi-VN")} đ
</div>

</div>
`;
}

const total = subTotal + shippingFee;

document.getElementById("subTotal").innerText =
subTotal.toLocaleString("vi-VN")+" đ";

document.getElementById("orderTotal").innerText =
total.toLocaleString("vi-VN")+" đ";

}


/* ===============================
   LOAD USER EMAIL
================================ */

async function loadUserInfo(){

const token = localStorage.getItem("token");

const res = await fetch(`${API_URL}/auth/me`,{
headers:{Authorization:"Bearer "+token}
});

const user = await res.json();

if(user.email){
document.getElementById("email").value=user.email;
}

}


/* ===============================
   LOAD ADDRESS BOOK
================================ */

async function loadAddressBook(){

const token = localStorage.getItem("token");

const res = await fetch(`${API_URL}/addresses`,{
headers:{Authorization:"Bearer "+token}
});

const addresses = await res.json();

addressList = addresses;

const select = document.getElementById("addressBook");

select.innerHTML=`<option value="">Địa chỉ khác...</option>`;

addresses.forEach(addr=>{

const option=document.createElement("option");

option.value=addr._id;

option.textContent=
addr.receiverName+" - "+addr.addressLine;

select.appendChild(option);

if(addr.isDefault){
fillAddress(addr);
select.value=addr._id;
}

});

}


function fillAddress(addr){

document.getElementById("receiverName").value=addr.receiverName||"";
document.getElementById("phone").value=addr.phone||"";
document.getElementById("addressLine").value=addr.addressLine||"";
document.getElementById("city").value=addr.city||"";
document.getElementById("district").value=addr.district||"";
document.getElementById("ward").value=addr.ward||"";

}


document.addEventListener("change",function(e){

if(e.target.id==="addressBook"){

const id=e.target.value;

const addr=addressList.find(a=>a._id===id);

if(addr) fillAddress(addr);

}

});
//
function getSelectedPayment(){
  const checked = document.querySelector('input[name="payment"]:checked');
  return checked ? checked.value : "COD";
}

function handleCheckout(){

  const data = {
    receiverName:document.getElementById("receiverName").value,
    phone:document.getElementById("phone").value,
    addressLine:document.getElementById("addressLine").value,
    ward:document.getElementById("ward").value,
    district:document.getElementById("district").value,
    city:document.getElementById("city").value
  };

  const errors = validateCheckout(data);

  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    return; // ❌ KHÔNG disable button
  }

  // ✅ chỉ disable khi hợp lệ
  const btn = document.getElementById("checkoutBtn");
  btn.disabled = true;

  const method = getSelectedPayment();

  if(method === "VNPAY"){
    payVNPay();
  }else{
    placeOrder();
  }
}
/* ===============================
   PLACE ORDER
================================ */

async function placeOrder(){

const token = localStorage.getItem("token");

const data = {
receiverName:document.getElementById("receiverName").value,
phone:document.getElementById("phone").value,
addressLine:document.getElementById("addressLine").value,
ward:document.getElementById("ward").value,
district:document.getElementById("district").value,
city:document.getElementById("city").value
};

const errors = validateCheckout(data);

if (Object.keys(errors).length > 0) {
  showErrors(errors);
  return;
}

const res=await fetch(`${API_URL}/orders`,{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:"Bearer "+token
},
body:JSON.stringify({
...data,
shippingMethod:"COD",
shippingFee:30000
})
});

const result=await res.json();

if(!res.ok){
alert(result.message);
return;
}

alert("Đặt hàng thành công!");

window.location.href="/";

}
//
async function payVNPay(){

const token = localStorage.getItem("token");

const data = {
receiverName:document.getElementById("receiverName").value,
phone:document.getElementById("phone").value,
addressLine:document.getElementById("addressLine").value,
ward:document.getElementById("ward").value,
district:document.getElementById("district").value,
city:document.getElementById("city").value
};

// validate giống COD
const errors = validateCheckout(data);

if (Object.keys(errors).length > 0) {
  showErrors(errors);
  return;
}

// 1️⃣ tạo order
const resOrder = await fetch(`${API_URL}/orders`,{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:"Bearer "+token
},
body:JSON.stringify({
...data,
shippingMethod:"VNPAY",
shippingFee:30000
})
});

const result = await resOrder.json();
console.log("ORDER ERROR:", result);
if(!resOrder.ok){
alert(result.message);
return;
}

const order = result.order;


// 2️⃣ gọi VNPay
const res = await fetch(`${API_URL}/vnpay/create`,{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:"Bearer "+token
},
body:JSON.stringify({
orderId: order._id
})
});

if(!res.ok){
  alert("Lỗi tạo thanh toán");
  return;
}

const payment = await res.json();

if(!payment.paymentUrl){
  alert("Không tạo được link VNPay");
  return;
}

window.location.href = payment.paymentUrl;

}


/* ===============================
   INIT
================================ */

loadCheckoutCart();
loadUserInfo();
loadAddressBook();