export function HEXbright(hex) {
  //recibe un color hezadecimal y devuelve el brillo
  hex = hex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // brillo percibido
  const bright = (r * 299 + g * 587 + b * 114) / 1000;
  return bright;
}

export function ModBright(hex, amount = 0) {
  hex = hex.replace("#", "");

  let r = Math.max(0, parseInt(hex.slice(0, 2), 16) + amount);
  let g = Math.max(0, parseInt(hex.slice(2, 4), 16) + amount);
  let b = Math.max(0, parseInt(hex.slice(4, 6), 16) + amount);

  return (
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  );
}

export function showAlert(msg, ms = 4000) {
  const div = document.createElement("div");
  div.textContent = msg;

  Object.assign(div.style, {
    fontSize: "1.3rem",
    position: "fixed",
    top: "15vh",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "0.7rem 1.1rem",
    background: "#333",
    color: "#fff",
    borderRadius: "0.6rem",
    fontFamily: "sans-serif",
    zIndex: 9999,
    opacity: 0,
    transition: "opacity .2s",
  });

  document.body.appendChild(div);
  requestAnimationFrame(() => (div.style.opacity = 1));

  setTimeout(() => {
    div.style.opacity = 0;
    setTimeout(() => div.remove(), 200);
  }, ms);
}
