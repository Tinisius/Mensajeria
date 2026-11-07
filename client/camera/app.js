import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

const socket = io();
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

socket.on("camera-frame", (image) => {
  document.getElementById("camera").src = `data:image/jpeg;base64,${image}`;
});
