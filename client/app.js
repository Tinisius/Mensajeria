import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
import { HEXbright, ModBright, showAlert } from "./utils.js";

const socket = io();

let USER;
let USER_COLOR;
let USER_FONT;
//4.0
let ROOM = "general";
const chatCache = new Map(); //guarda los chats que fueron cargador en cache para consultar despues
const MAIN_DIV = document.getElementById("main");
const chatSelectorContainer = document.getElementById("chatSelectorContainer");
let currentChat; // = document.getElementById(ROOM);

//4.0 creamos un boton de chat en el selector
function renderChatSelector(chatId) {
  const btn = document.createElement("button");
  btn.textContent = chatId;
  btn.dataset.chatId = chatId;
  btn.className = "chatBtn";
  chatSelectorContainer.appendChild(btn);
}

renderChatSelector("general");
renderChatSelector("prueba");

//4.0 creamos un div para cada room (asi no tenemos que borrar y recargar MSGs cada vez)
async function renderRoom(chatId) {
  const roomDiv = document.createElement("div");
  roomDiv.id = chatId;
  roomDiv.className = "chatContainer"; //roomDiv.classList.add(room, "chatContainer");

  const title = document.createElement("h1");
  title.textContent = `Sala: ${chatId}`;
  roomDiv.appendChild(title);

  const messagesDiv = document.createElement("div");
  messagesDiv.id = `${chatId}_messages`; //identificacion individual para los mensajes de cada sala
  messagesDiv.className = "messages";
  roomDiv.appendChild(messagesDiv);

  const inputGroup = document.createElement("div");
  inputGroup.className = "input-group";
  roomDiv.appendChild(inputGroup);

  const messageInput = document.createElement("input");
  messageInput.type = "text";
  messageInput.id = `${chatId}_input`;
  messageInput.placeholder = "Escribe un mensaje...";
  inputGroup.appendChild(messageInput);

  const sendBtn = document.createElement("button");
  sendBtn.id = "sendBtn";
  sendBtn.textContent = "Enviar";
  inputGroup.appendChild(sendBtn);

  MAIN_DIV.appendChild(roomDiv);

  return roomDiv;
}

//2.0 para renderizar todos los mensajes de la base de datos (simplifica el cliente tambien)
function renderMessage(room, msg, color, font, type = "message") {
  const messageElem = document.createElement("div");
  messageElem.className = type; //message - join
  messageElem.textContent = type === "message" ? msg : `${msg} se ha unido`;
  messageElem.style.backgroundColor = color;
  messageElem.style.color = font;

  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function EnterChat(username) {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("main").style.display = "flex";
  //socket.emit("join", username, ModBright(USER_COLOR, -30), USER_FONT);
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

socket.on("connect", () => {
  console.log("Conectado al servidor");
});

//---------------------------------------------------MAIN---------------------------------------------------

//4.0 se encarga de mostrar un chat que ya fue cargado o reenderizar uno nuevo
async function openChat(chatId) {
  if (currentChat) {
    currentChat.style.display = "none";
    console.log(`currentChatID: ${currentChat.id}`);
  }
  // si ya está cargado → solo mostrar
  if (chatCache.has(chatId)) {
    currentChat = document.getElementById(chatId);
    currentChat.style.display = "flex";
    return;
  }

  const roomDiv = await renderRoom(chatId);
  chatCache.set(chatId, roomDiv);
  currentChat = roomDiv;
  /*
  // si no está → pedir a la DB
  const mensajes = await obtenerMensajes(chatId);

  const contenedor = document.createElement("div");
  contenedor.className = "chat-panel";
  contenedor.dataset.chatId = chatId;

  for (const m of mensajes) {
    const p = document.createElement("p");
    p.textContent = `${m.user}: ${m.texto}`;
    contenedor.appendChild(p);
  }

  divMensajes.appendChild(contenedor);

  mostrarChat(chatId);
  */
}

//4.0 genera un listener para cada boton de chat que vaya a generarse dinamicamnete
chatSelectorContainer.addEventListener("click", async (e) => {
  const btn = e.target.closest(".chatBtn");
  if (!btn) return;

  const chatId = btn.dataset.chatId; //id del chat seleccionado
  await openChat(chatId);
});

//2.0 se llama al iniciar sesion (join)
socket.on("history", (historyMessages) => {
  messagesDiv.innerHTML = "";
  //renderiza todos los mensajes de la DB
  historyMessages.forEach((item) => {
    renderMessage(room, item.text, item.color, item.font, item.type);
  });
});

socket.on("join", (USER, color, font) => {
  renderMessage(room, USER, color, font, "join");
});

socket.on("message", (room, msg, color, font) => {
  renderMessage(room, msg, color, font);
});

sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message && USER) {
    socket.emit("message", ROOM, USER + ": " + message, USER_COLOR, USER_FONT);
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
