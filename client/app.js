import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
import { HEXbright, ModBright, showAlert } from "./utils.js";

const socket = io();
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

let USER;
let USER_COLOR;
let USER_FONT;
//4.0
let ROOM = "general";
const chatCache = new Map(); //guarda los chats que fueron cargador en cache para consultar despues
const MAIN_DIV = document.getElementById("main");
const chatSelectorContainer = document.getElementById("chatSelectorContainer");
let currentChatID;

//                                                   DEFINICIONES DE FUNCIONES
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

//4.0 creamos un boton de chat en el selector
function renderChatSelector(chatId) {
  const btn = document.createElement("button");
  btn.textContent = chatId;
  btn.dataset.chatId = chatId;
  btn.className = "chatBtn";
  chatSelectorContainer.appendChild(btn);
}

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
  sendBtn.className = "sendBtn";
  sendBtn.textContent = "Enviar";
  inputGroup.appendChild(sendBtn);

  MAIN_DIV.appendChild(roomDiv);

  //- - - - - - - - - - - - - - Genero los listeners - - - - - - - - - - - - - -
  sendBtn.addEventListener("click", () => {
    console.log(chatId);
    const message = messageInput.value.trim();
    if (message && USER) {
      socket.emit(
        "message",
        chatId,
        USER + ": " + message,
        USER_COLOR,
        USER_FONT,
      );
      messageInput.value = "";
      messageInput.focus();
    }
  });

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });

  return roomDiv;
}

function renderMessage(chat, msg, color, font, type = "message") {
  const messageElem = document.createElement("div");
  messageElem.className = type; //message - join
  messageElem.textContent = type === "message" ? msg : `${msg} se ha unido`;
  messageElem.style.backgroundColor = color;
  messageElem.style.color = font;

  const messagesDiv = document.getElementById(`${chat}_messages`);

  messagesDiv.appendChild(messageElem);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

//4.0 se encarga de mostrar un chat que ya fue cargado o reenderizar uno nuevo
async function openChat(chatId) {
  let currentChat;
  //oculta el anterior chat si es que existe
  if (currentChatID) {
    currentChat = document.getElementById(currentChatID);
    currentChat.style.display = "none";
  }

  currentChatID = chatId;

  // si ya está cargado → solo mostrar
  if (chatCache.has(chatId)) {
    currentChat = document.getElementById(chatId); //el nuevo current chat
    currentChat.style.display = "flex";
    return;
  }

  const roomDiv = await renderRoom(chatId); //crea el div HTML y devuelve ese elemento
  chatCache.set(chatId, roomDiv);
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

function EnterChat(username) {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("main").style.display = "flex";

  //4.0 genera un listener para cada boton de chat que vaya a generarse dinamicamnete
  chatSelectorContainer.addEventListener("click", async (e) => {
    const btn = e.target.closest(".chatBtn");
    if (!btn) return;

    const chatId = btn.dataset.chatId; //id del chat seleccionado
    await openChat(chatId);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //EL PROBLEMA ESTA ACA, JOIN MANDA A CARGAR LOS MENSAJES, ESO ESTA MAL, O AL MENOS DEBER HACERLO SOLO SI NO ESTA EN CACHE
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    socket.emit(
      "join",
      chatId,
      username,
      ModBright(USER_COLOR, -30),
      USER_FONT,
    );
  });
}

//LISTENERS DE LOGIN / SIGNIN
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const loginBtn = document.getElementById("loginBtn");
const signInBtn = document.getElementById("signInBtn");

const loginInput = document.getElementById("loginInput");
const passwordInput = document.getElementById("passwordInput");
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
//                                                   MAIN
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

//2.0 se llama al iniciar sesion (join)
socket.on("history", (historyMessages, chat) => {
  const messagesDiv = document.getElementById(`${chat}_messages`);
  messagesDiv.innerHTML = "";
  //renderiza todos los mensajes de la DB
  historyMessages.forEach((item) => {
    renderMessage(chat, item.text, item.color, item.font, item.type);
  });
});

socket.on("join", (chat, USER, color, font) => {
  renderMessage(chat, USER, color, font, "join");
});

socket.on("message", (chat, msg, color, font) => {
  renderMessage(chat, msg, color, font);
});

//                                                   LISTENERS DE MAIN
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

socket.on("disconnect", () => {
  console.log("Desconectado del servidor");
});

//LLAMADO A FUNCIONES
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

renderChatSelector("general");
renderChatSelector("prueba");
