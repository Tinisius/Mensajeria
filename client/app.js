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
const chatCache = new Map(); //guarda los chats que fueron cargador en cache para consultar despues
const MAIN_DIV = document.getElementById("main");
let currentChatID;

//                                                   DEFINICIONES DE FUNCIONES
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

//4.0 creamos un boton de chat en el selector
function renderChatSelector(chats) {
  const chatsContainer = document.getElementById("chatSelectorContainer");
  chatsContainer.innerHTML = "";
  chats.forEach((item) => {
    const chatId = item.chatID;
    const btn = document.createElement("button");
    btn.textContent = chatId;
    btn.dataset.chatId = chatId;
    btn.className = "chatBtn";
    chatsContainer.appendChild(btn);
  });
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
  messageInput.className = "textInput";
  messageInput.placeholder = "Escribe un mensaje...";
  inputGroup.appendChild(messageInput);

  const sendBtn = document.createElement("button");
  sendBtn.className = "sendBtn";
  sendBtn.textContent = "Enviar";
  inputGroup.appendChild(sendBtn);

  MAIN_DIV.appendChild(roomDiv);

  //- - - - - - - - - - - - - - Genero los listeners - - - - - - - - - - - - - -
  sendBtn.addEventListener("click", () => {
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
}

//Es como un nuevo main, una vez que iniciaste sesion
function EnterChat(username) {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("main").style.display = "flex";

  //4.0 genero los chat de la DB
  socket.emit("chats_fetch", (chats) => {
    renderChatSelector(chats); //item debera ser un chatID
  });

  //4.0 genera un listener para cada boton de chat que vaya a generarse dinamicamente
  const chatSelectorContainer = document.getElementById(
    "chatSelectorContainer",
  );
  chatSelectorContainer.addEventListener("click", async (e) => {
    const btn = e.target.closest(".chatBtn");
    if (!btn) return;

    const chatId = btn.dataset.chatId; //id del chat seleccionado

    if (!chatCache.has(chatId)) {
      //solo se une la primera vez
      socket.emit(
        "join",
        chatId,
        username,
        ModBright(USER_COLOR, -30),
        USER_FONT,
      );
    }
    await openChat(chatId);
  });

  const createChatBtn = document.getElementById("createChatBtn");
  const chatNameInput = document.getElementById("chatNameInput");
  const chatPasswordInput = document.getElementById("chatPasswordInput");

  createChatBtn.addEventListener("click", () => {
    const chatName = chatNameInput.value.trim();
    const chatPassword = chatPasswordInput.value.trim();

    if (chatName && chatName.length < 20) {
      if (chatPassword.length < 20) {
        socket.emit(
          "createChat",
          chatName,
          chatPassword,
          USER,
          (validation) => {
            if (validation) {
              showAlert("Chat creado correctamente");
              socket.emit("chats_fetch", (chats) => {
                renderChatSelector(chats);
              });
            } else showAlert("El nombre del chat ya existe!");
          },
        );
      } else showAlert("la contraseña debe tener menos de 20 caracteres!");
    } else showAlert("el nombre debe tener entre 1 y 20 caracteres!");
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

//                                                   MAIN (podria ir en EnterChat())
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
