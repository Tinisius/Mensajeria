import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

const socket = io(); // Se conecta al servidor automáticamente

//creamos instancias de los elementos HTML
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Conectar al servidor
socket.on("connect", () => {
  console.log("Conectado al servidor");
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
    socket.emit("message", message); //Transmite el mensaje a todos los usuarios conectados
    messageInput.value = "";
    messageInput.focus();   //selecciona el input
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
