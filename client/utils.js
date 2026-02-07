export function HEXbright(hex) {
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
