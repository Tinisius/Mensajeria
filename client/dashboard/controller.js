function createTableCell(text, className) {
  const cell = document.createElement("td");
  if (className) cell.className = className;
  cell.textContent = text;
  return cell;
}

function createRow(cells) {
  const row = document.createElement("tr");
  row.className = "disk-row";
  cells.forEach((cell) => row.appendChild(cell));
  return row;
}

function displayDisks(data) {
  const body = document.getElementById("table-body");
  if (Array.isArray(data.disks) && data.disks.length > 0) {
    data.disks.forEach((disk) => {
      body.appendChild(
        createRow([
          createTableCell(""),
          createTableCell(disk.name),
          createTableCell(`${disk.usedGB}GB / ${disk.sizeGB}GB`, "value-cell"),
        ]),
      );
    });
  } else {
    body.appendChild(
      createRow([
        createTableCell("Discos"),
        createTableCell("No hay datos de discos"),
        createTableCell("-", "value-cell"),
      ]),
    );
  }
}

const raspButton = document.getElementById("raspButton");

function updateData(data) {
  const $cpuEl = document.getElementById("cpu-value");
  $cpuEl.textContent = data.cpu + "%";
  $cpuRowBG = document.getElementById("cpu_row").style.backgroundColor;
  data.cpu > 90
    ? ($cpuRowBG = "red")
    : data.cpu > 70
      ? ($cpuRowBG = "yellow")
      : ($cpuRowBG = "white");

  const $ramEl = document.getElementById("ram-value");
  const ramPorcent = (100 * data.ram.usedRAMGB) / data.ram.totalRAMGB;
  $ramEl.textContent = `${data.ram.usedRAMGB}GB / ${data.ram.totalRAMGB}GB / ${ramPorcent.toFixed(2)}%`;
  $ramRowBG = document.getElementById("ram_row").style.backgroundColor;
  ramPorcent > 90
    ? ($ramRowBG = "red")
    : ramPorcent > 70
      ? ($ramRowBG = "yellow")
      : ($ramRowBG = "white");

  const $tempEl = document.getElementById("temp-value");
  $tempEl.textContent = data.temp ? data.temp + "°c" : "No data";
  $tempRowBG = document.getElementById("temp_row").style.backgroundColor;
  data.temp > 80
    ? ($tempRowBG = "red")
    : data.temp > 60
      ? ($tempRowBG = "yellow")
      : ($tempRowBG = "white");

  const $netEl = document.getElementById("net-value");
  $netEl.textContent = `${data.upKBps | 0}KBps / ${data.downKBps | 0}KBps`;

  document.querySelectorAll(".disk-row").forEach((el) => el.remove()); //borra todas las filas de discos previas
  displayDisks(data);
}

while (true) {
  const response = await fetch("/api/raspberry");
  const data = await response.json();
  if (data.ok === false) {
    alert(data.error);
    break;
  }
  updateData(data);
}
