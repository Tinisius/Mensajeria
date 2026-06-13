import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
import { sleep, timeFormat, showAlert } from "../utils.js";

let currentData = {
  state: null,
  players: [],
  startedAt: null,
  timeOut: 0,
};

const socket = io();
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

async function startIdleTimeout(time) {
  console.log("aranca un timeout:", currentData.state);
  if (currentData.state !== "started") return;

  const $manageButton = document.getElementById("manage_sv");
  const $timeOut = document.createElement("div");
  $timeOut.id = "timeout";
  await sleep(0.1);
  $manageButton.appendChild($timeOut);

  currentData.timeOut = time; //se reescribe pero no importa, es reutilizable

  while (
    currentData.timeOut > 0 &&
    currentData.players.length === 0 &&
    currentData.state === "started"
  ) {
    $timeOut.textContent = "AutoApagado en: " + timeFormat(currentData.timeOut);
    currentData.timeOut--;
    await sleep(1);
  }
  currentData.timeOut = 0;
  $timeOut.remove();
}

function changeState(state) {
  currentData.state = state;

  const $serverContainer = document.getElementById("server-bg");
  const $button = document.getElementById("manage_sv");
  const $stateEl = document.getElementById("state");

  switch (state) {
    case "off":
      $stateEl.textContent = "Apagado";
      $stateEl.style.color = "red";
      $button.textContent = "Prender";
      $button.style.backgroundColor = "green";

      $serverContainer.style.backgroundImage = "url(../assets/sv_night.png)";
      break;
    case "started":
      const startedAud = new Audio("../assets/started.mp3");
      startedAud.play();

      $stateEl.textContent = "Prendido";
      $stateEl.style.color = "green";
      $button.textContent = "Apagar";
      $button.style.backgroundColor = "red";

      $serverContainer.style.backgroundImage = "url(../assets/sv_day.png)";
      break;
    case "starting":
      $stateEl.textContent = "Prendiendo";
      $stateEl.style.color = "grey";
      $button.textContent = "Prendiendo";
      $button.style.backgroundColor = "grey";

      $serverContainer.style.backgroundImage = "url(../assets/sv_sunset.png)";
      break;
    case "closing":
      $stateEl.textContent = "Apagando";
      $stateEl.style.color = "grey";
      $button.textContent = "Apagando";
      $button.style.backgroundColor = "grey";

      $serverContainer.style.backgroundImage = "url(../assets/sv_sunset.png)";
      break;
    default:
    // Code to run if no cases match
  }
}
function changeData(data) {
  const $playersList = document.getElementById("player_list");
  if (data.players) {
    $playersList.innerHTML = "";
    data.players.forEach((player) => {
      const $playerEl = document.createElement("li");
      $playerEl.textContent = player;
      $playersList.appendChild($playerEl);
    });
  }

  if (currentData.timeOut === 0 && data.timeOut > 0) {
    //si currentTimeOut === 0 no hay timers por ahi prendidos
    currentData = data;
    startIdleTimeout(data.timeOut);
  } else {
    currentData = data;
  }
}
// Espera al DOM y luego inicializa la parte dependiente del DOM
async function domReady() {
  if (document.readyState === "loading") {
    await new Promise((resolve) =>
      document.addEventListener("DOMContentLoaded", resolve, { once: true }),
    );
  }
}

async function init() {
  await domReady();

  //recupera el estado actual ser servidor (estado on/of, players, etc)
  const response = await fetch("/api/sv_data");
  const data = await response.json();
  console.log(data.sv_data);
  if (data.ok === false) {
    showAlert("error al obtener infomacion");
  } else {
    changeData(data.sv_data);
    changeState(data.sv_data.state);
  }

  //se actualiza si el server cambia de estado
  const socket = io();
  socket.on("connect", () => {
    console.log("Conectado al servidor");
  });
  socket.on("update_sv_data", (sv_data) => {
    console.log(sv_data);
    if (sv_data.state !== currentData.state) {
      changeState(sv_data.state);
    }
    changeData(sv_data);
  });

  const $manageBtn = document.getElementById("manage_sv");
  $manageBtn.addEventListener("click", () => {
    if (currentData.state === "starting" || currentData.state === "stoping")
      return;
    const newState = currentData.state === "off" ? "started" : "off";
    socket.emit("changeState", newState);
  });
}

init();
