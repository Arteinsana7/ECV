// Sélection des éléments
const img = document.querySelector(".shoe-box");
const slider = document.getElementById("zoom-slider");
const zoomValue = document.getElementById("zoom-value");

img.style.transformOrigin = "center center";

slider.addEventListener("input", (e) => {
  const zoom = parseFloat(e.target.value);
  img.style.transform = `scale(${zoom})`;

  zoomValue.textContent = Math.round(zoom * 100) + "%";
});
