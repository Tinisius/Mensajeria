import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

let currentState;

const socket = io();
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

function changeState(state) {
  currentState = state;

  const $button = document.getElementById("manage_sv");
  const $stateEl = document.getElementById("state");
  $stateEl.textContent =
    state === "off"
      ? "Apagado"
      : state === "started"
        ? "Prendido"
        : state === "starting"
          ? "Prendiendo"
          : state === "closing"
            ? "Apagando"
            : "Error";
  $stateEl.style.color =
    state === "off"
      ? "red"
      : state === "started"
        ? "green"
        : state === "starting" || state === "closing"
          ? "grey"
          : "yellow";
  $button.textContent =
    state === "off"
      ? "Prender"
      : state === "started"
        ? "Apagar"
        : state === "starting"
          ? "Prendiendo"
          : state === "closing"
            ? "Apagando"
            : "Error";
  $button.style.backgroundColor =
    state === "off"
      ? "green"
      : state === "started"
        ? "red"
        : state === "starting" || state === "closing"
          ? "grey"
          : "yellow";
}

//recupera el estado actual
const response = await fetch("/api/sv_state");
const data = await response.json();
if (data.ok === false) {
  alert("error al obtener infomacion");
  changeState("error");
} else {
  changeState(data.state);
}

//se actualiza si el server cambia de estado
socket.on("update", (state) => {
  changeState(state);
});

const $manageBtn = document.getElementById("manage_sv");
$manageBtn.addEventListener("click", () => {
  if (currentState === "starting" || currentState === "stoping") return;
  const newState = currentState === "off" ? "started" : "off";
  socket.emit("changeState", newState);
});
