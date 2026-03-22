const BASE = "https://ecommerce-backend-w960.onrender.com/api";
const API_URL = BASE;

async function loadUsers() {

  const token = localStorage.getItem("adminToken");

  if (!token) {
    alert("Admin chưa đăng nhập");
    return;
  }

  const res = await fetch(`${API_URL}/users`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const users = await res.json();

  const table = document.getElementById("userTable");

  table.innerHTML = "";

  users.forEach(user => {

    table.innerHTML += `
    
    <tr>
      <td>${user.name || ""}</td>
      <td>${user.email}</td>
      <td>${user.phone || ""}</td>

      <td>
        <select onchange="changeRole('${user._id}', this.value)">
          <option value="USER" ${user.role === "USER" ? "selected" : ""}>USER</option>
          <option value="ADMIN" ${user.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
        </select>
      </td>

      <td>
      <button onclick="editUser('${user._id}','${user.name}','${user.phone || ""}')">Sửa</button>
        <button onclick="deleteUser('${user._id}')">Xóa</button>
      </td>

    </tr>

    `;

  });

}

loadUsers();



async function deleteUser(id) {

  const token = localStorage.getItem("adminToken");

  if (!confirm("Bạn có chắc muốn xóa user?")) return;

  await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  loadUsers();
}

async function editUser(id, name, phone){

  const newName = prompt("Tên mới:", name);
  const newPhone = prompt("Số điện thoại:", phone);
  const newPassword = prompt("Mật khẩu mới (bỏ trống nếu không đổi):");

  if(!newName) return;

  const token = localStorage.getItem("adminToken");

  const bodyData = {
    name: newName,
    phone: newPhone
  };

  if(newPassword){
    bodyData.password = newPassword;
  }

  await fetch(`${API_URL}/users/${id}`,{

    method:"PUT",

    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer " + token
    },

    body:JSON.stringify(bodyData)

  });

  loadUsers();

}

async function changeRole(id, role) {

  const token = localStorage.getItem("adminToken");

  await fetch(`${API_URL}/users/${id}`, {

    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },

    body: JSON.stringify({
      role
    })

  });

}