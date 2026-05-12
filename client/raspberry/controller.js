const raspButton = document.getElementById("raspButton");

raspButton.addEventListener("click", () => {
  fetch("api/raspberry")
    .then((r) => r.json())
    .then((data) => {
      /*
      document.body.innerHTML += `
        <p>CPU: ${data.cpu}%</p>
        <p>RAM: ${data.ram}%</p>
        <p>Temp: ${data.temp}°C</p>
    `;
    */
      console.log(data);
    });
});
