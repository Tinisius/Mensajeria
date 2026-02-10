import express from "express";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getRecentMessages, saveMessage } from "./store/messages.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 8000);
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(join(__dirname, "../client")));

io.on("connection", async (socket) => {
  console.log("usuario conectado");

  try {
    const history = await getRecentMessages(50);
    socket.emit("history", history);
  } catch (error) {
    console.error("[history] Error cargando mensajes:", error);
  }

  socket.on("message", async (msg, color, font) => {
    io.emit("message", msg, color, font);

    try {
      await saveMessage({ text: msg, color, font });
    } catch (error) {
      console.error("[mongo] Error guardando mensaje:", error);
    }
  });

  socket.on("join", (username, color, font) => {
    io.emit("join", username, color, font);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
