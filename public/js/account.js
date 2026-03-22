const API_URL = "http://localhost:5000/api";

// ===============================
// LOAD USER
// ===============================

async function loadUser(){

const token = localStorage.getItem("token");

if(!token){
window.location.href="/login";
return;
}

const res = await fetch(`${API_URL}/auth/me`,{
headers:{ Authorization:`Bearer ${token}` }
});

const user = await res.json();

document.getElementById("sidebar-name").innerText = user.name;
document.getElementById("hello-user").innerText = `Xin chào, ${user.name}`;
document.getElementById("account-name").innerText = user.name;
document.getElementById("account-email").innerText = user.email;
document.getElementById("loyalty").innerText = user.loyaltyPoints;

}

loadUser();



// ===============================
// TAB SWITCH
// ===============================

const tabs = document.querySelectorAll(".account-sidebar li[data-tab]");

tabs.forEach(tab=>{

tab.onclick = ()=>{

document.querySelectorAll(".account-sidebar li")
.forEach(li=>li.classList.remove("active"));

tab.classList.add("active");

const tabName = tab.dataset.tab;

document.querySelectorAll(".tab")
.forEach(t=>t.classList.remove("active"));

document.getElementById(tabName).classList.add("active");

};

});



// ===============================
// LOGOUT
// ===============================

document.getElementById("logout-btn").onclick = ()=>{

localStorage.removeItem("token");
localStorage.removeItem("user");

window.location.href="/";

};