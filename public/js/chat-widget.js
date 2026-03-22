const BASE = "https://ecommerce-backend-w960.onrender.com/api";
const API_URL = `${BASE}/chat`;
(function () {

const socket = io("https://ecommerce-backend-w960.onrender.com");

let conversationId = null;

const token = localStorage.getItem("token");

// lấy user từ localStorage
let userId = null;
const userData = localStorage.getItem("user");

if (userData) {
    try {
        const user = JSON.parse(userData);
        userId = user.id || user._id;
    } catch (e) {
        console.log("Parse user error");
    }
}

if (!userId) {
    console.log("Không có userId trong localStorage");
}

// ================= UI =================

const chatHTML = `
<div id="chat-widget">

<div id="chat-button">💬</div>

<div id="chat-box">

<div id="chat-header">
Chat với shop
<span id="chat-close">✖</span>
</div>

<div id="chat-messages"></div>

<div id="chat-input-area">
<input id="chat-input" placeholder="Nhập tin nhắn..."/>
<button id="chat-send">Gửi</button>
</div>

</div>

</div>
`;

document.body.insertAdjacentHTML("beforeend", chatHTML);

// ================= CSS =================

const style = document.createElement("style");

style.innerHTML = `

#chat-widget{
position:fixed;
bottom:20px;
right:20px;
font-family:Arial;
z-index:9999;
}

/* BUTTON */

#chat-button{
width:60px;
height:60px;
background:#ff4d4f;
color:white;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:28px;
cursor:pointer;
box-shadow:0 4px 10px rgba(0,0,0,0.2);
}

/* BOX */

#chat-box{
width:320px;
height:420px;
background:white;
border-radius:12px;
box-shadow:0 0 15px rgba(0,0,0,0.25);
display:none;
flex-direction:column;
overflow:hidden;
}

/* HEADER */

#chat-header{
background:#ff4d4f;
color:white;
padding:12px;
display:flex;
justify-content:space-between;
align-items:center;
font-weight:bold;
}

/* MESSAGES */

#chat-messages{
flex:1;
padding:12px;
overflow-y:auto;
display:flex;
flex-direction:column;
gap:8px;
background:#f5f5f5;
}

/* MESSAGE ROW */

.message-row{
display:flex;
flex-direction:column;
max-width:75%;
}

/* USER MESSAGE */

.message-me{
align-self:flex-end;
text-align:right;
}

/* ADMIN MESSAGE */

.message-other{
align-self:flex-start;
}

/* NAME */

.message-name{
font-size:11px;
margin-bottom:2px;
color:#666;
}

/* BUBBLE */

.message-bubble{
padding:8px 12px;
border-radius:16px;
font-size:14px;
line-height:1.4;
word-break:break-word;
}

/* USER BUBBLE */

.message-me .message-bubble{
background:#ff4d4f;
color:white;
border-bottom-right-radius:4px;
}

/* ADMIN BUBBLE */

.message-other .message-bubble{
background:white;
border:1px solid #e5e5e5;
border-bottom-left-radius:4px;
}

/* INPUT */

#chat-input-area{
display:flex;
border-top:1px solid #eee;
}

#chat-input{
flex:1;
border:none;
padding:10px;
outline:none;
}

#chat-send{
width:70px;
border:none;
background:#ff4d4f;
color:white;
cursor:pointer;
}

`;

document.head.appendChild(style);

// ================= DOM =================

const chatButton = document.getElementById("chat-button");
const chatBox = document.getElementById("chat-box");
const chatClose = document.getElementById("chat-close");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

// open
chatButton.onclick = () => {
chatBox.style.display = "flex";
};

// close
chatClose.onclick = () => {
chatBox.style.display = "none";
};

// ================= INIT CHAT =================

async function initChat() {

if (!token) return;

try {
`${API_URL}/conversation`
const res = await fetch(`${API_URL}/conversation`, {
method: "POST",
headers: {
Authorization: "Bearer " + token
}
});

const data = await res.json();

if (!data || !data._id) {
console.log("Conversation không tạo được");
return;
}

conversationId = data._id;

socket.emit("joinConversation", conversationId);

loadMessages();

} catch (err) {
console.log("Init chat error:", err);
}

}

// ================= LOAD MESSAGES =================

async function loadMessages() {

if (!conversationId) return;

try {
const res = await fetch(`${API_URL}/messages/${conversationId}`, {
headers:{
Authorization:"Bearer "+token
}
});

const messages = await res.json();

if (!Array.isArray(messages)) return;

chatMessages.innerHTML="";

messages.forEach(renderMessage);

} catch (err) {
console.log("Load messages error:", err);
}

}

// ================= SEND MESSAGE =================

chatSend.onclick = sendMessage;

chatInput.addEventListener("keypress",(e)=>{
if(e.key==="Enter") sendMessage();
});

function sendMessage(){

const content = chatInput.value.trim();

if(!content) return;

if(!conversationId){
console.log("conversation chưa tạo");
return;
}

socket.emit("sendMessage",{
conversationId:conversationId,
userId:userId,
content:content,
type:"TEXT"
});

chatInput.value="";

}

// ================= SOCKET RECEIVE =================

socket.on("newMessage",(msg)=>{
renderMessage(msg);
});

// ================= RENDER MESSAGE =================

function renderMessage(msg){

if(!msg) return;

const senderId = msg?.idUser?._id || msg?.idUser;

const row = document.createElement("div");

const bubble = document.createElement("div");
bubble.className = "message-bubble";
bubble.innerText = msg.content;

const name = document.createElement("div");
name.className = "message-name";

if(senderId == userId){

    // tin nhắn của user
    row.className = "message-row message-me";
    name.innerText = "Bạn";

}else{

    // tin nhắn từ admin
    row.className = "message-row message-other";
    name.innerText = "ADMIN";

}

row.appendChild(name);
row.appendChild(bubble);

chatMessages.appendChild(row);

chatMessages.scrollTop = chatMessages.scrollHeight;

}

// ================= START =================

initChat();

})();