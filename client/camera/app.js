import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

const socket = io();
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

socket.on("camera_frame", async (data) => {
  const blob = new Blob([data], { type: "image/jpeg" });
  const imageUrl = URL.createObjectURL(blob);

  document.getElementById("camera").src = imageUrl;
  await new Promise((r) => setTimeout(r, 200));
});
