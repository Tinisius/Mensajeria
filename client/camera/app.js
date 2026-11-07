import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

const socket = io();
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

const camera = document.getElementById("camera");
let previousUrl = null;

socket.on("camera_frame", async (data) => {
  console.log("FRAME");
  //convertimos los bytes un una imagen
  const blob = new Blob([data], { type: "image/jpeg" }); //bytes como un archivo JPEG.
  const imageUrl = URL.createObjectURL(blob); //URL temporal, ej: blob:http://tinisius.site/abc-123

  const oldUrl = previousUrl;
  previousUrl = imageUrl;

  camera.src = imageUrl;

  try {
    await camera.decode(); //devuelve una promesa que se resuelve cuando el navegador termina de decodificar la imagen.

    if (oldUrl) {
      URL.revokeObjectURL(oldUrl); //Esto evita acumular URLs y recursos en memoria.
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
