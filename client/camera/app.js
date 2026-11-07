import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

const socket = io();
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

const camera = document.getElementById("camera");
let previousUrl = null;

socket.on("camera:frame", async (data) => {
  const blob = new Blob([data], { type: "image/jpeg" });
  const imageUrl = URL.createObjectURL(blob);

  const oldUrl = previousUrl;
  previousUrl = imageUrl;

  camera.src = imageUrl;

  try {
    //espera a que cargue la imagen
    await camera.decode();

    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }
  } catch (error) {
    console.error("Error decodificando imagen:", error);
    URL.revokeObjectURL(imageUrl);
  }
});

/*
socket.on("camera_frame", async (data) => {
  const blob = new Blob([data], { type: "image/jpeg" });
  const imageUrl = URL.createObjectURL(blob);

  camera.src = imageUrl;
  await new Promise((r) => setTimeout(r, 200));
});
*/
