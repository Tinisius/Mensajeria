import express from "express";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  getRecentMessages,
  saveMessage,
  editTicTacToe,
} from "./store/messages.js";
import { saveUser } from "./store/users.js";
import { getChats, saveChat } from "./store/chats.js";
import {
  userExists,
  matchPassword,
  chatExists,
  matchChatPassword,
} from "./security/validations.js";
import { closeMongoConnection } from "./db/mongo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 8000);
const server = http.createServer(app);
const io = new Server(server);

const lastChat = new Map();

app.use(express.static(join(__dirname, "../client")));

io.on("connection", async (socket) => {
  console.log(`usuario conectado con id: ${socket.id}`);

  socket.on("logChat", async (chatId, password, callback) => {
    callback(await matchChatPassword(chatId, password));
  });

  //4.0
  socket.on(
    "createChat",
    async (chatName, chatPassword, username, callback) => {
      const now = Date.now();
      if (lastChat.has(socket.id) && now - lastChat.get(socket.id) < 60000) {
        callback({
          status: false,
          error: "Espera un poco antes de crear otro chat!",
        });
        return;
      }

      const exists = await chatExists(chatName);
      if (!exists) {
        try {
          await saveChat(chatName, chatPassword, username);
          lastChat.set(socket.id, now);
          callback({
            status: true,
            error: "creado correctamente!",
          });
        } catch (error) {
          console.error("[mongo] Error guardando usuario:", error);
          callback({
            status: false,
            error: "Error creando chat",
          });
        }
      } else
        callback({
          status: false,
          error: "El nombre del chat ya existe!",
        });
    },
  );

  //4.0
  socket.on("chats_fetch", async (chats) => {
    const chatArray = await getChats();
    const chatArrayNoPass = chatArray.map((obj) => {
      if (obj.chatPassword) return { ...obj, chatPassword: true };
      else return { ...obj, chatPassword: false };
    });
    chats(chatArrayNoPass);
  });

  //3.0
  socket.on("logIn", async (username, password, callback) => {
    callback(
      (await userExists(username)) && (await matchPassword(username, password)),
    );
  });

  //3.0
  socket.on("signIn", async (username, password, callback) => {
    const exists = await userExists(username);
    if (!exists) {
      try {
        const ip =
          socket.handshake.headers["x-forwarded-for"] ||
          socket.handshake.address;

        await saveUser(username, password, ip);
        callback({
          status: true,
          error: "Usuario creado con exito!",
        });
      } catch (error) {
        console.error("[mongo] Error guardando usuario:", error);
        callback({
          status: false,
          error: "Error creando usuario",
        });
      }
    } else
      callback({
        status: false,
        error: "El usuario ya existe!!",
      });
  });

  socket.on("message", async (chat, username, msg, color, font) => {
    //4.2
    io.to(chat).emit("message", chat, username, msg, color, font);
    try {
      await saveMessage({
        chat: chat,
        type: "message",
        user: username,
        text: msg,
        color,
        font,
      });
    } catch (error) {
      console.error(
        `[mongo] Error guardando mensaje en el chat:${chat}:`,
        error,
      );
    }
  });

  socket.on("join", async (chat, username, color, font) => {
    try {
      socket.join(chat);
      const history = await getRecentMessages(50, chat); //obtiene los mensajes de cierto chat
      socket.emit("history", history, chat);
    } catch (error) {
      console.error("[history] Error cargando mensajes:", error);
    }

    //4.2
    io.to(chat).emit("join", chat, username, color, font);
    try {
      await saveMessage({
        chat: chat,
        type: "join",
        user: username,
        text: "",
        color,
        font,
      });
    } catch (error) {
      console.error("[mongo] Error guardando join:", error);
    }
  });

  socket.on("ticTacToe", async (obj, callback) => {
    if (obj.type === "create") {
      //distinguir type del ticTacToe (create, move) del type del mensage=ticTacToe
      const response = await saveMessage({
        chat: obj.chat,
        type: "ticTacToe",
        user: obj.user,
      }); //devuelve el mensaje guardado
      obj._id = response._id;
      obj.data = response.data;
      io.to(obj.chat).emit("ticTacToe", obj);
    }
    if (obj.type === "move") {
      const response = await editTicTacToe(obj); //guarda y valida
      if (response.ok) {
        io.to(obj.chat).emit("ticTacToe", obj, response);
      }
      callback(response);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//2.0
process.on("SIGINT", async () => {
  await closeMongoConnection();
  process.exit(0);
});

//2.0
process.on("SIGTERM", async () => {
  await closeMongoConnection();
  process.exit(0);
});
