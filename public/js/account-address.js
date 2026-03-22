document.addEventListener("DOMContentLoaded", function () {

const API_URL = "http://localhost:5000/api";

let editingId = null;

const modal = document.getElementById("address-modal");

if(!modal) return;


// ===============================
// VALIDATE
// ===============================

function validateAddress(data) {
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
    errors.phone = "Số điện thoại không được để trống";
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

  const phoneRegex = /^(0|\+84)[3-9][0-9]{8}$/;
  if (data.phone && !phoneRegex.test(data.phone)) {
    errors.phone = "Số điện thoại không hợp lệ";
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

// clear lỗi khi nhập lại
document.querySelectorAll("input").forEach(input => {
  input.addEventListener("input", () => {
    const err = input.parentNode.querySelector(".error-text");
    if (err) err.remove();
  });
});


// ===============================
// LOAD ADDRESS
// ===============================

async function loadAddresses(){

const token = localStorage.getItem("token");

const res = await fetch(`${API_URL}/addresses`,{
headers:{ Authorization:`Bearer ${token}` }
});

const addresses = await res.json();

const list = document.getElementById("address-list");

if(addresses.length === 0){
list.innerHTML = "<p>Chưa có địa chỉ</p>";
return;
}

list.innerHTML="";

addresses.forEach(addr=>{

list.innerHTML += `

<div class="address-item">

<p>
<b>${addr.receiverName}</b>
${addr.isDefault ? "<span style='color:green'>(Mặc định)</span>" : ""}
</p>

<p>${addr.phone}</p>

<p>${addr.addressLine}, ${addr.ward}, ${addr.district}, ${addr.city}</p>

<div class="address-actions">

<button onclick="editAddress('${addr._id}')">Sửa</button>
<button onclick="setDefaultAddress('${addr._id}')">Đặt mặc định</button>
<button onclick="deleteAddress('${addr._id}')">Xóa</button>

</div>

</div>

`;

});

}

loadAddresses();


// ===============================
// ADD ADDRESS
// ===============================

const addBtn = document.getElementById("add-address-btn");

if(addBtn){
addBtn.onclick = ()=>{
editingId = null;

// reset form
document.querySelectorAll("#address-modal input").forEach(i => i.value = "");
document.querySelectorAll(".error-text").forEach(e => e.remove());

document.getElementById("modal-title").innerText="Thêm địa chỉ";
modal.style.display="flex";
};
}


// ===============================
// SAVE ADDRESS
// ===============================

const saveBtn = document.getElementById("save-address");

if(saveBtn){
saveBtn.onclick = async ()=>{

const token = localStorage.getItem("token");

const data = {
receiverName:document.getElementById("receiverName").value,
phone:document.getElementById("phone").value,
addressLine:document.getElementById("addressLine").value,
ward:document.getElementById("ward").value,
district:document.getElementById("district").value,
city:document.getElementById("city").value
};

const errors = validateAddress(data);

if (Object.keys(errors).length > 0) {
  showErrors(errors);
  return;
}

let url = `${API_URL}/addresses`;
let method = "POST";

if(editingId){
url = `${API_URL}/addresses/${editingId}`;
method = "PUT";
}

await fetch(url,{
method,
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify(data)
});

modal.style.display="none";
editingId=null;
loadAddresses();

};
}


// ===============================
// CANCEL
// ===============================

const cancelBtn = document.getElementById("cancel-address");

if(cancelBtn){
cancelBtn.onclick = ()=>{
modal.style.display="none";
editingId=null;
};
}


// ===============================
// GLOBAL FUNCTIONS
// ===============================

window.deleteAddress = async function(id){

const token = localStorage.getItem("token");

await fetch(`${API_URL}/addresses/${id}`,{
method:"DELETE",
headers:{ Authorization:`Bearer ${token}` }
});

loadAddresses();

}


window.setDefaultAddress = async function(id){

const token = localStorage.getItem("token");

await fetch(`${API_URL}/addresses/default/${id}`,{
method:"PUT",
headers:{ Authorization:`Bearer ${token}` }
});

loadAddresses();

}


window.editAddress = async function(id){

const token = localStorage.getItem("token");

const res = await fetch(`${API_URL}/addresses`,{
headers:{ Authorization:`Bearer ${token}` }
});

const addresses = await res.json();

const addr = addresses.find(a=>a._id === id);

editingId=id;

document.getElementById("receiverName").value = addr.receiverName;
document.getElementById("phone").value = addr.phone;
document.getElementById("addressLine").value = addr.addressLine;
document.getElementById("ward").value = addr.ward;
document.getElementById("district").value = addr.district;
document.getElementById("city").value = addr.city;

document.getElementById("modal-title").innerText="Chỉnh sửa địa chỉ";

modal.style.display="flex";

}

});