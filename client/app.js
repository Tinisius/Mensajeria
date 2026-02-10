import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
import { HEXbright, ModBright } from "./utils.js";

const socket = io();

let USER;
let USER_COLOR;
let USER_FONT;

function renderMessage(msg, color, font) {
  const messageEl = document.createElement("div");
  messageEl.className = "message";
  messageEl.textContent = msg;
  messageEl.style.backgroundColor = color;
  messageEl.style.color = font;

  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function login(username) {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("chatContainer").style.display = "flex";
  socket.emit("join", username, ModBright(USER_COLOR, -30), USER_FONT);
}

const loginBtn = document.getElementById("loginBtn");
const loginInput = document.getElementById("loginInput");
const colorPicker = document.getElementById("colorPicker");

loginBtn.addEventListener("click", () => {
  const username = loginInput.value.trim();
  const color = colorPicker.value;

  if (username && username.length < 20) {
    if (HEXbright(color) < 128) USER_FONT = "#ececec";
    else USER_FONT = "#3b3b3b";
    USER = username;
    USER_COLOR = color;
    login(username);
  } else alert("el nombre debe tener entre 1 y 20 caracteres!");
});

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

socket.on("connect", () => {
  console.log("Conectado al servidor");
});

socket.on("history", (historyMessages) => {
  messagesDiv.innerHTML = "";

  historyMessages.forEach((item) => {
    renderMessage(item.text, item.color, item.font);
  });
});

socket.on("join", (username, color, font) => {
  const JoinMsg = document.createElement("div");
  JoinMsg.className = "join";
  JoinMsg.textContent = `${username} se ha unido`;
  JoinMsg.style.backgroundColor = color;
  JoinMsg.style.color = font;
  messagesDiv.appendChild(JoinMsg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on("message", (msg, color, font) => {
  renderMessage(msg, color, font);
});

sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit("message", USER + ": " + message, USER_COLOR, USER_FONT);
    messageInput.value = "";
    messageInput.focus();
  }
});

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

socket.on("disconnect", () => {
  console.log("Desconectado del servidor");
});
