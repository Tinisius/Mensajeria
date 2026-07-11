import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
import { sleep, timeFormat, showAlert, preloadImg } from "../utils.js";

let currentData = {
  state: null,
  players: [],
  startedAt: null,
  timeOut: 0,
  logs: [],
};

const socket = io();
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

async function startIdleTimeout(time) {
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

function changeColor(color) {
  const colorElements = document.querySelectorAll(".color-text");
  colorElements.forEach(($element) => {
    $element.classList.remove("warm-text", "cold-text");
    if (color === "warm") {
      $element.classList.add("warm-text");
    } else if (color === "cold") {
      $element.classList.add("cold-text");
    } else {
      $element.classList.add("rainbow-text");
    }
  });
}

function renderLogs(logs) {
  const $logsDiv = document.getElementById("logsContainer");
  $logsDiv.innerHTML = "";
  logs.forEach((log) => {
    const $logEl = document.createElement("div");
    $logEl.textContent = log;
    $logEl.className = "logMsg";
    $logsDiv.appendChild($logEl);
  });
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

      $serverContainer.style.backgroundImage =
        "url(../assets/backgrounds/sv_night.webp)";

      changeColor("warm");
      break;
    case "started":
      const startedAud = new Audio("../assets/audio/started.mp3");
      startedAud.play();

      $stateEl.textContent = "Prendido";
      $stateEl.style.color = "green";
      $button.textContent = "Apagar";
      $button.style.backgroundColor = "red";

      $serverContainer.style.backgroundImage =
        "url(../assets/backgrounds/sv_day.webp)";

      changeColor("cold");
      break;
    case "starting":
      $stateEl.textContent = "Prendiendo";
      $stateEl.style.color = "grey";
      $button.textContent = "Prendiendo";
      $button.style.backgroundColor = "grey";

      $serverContainer.style.backgroundImage =
        "url(../assets/backgrounds/sv_sunset.webp)";

      changeColor("cold");
      break;
    case "closing":
      $stateEl.textContent = "Apagando";
      $stateEl.style.color = "grey";
      $button.textContent = "Apagando";
      $button.style.backgroundColor = "grey";

      $serverContainer.style.backgroundImage =
        "url(../assets/backgrounds/sv_sunset.webp)";

      changeColor("warm");
      break;
    default:
    // Code to run if no cases match
  }
  const $stateTextEl = document.getElementById("state_text");
  $stateTextEl.style.color = $stateEl.style.color;
}
function changeData(data) {
  if (data.players) {
    const $playersList = document.getElementById("player_list");
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
  //preloadImg();

  await domReady();

  //recupera el estado actual ser servidor (estado on/of, players, etc)
  const response = await fetch("/api/sv_data");
  const data = await response.json();
  if (data.ok === false) {
    showAlert("error al obtener infomacion");
  } else {
    renderLogs(data.sv_data.logs);
    changeData(data.sv_data);
    changeState(data.sv_data.state);
  }

  //se actualiza si el server cambia de estado
  socket.on("update_sv_data", (sv_data) => {
    if (sv_data.state !== currentData.state) {
      changeState(sv_data.state);
    }
    changeData(sv_data);
  });

  //añade el nuevo registro
  socket.on("newLog", (log) => {
    const $logsDiv = document.getElementById("logsContainer");
    const $logEl = document.createElement("div");
    $logEl.textContent = log;
    $logEl.className = "logMsg";
    $logsDiv.appendChild($logEl);

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  const $manageBtn = document.getElementById("manage_sv");
  $manageBtn.addEventListener("click", () => {
    if (currentData.state === "starting" || currentData.state === "stoping")
      return;
    const newState = currentData.state === "off" ? "started" : "off";
    socket.emit("changeState", newState);
  });

  const $sv_container = document.getElementById("main_sv_container");
  const $logs_container = document.getElementById("logsContainer");

  const $mainSelect = document.getElementById("mainSelect");
  $mainSelect.addEventListener("click", () => {
    $sv_container.style.display = "flex";
    $logs_container.style.display = "none";
  });

  const $logSelect = document.getElementById("logSelect");
  $logSelect.addEventListener("click", () => {
    $logs_container.style.height = `${$sv_container.offsetHeight}px`; //aseguro misma altura para que no se note el cambio
    $logs_container.style.width = `${$sv_container.offsetWidth}px`; //lo mismo
    $sv_container.style.display = "none";
    $logs_container.style.display = "flex";
  });
}

init();
