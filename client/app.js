import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

const socket = io(); // Se conecta al servidor automáticamente

//-------------------------------------------------- Interfaz de login ------------------------------------------------------------

let USER;

function login(username) {
  // Ocultar formulario de login
  document.getElementById("loginContainer").style.display = "none";
  // Mostrar interfaz de chat
  document.getElementById("chatContainer").style.display = "flex"; // o "block"
  // Mensaje de bienvenida

  socket.emit("join", username); //avisa a los usuarios que alguien se unió
}

const loginBtn = document.getElementById("loginBtn");
const loginInput = document.getElementById("loginInput");
loginBtn.addEventListener("click", () => {
  const username = loginInput.value.trim(); //obtenemos el valor del input (mensaje)
  if (username && username.length < 20) {
    USER = username; //guarda el nombre de forma global
    login(username);
  } else {
    alert("el nombre debe tener entre 1 y 20 caracteres!");
  }
});

//-------------------------------------------------- Luego del login ------------------------------------------------------------

//creamos instancias de los elementos HTML
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Conectar al servidor
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

socket.on("join", (username) => {
  const JoinMsg = document.createElement("div");
  JoinMsg.className = "join";
  JoinMsg.textContent = `${username} se ha unido`;
  messagesDiv.appendChild(JoinMsg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Al recibir mensajes del servidor
socket.on("message", (msg) => {
  //crea el elemento del mensaje
  const messageEl = document.createElement("div");
  messageEl.className = "message";
  messageEl.textContent = msg;
  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Enviar mensaje
sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim(); //obtenemos el valor del input (mensaje)
  if (message) {
    socket.emit("message", USER + ": " + message); //Transmite el mensaje a todos los usuarios conectados
    messageInput.value = "";
    messageInput.focus(); //selecciona el input
  }
});

// Enviar con Enter
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// Manejar desconexión
socket.on("disconnect", () => {
  console.log("Desconectado del servidor");
});
