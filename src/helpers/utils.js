// src/helpers/utils.js
export const lerp = (start, end, t) => start + (end - start) * t;

export const createKeyframe = (dancers) => ({
  id: Date.now() + Math.random(),
  duration: 1000,
  positions: dancers.map((d) => ({ id: d.id, x: d.x, y: d.y })),
});

export const COLOR_PALETTES = {
  Bright: ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22", "#000000", "#888888"],
  Soft: ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#bdb2ff", "#000000", "#888888"],
  Dark: ["#c0392b", "#2980b9", "#27ae60", "#f39c12", "#8e44ad", "#d35400", "#000000", "#888888"],
};
