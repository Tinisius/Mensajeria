import { sleep } from "../utils.js";

async function app() {
  const button = document.getElementById("testing");
  const label = document.getElementById("label");
  button.addEventListener("click", async () => {
    button.disabled = true;

    for (let i = 62; i > 0; i--) {
      label.textContent = "TEST: " + i;
      await sleep(1);
    }
    const startedAud = new Audio("../assets/started.mp3");
    startedAud.play();

    button.disabled = false;
  });
}

app();
