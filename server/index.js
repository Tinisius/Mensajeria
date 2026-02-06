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
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

/*
import express from "express"; //Framework para hacer servidores
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); //lee el archivo .env del directorio (apikey.env) y lo guarda en process.env

const app = express(); //crea una instancia de express (levanta el sv y lo guarda en app)
const PORT = 3000;

app.use(cors()); //soluciona errores tipo: Blocked by CORS policy
app.use(express.static(".")); //Para usar /index.html en lugar de http://localhost:3000/index.html

//arranca el servidor y lo prepara para escuchar peticiones de conexion
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

 */
