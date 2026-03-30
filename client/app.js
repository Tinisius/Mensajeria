import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
import { HEXbright, ModBright, showAlert } from "./utils.js";

const socket = io();
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

let USER = {
  name: "",
  color: null,
  font_color: null,
};
//4.0
const chatCache = new Map(); //guarda los chats que fueron cargador en cache para consultar despues
const MAIN_DIV = document.getElementById("main");
let currentChatID;

const MEDIA = window.matchMedia("(max-width: 768px)");
MEDIA.addEventListener("change", () => {});

//                                                   DEFINICIONES DE FUNCIONES
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function createBoard(obj) {
  let squares = obj.data.board; //incluso la primera vez ya es un array de null
  let turn = obj.data.turn; //tambien la primera vex es X

  const $board = document.createElement("grid");
  $board.className = "board";
  $board.id = `game-${obj._id.toString()}`;

  function checkWinner(s) {
    const winner_combos = [
      //todas las combinaciones ganadoras
      [0, 1, 2], // filas
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6], // columnas
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8], // diagonales
      [2, 4, 6],
    ];

    //extrae las 3 posiciones de cada combo
    for (let [a, b, c] of winner_combos) {
      if (s[a] && s[a] === s[b] && s[a] === s[c]) {
        return s[a];
      }
    }
    return null;
  }

  squares.forEach((value, index) => {
    const $cell = document.createElement("div");
    $cell.className = "cell";
    $cell.textContent = value ? value : "";

    $cell.addEventListener("click", () => {
      if (!$cell.textContent) {
        $cell.textContent = turn;
        squares[index] = turn;
        if (checkWinner(squares)) {
          alert(`El ganador es: ${turn}`);
        }
        turn = turn === "×" ? "○" : "×";
      }
    });

    $board.appendChild($cell);
  });

  return $board;
}

async function renderLogChat(chatId, username) {
  const logChatDiv = document.createElement("div");
  logChatDiv.id = chatId;
  logChatDiv.className = "logContainer";

  const title = document.createElement("h1");
  title.textContent = `Acceder a: ${chatId}`;
  logChatDiv.appendChild(title);

  const passwordInput = document.createElement("input");
  passwordInput.type = "text";
  passwordInput.id = `${chatId}_password_input`;
  passwordInput.className = "menuInput";
  passwordInput.placeholder = "Contraseña...";
  logChatDiv.appendChild(passwordInput);

  const logBtn = document.createElement("button");
  logBtn.className = "menuBtn";
  logBtn.textContent = "Ingresar";
  logChatDiv.appendChild(logBtn);

  MAIN_DIV.appendChild(logChatDiv);

  logBtn.addEventListener("click", () => {
    const password = passwordInput.value.trim();
    socket.emit("logChat", chatId, password, async (validation) => {
      if (validation) {
        logChatDiv.remove();
        currentChatID = null;
        chatCache.delete(chatId);
        await openChat(chatId, username, validation);
      } else {
        showAlert("contraseña incorrecta");
      }
    });
  });
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      logBtn.click();
    }
  });

  return logChatDiv;
}

//4.0 creamos todos los botones de los chats
function renderChatsSelectors(chats) {
  const chatsContainer = document.getElementById("chatSelectorContainer");
  chatsContainer.innerHTML = "";

  chats.forEach((item) => {
    const chatDiv = document.createElement("div");

    chatDiv.classList.add("chatDiv");

    const chatId = item.chatID;
    const btn = document.createElement("button");
    btn.textContent = chatId;
    btn.dataset.chatId = chatId;
    btn.className = "chatBtn";
    chatDiv.appendChild(btn);

    const passImage = document.createElement("img");
    passImage.src = item.chatPassword ? "assets/close.ico" : "assets/open.ico";
    passImage.className = "icon";
    chatDiv.appendChild(passImage);

    chatsContainer.appendChild(chatDiv);
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

  const ticTacToe = document.createElement("button");
  ticTacToe.classList.add("ticTacToeBtn");
  ticTacToe.classList.add("sendBtn");
  ticTacToe.textContent = "#";
  inputGroup.appendChild(ticTacToe);

  const sendBtn = document.createElement("button");
  sendBtn.className = "sendBtn";
  sendBtn.textContent = "Enviar";
  inputGroup.appendChild(sendBtn);

  MAIN_DIV.appendChild(roomDiv);

  //- - - - - - - - - - - - - - Genero los listeners - - - - - - - - - - - - - -
  ticTacToe.addEventListener("click", () => {
    if (USER.name) {
      socket.emit("ticTacToe", {
        chat: chatId,
        type: "TTT_pending",
        user: USER.name,
      });
    }
  });

  sendBtn.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message && USER.name) {
      socket.emit(
        "message",
        chatId,
        USER.name,
        message,
        USER.color,
        USER.font_color,
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

function renderMessage(chat, username, msg, color, font, type = "message") {
  const messageElem = document.createElement("div");
  messageElem.className = type; //message - join
  messageElem.style.backgroundColor = color;
  messageElem.style.color = font;
  messageElem.textContent =
    type === "message" ? `${username}:${msg}` : `${username} se ha unido`;

  const addFriend = document.createElement("img");
  addFriend.className = "icon";
  addFriend.src = "assets/addUser.ico";

  const messagesDiv = document.getElementById(`${chat}_messages`);
  messagesDiv.appendChild(messageElem);
  messageElem.appendChild(addFriend);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  addFriend.addEventListener("click", async () => {
    console.log(msg);
  });
}

function renderTicTacToe(obj) {
  const $board = createBoard(obj);
  const messagesDiv = document.getElementById(`${obj.chat}_messages`);
  messagesDiv.appendChild($board);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

//4.0 se encarga de mostrar un chat que ya fue cargado o reenderizar uno nuevo
async function openChat(chatId, username, validation) {
  //oculta el anterior chat si es que existe
  if (currentChatID) {
    document.getElementById(currentChatID).style.display = "none";
  }

  currentChatID = chatId;

  // si ya está cargado → solo mostrar
  if (chatCache.has(chatId)) {
    chatCache.get(chatId).style.display = "flex";
    return;
  }

  if (validation) {
    const roomDiv = await renderRoom(chatId); //crea el div HTML y devuelve ese elemento
    chatCache.set(chatId, roomDiv);
    socket.emit(
      "join",
      chatId,
      username,
      ModBright(USER.color, -30),
      USER.font_color,
    );
  } else {
    const logChatDiv = await renderLogChat(chatId, username);
    chatCache.set(chatId, logChatDiv);
  }
}

//Es como un nuevo main, una vez que iniciaste sesion
function EnterChatMain(username) {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("main").style.display = "flex";

  //4.0 genero los chat de la DB
  socket.emit("chats_fetch", (chats) => {
    renderChatsSelectors(chats);
  });

  //4.0 genera un listener para cada boton de chat que vaya a generarse dinamicamente
  const chatSelectorContainer = document.getElementById(
    "chatSelectorContainer",
  );
  chatSelectorContainer.addEventListener("click", async (e) => {
    const btn = e.target.closest(".chatBtn");
    if (!btn) return;

    const chatId = btn.dataset.chatId; //id del chat seleccionado

    //4.1
    socket.emit("logChat", chatId, "", async (validation) => {
      if (MEDIA.matches) {
        document.getElementById("chatsListGroup").style.height = "20vh"; //default 90vh
        document.getElementById("chatSelectorContainer").style.display = "none";
      }
      await openChat(chatId, username, validation); //abre el chat o el LogChat
    });
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
          USER.name,
          (validation) => {
            if (validation.status) {
              showAlert("Chat creado correctamente");
              socket.emit("chats_fetch", (chats) => {
                renderChatsSelectors(chats);
              });
            } else showAlert(validation.error);
          },
        );
      } else showAlert("la contraseña debe tener menos de 20 caracteres!");
    } else showAlert("el nombre debe tener entre 1 y 20 caracteres!");
  });

  const alternator = document.getElementById("alternator");

  alternator.addEventListener("click", () => {
    if (currentChatID) {
      document.getElementById(currentChatID).style.display = "none";
      document.getElementById("chatsListGroup").style.height = "90vh";
      document.getElementById("chatSelectorContainer").style.display = "flex";
    }
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
        if (HEXbright(color) < 128) USER.font_color = "#ececec";
        else USER.font_color = "#3b3b3b";
        USER.name = username;
        USER.color = color;
        EnterChatMain(username);
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
        if (validation.status) {
          showAlert("usuario creado correctamente");
          if (HEXbright(color) < 128) USER.font_color = "#ececec";
          else USER.font_color = "#3b3b3b";
          USER.name = username;
          USER.color = color;
          EnterChatMain(username);
        }
        showAlert(validation.error);
      });
    } else showAlert("la contraseña debe tener entre 1 y 20 caracteres!");
  } else showAlert("el nombre debe tener entre 1 y 20 caracteres!");
});

//                                                   MAIN (podria ir en EnterChatMain())
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
socket.on("history", (historyMessages, chat) => {
  const messagesDiv = document.getElementById(`${chat}_messages`);
  messagesDiv.innerHTML = "";
  //renderiza todos los mensajes de la DB
  historyMessages.forEach((item) => {
    if (item.type === "message" || item.type === "join")
      renderMessage(
        chat,
        item.user,
        item.text,
        item.color,
        item.font,
        item.type,
      );
    else {
      renderTicTacToe(item);
    }
  });
});

socket.on("join", (chat, username, color, font) => {
  renderMessage(chat, username, "", color, font, "join");
});

socket.on("message", (chat, username, msg, color, font) => {
  renderMessage(chat, username, msg, color, font);
});

socket.on("ticTacToe", (obj) => {
  if (obj.type === "TTT_pending") {
    renderTicTacToe(obj);
  }
});

socket.on("disconnect", () => {
  console.log("Desconectado del servidor");
});
