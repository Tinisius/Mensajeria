import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
import { showAlert } from "../utils.js";
import { sleep } from "../utils.js";

const socket = io();
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

async function keepAliveCamera() {
  while (true) {
    socket.emit("keepAliveCamera");
    await sleep(1);
  }
}

function enterCamera() {
  keepAliveCamera();

  document.getElementById("loginContainer").style.display = "none";

  const $cameraContainer = document.createElement("div");
  $cameraContainer.id = "cameraContainer";

  const $camera = document.createElement("img");
  $cameraContainer.id = "camera";

  $cameraContainer.appendChild($camera);
  document.getElementById("mainCamera").appendChild($cameraContainer);

  let previousUrl = null;
  socket.on("camera_frame", async (data) => {
    //convertimos los bytes un una imagen
    const blob = new Blob([data], { type: "image/jpeg" }); //bytes como un archivo JPEG.
    const imageUrl = URL.createObjectURL(blob); //URL temporal, ej: blob:http://tinisius.site/abc-123

    const oldUrl = previousUrl;
    previousUrl = imageUrl;

    $camera.src = imageUrl;

    try {
      await $camera.decode(); //devuelve una promesa que se resuelve cuando el navegador termina de decodificar la imagen.

      if (oldUrl) {
        URL.revokeObjectURL(oldUrl); //Esto evita acumular URLs y recursos en memoria.
      }
    } catch (error) {
      console.error("Error decodificando imagen:", error);
      URL.revokeObjectURL(imageUrl);
    }
  });
}

//VALIDACION DE CONTRASEÑA
const loginBtn = document.getElementById("loginBtn");

const loginInput = document.getElementById("loginInput");
const passwordInput = document.getElementById("passwordInput");

//login
loginBtn.addEventListener("click", () => {
  const username = loginInput.value.trim();
  const password = passwordInput.value.trim();

  //valida el nombre y la contraseña
  socket.emit("adminLogIn", username, password, (validation) => {
    if (validation) {
      enterCamera();
    } else showAlert("no sos admin o contraseña incorrectos!");
  });
});
