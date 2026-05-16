import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

let currentData = {
  state: null,
  players: [],
  startedAt: null,
};

const socket = io();
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

function changeState(state) {
  currentData.state = state;

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
function changeData(data) {
  const $dataEl = document.getElementById("sv_data");
  $dataEl.textContent = `Estado: ${data.state}\n Jugadores: ${data.players}`;
}

//recupera el estado actual ser servidor (estado on/of, players, etc)
const response = await fetch("/api/sv_data");
const data = await response.json();
currentData = data.sv_data;
console.log(data.sv_data);
if (data.ok === false) {
  alert("error al obtener infomacion");
  changeState("error");
} else {
  changeData(data.sv_data);
  changeState(data.sv_data.state);
}

//se actualiza si el server cambia de estado
socket.on("update_sv_data", (sv_data) => {
  console.log(sv_data);
  changeData(sv_data);
  currentData = data.sv_data;
  if (sv_data.state !== currentData.state) {
    changeState(sv_data.state);
  }
});

const $manageBtn = document.getElementById("manage_sv");
$manageBtn.addEventListener("click", () => {
  if (currentData.state === "starting" || currentData.state === "stoping")
    return;
  const newState = currentData.state === "off" ? "started" : "off";
  socket.emit("changeState", newState);
});
