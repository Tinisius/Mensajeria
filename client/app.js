import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
import { HEXbright, ModBright, showAlert } from "./utils.js";

const socket = io();

let USER;
let USER_COLOR;
let USER_FONT;

//2.0 para renderizar todos los mensajes de la base de datos (simplifica el cliente tambien)
function renderMessage(msg, color, font, type = "message") {
  const messageEl = document.createElement("div");
  messageEl.className = type; //message - join
  messageEl.textContent = type === "message" ? msg : `${msg} se ha unido`;
  messageEl.style.backgroundColor = color;
  messageEl.style.color = font;

  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function EnterChat(username) {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("chatContainer").style.display = "flex";
  socket.emit("join", username, ModBright(USER_COLOR, -30), USER_FONT);
}

const loginInput = document.getElementById("loginInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const signInBtn = document.getElementById("signInBtn");
const colorPicker = document.getElementById("colorPicker");

//login
loginBtn.addEventListener("click", () => {
  const username = loginInput.value.trim();
  const password = passwordInput.value.trim();
  const color = colorPicker.value;

  //3.0 valida el nombre y la contraseña
  if (username && username.length < 20) {
    socket.emit("logIn", username, password, (validation) => {
      if (validation) {
        if (HEXbright(color) < 128) USER_FONT = "#ececec";
        else USER_FONT = "#3b3b3b";
        USER = username;
        USER_COLOR = color;
        EnterChat(username);
      } else showAlert("Usuario o contraseña incorrectos!");
    });
  } else showAlert("el nombre debe tener entre 1 y 20 caracteres!");
});

//signIn
signInBtn.addEventListener("click", () => {
  const username = loginInput.value.trim();
  const password = passwordInput.value.trim();
  const color = colorPicker.value;

  //3.0 valida que el nombre no exista
  if (username && username.length < 20) {
    if (password && password.length < 20) {
      socket.emit("signIn", username, password, (validation) => {
        if (validation) {
          showAlert("usuario creado correctamente");
          if (HEXbright(color) < 128) USER_FONT = "#ececec";
          else USER_FONT = "#3b3b3b";
          USER = username;
          USER_COLOR = color;
          EnterChat(username);
        } else showAlert("Usuario ya existe!");
      });
    } else showAlert("la contraseña debe tener entre 1 y 20 caracteres!");
  } else showAlert("el nombre debe tener entre 1 y 20 caracteres!");
});

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

socket.on("connect", () => {
  console.log("Conectado al servidor");
});

//2.0 se llama al iniciar sesion (join)
socket.on("history", (historyMessages) => {
  messagesDiv.innerHTML = "";
  //renderiza todos los mensajes de la DB
  historyMessages.forEach((item) => {
    renderMessage(item.text, item.color, item.font, item.type);
  });
});

socket.on("join", (username, color, font) => {
  renderMessage(username, color, font, "join");
});

socket.on("message", (msg, color, font) => {
  renderMessage(msg, color, font);
});

sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message && USER) {
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
