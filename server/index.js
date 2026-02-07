import express from "express";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8000;
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(join(__dirname, "../client")));

io.on("connection", (socket) => {
  //espera a que un cliente se conecte
  console.log("usuario conectado");

  socket.on("message", (msg) => {
    //Escucha cuando un cliente envía un mensaje

    io.emit("message", msg); //Transmite el mensaje a todos los usuarios conectados
  });

  socket.on("join", (username) => {
    //Escucha cuando un cliente se une

    io.emit("join", username); //Transmite el mensaje a todos los usuarios conectados
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
