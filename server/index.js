import express from "express";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getRecentMessages, saveMessage } from "./store/messages.js";
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
      lastChat.set(socket.id, now);

      const exists = await chatExists(chatName);
      if (!exists) {
        try {
          await saveChat(chatName, chatPassword, username);
          callback({
            status: true,
            error: "creado correctamente!",
          });
        } catch (error) {
          console.error("[mongo] Error guardando usuario:", error);
          callback({
            status: false,
            error: "Espera un poco antes de crear otro chat!",
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
        await saveUser(username, password);
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
      await saveMessage(
        { type: "message", user: username, text: msg, color, font },
        chat,
      );
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
      await saveMessage(
        { type: "join", user: username, text: "", color, font },
        chat,
      );
    } catch (error) {
      console.error("[mongo] Error guardando join:", error);
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
