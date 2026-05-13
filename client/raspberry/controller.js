const raspButton = document.getElementById("raspButton");
/*
{
    cpu: cpu.currentLoad.toFixed(1),
    ram: { usedRAMGB, totalRAMGB },
    temp: temp.main,
    network: { upKBps, downKBps },
    disks: disks,
};
*/
function renderData(data) {
  const $body = document.querySelector("body");

  const $cpuEl = document.createElement("div");
  $cpuEl.id = "loginBtn";
  $cpuEl.textContent = "CPU: " + data.cpu + "%";
  $body.appendChild($cpuEl);

  const $ramEl = document.createElement("div");
  $ramEl.id = "loginBtn";
  $ramEl.textContent = "RAM: " + data.ram.usedRAMGB + "GB";
  $body.appendChild($ramEl);

  const $tempEl = document.createElement("div");
  $tempEl.id = "loginBtn";
  $tempEl.textContent = "Temperatura: " + data.temp + "°c";
  $body.appendChild($tempEl);

  const $networkEl = document.createElement("div");
  $networkEl.id = "loginBtn";
  $networkEl.textContent =
    "subida: " + data.upKBps + "KBps " + " bajada: " + data.downKBps + "KBps";
  $body.appendChild($networkEl);

  //const disksEl = document.createElement("div");
}

raspButton.addEventListener("click", () => {
  fetch("/api/raspberry")
    .then((r) => r.json())
    .then((data) => {
      if (data.ok === false) {
        alert(data.error);
        return;
      }
      renderData(data);
      console.log(data);
    });
});
