const socket = io("https://ecommerce-backend-w960.onrender.com");

let currentUser = null;

const userList = document.getElementById("userList");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatHeader = document.getElementById("chatHeader");

const admin = JSON.parse(localStorage.getItem("adminUser"));
const adminToken = localStorage.getItem("adminToken");


// ================= LOAD USER LIST =================

async function loadUsers() {

  try {

    const res = await fetch("https://ecommerce-backend-w960.onrender.com/api/chat/admin/conversations", {
      headers: {
        Authorization: "Bearer " + adminToken
      }
    });

    const data = await res.json();

    console.log("Users:", data);

    userList.innerHTML = "";

    data.forEach(item => {

      const li = document.createElement("li");

      const userName = item.idUser?.name || "Unknown";

      li.innerText = userName;

      li.style.cursor = "pointer";

      li.onclick = () => selectUser({
        userId: item.idUser._id,
        name: userName,
        conversationId: item.idConversation._id
      });

      userList.appendChild(li);

    });

  } catch (err) {
    console.log("Load users error:", err);
  }

}


// ================= SELECT USER =================

async function selectUser(user) {

  currentUser = user;

  chatHeader.innerText = "Chat với: " + user.name;

  chatMessages.innerHTML = "";

  socket.emit("joinConversation", user.conversationId);

  try {

    const res = await fetch(
      `https://ecommerce-backend-w960.onrender.com/api/chat/messages/${user.conversationId}`,
      {
        headers: {
          Authorization: "Bearer " + adminToken
        }
      }
    );

    const messages = await res.json();

    messages.forEach(msg => addMessage(msg));

  } catch (err) {
    console.log("Load messages error:", err);
  }

}


// ================= RENDER MESSAGE =================

function addMessage(msg) {

  const senderId = msg?.idUser?._id || msg?.idUser;

  const div = document.createElement("div");

  const name = document.createElement("div");
  name.className = "message-name";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.innerText = msg.content;

  if (senderId === admin.id) {

    div.className = "message admin";
    name.innerText = "ADMIN";

  } else {

    div.className = "message user";
    name.innerText = msg?.idUser?.name || "Khách";

  }

  div.appendChild(name);
  div.appendChild(bubble);

  chatMessages.appendChild(div);

  chatMessages.scrollTop = chatMessages.scrollHeight;

}


// ================= SEND MESSAGE =================

function sendMessage() {

  const message = messageInput.value.trim();

  if (!message || !currentUser) return;

  socket.emit("sendMessage", {
    conversationId: currentUser.conversationId,
    userId: admin.id,
    content: message,
    type: "TEXT"
  });

  messageInput.value = "";

}

sendBtn.onclick = sendMessage;

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});


// ================= SOCKET RECEIVE =================

socket.on("newMessage", (msg) => {

  if (!currentUser) return;

  if (msg.idConversation === currentUser.conversationId) {
    addMessage(msg);
  }

});


// ================= INIT =================

loadUsers();