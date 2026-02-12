import express from "express";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getRecentMessages, saveMessage } from "./store/messages.js";
import { closeMongoConnection } from "./db/mongo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 8000);
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(join(__dirname, "../client")));

io.on("connection", async (socket) => {
  console.log("usuario conectado");

  socket.on("message", async (msg, color, font) => {
    io.emit("message", msg, color, font);

    //2.0 guarda el mensaje cada vez que se envia
    try {
      await saveMessage({ type: "message", text: msg, color, font });
    } catch (error) {
      console.error("[mongo] Error guardando mensaje:", error);
    }
  });

  socket.on("join", async (username, color, font) => {
    //2.0 obtiene los mensajes y llama a history para renderizarlos
    try {
      const history = await getRecentMessages(50);
      socket.emit("history", history);
    } catch (error) {
      console.error("[history] Error cargando mensajes:", error);
    }

    io.emit("join", username, color, font);

    //2.1 guarda el mensaje join
    try {
      await saveMessage({ type: "join", text: username, color, font });
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
