import { sleep } from "../utils.js";

async function startIdleTimeout(time) {
  const $timeout = document.getElementById("timeout");

  let currentData_timeOut = time; //se reescribe pero no importa, es reutilizable

  const startTime = Date.now();

  while (currentData_timeOut > 0) {
    $timeout.textContent = "AutoApagado en: " + currentData_timeOut;

    const passedTimeMillis = Date.now() - startTime;
    currentData_timeOut = time - Math.trunc(passedTimeMillis / 1000);
    await sleep(0.1);
  }
  currentData.timeOut = 0;
  $timeOut.remove();
}

async function app() {
  const button = document.getElementById("testing");
  const label = document.getElementById("label");
  button.addEventListener("click", async () => {
    button.disabled = true;

    for (let i = 62; i > 0; i--) {
      label.textContent = "TEST: " + i;
      await sleep(1);
    }
    const startedAud = new Audio("../assets/audio/started.mp3");
    startedAud.play();

    button.disabled = false;
  });

  const timeoutBtn = document.getElementById("btnTimeout");
  timeoutBtn.addEventListener("click", () => {
    startIdleTimeout(3);
  });
}

app();
