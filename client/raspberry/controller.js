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
  $cpuEl.textContent = data.cpu + "%";
  $body.appendChild($cpuEl);

  const $ramEl = document.createElement("div");
  $ramEl.textContent = data.ram.usedRAMGB + "GB";
  $body.appendChild($ramEl);

  const $tempEl = document.createElement("div");
  $tempEl.textContent = data.temp + "°c";
  $body.appendChild($tempEl);

  const $networkEl = document.createElement("div");
  $networkEl.textContent =
    "subida: " + data.upKBps + "KBps " + " bajada: " + data.downKBps + "KBps";
  $body.appendChild($networkEl);

  //const disksEl = document.createElement("div");
}

raspButton.addEventListener("click", () => {
  fetch("/api/raspberry")
    .then((r) => r.json())
    .then((data) => {
      renderData(data);
    });
});
