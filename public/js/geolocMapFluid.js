document.addEventListener("DOMContentLoaded", function () {
  const toggleMapSizeBtn = document.getElementById("toggleMapSizeBtn");
  const mapElement = document.getElementById("map");

  let isFullScreen = false;

  toggleMapSizeBtn.addEventListener("click", () => {
    if (isFullScreen) {
      // Si la carte est en plein écran, réinitialise la taille
      mapElement.classList.remove("full-screen-map");
      toggleMapSizeBtn.innerHTML =
        '<i class="bi bi-arrow-expand"></i> Agrandir la carte';
      isFullScreen = false;
    } else {
      // Si la carte est dans sa taille initiale, met-la en plein écran
      mapElement.classList.add("full-screen-map");
      toggleMapSizeBtn.innerHTML =
        '<i class="bi bi-arrow-collapse"></i> Réduire la carte';
      isFullScreen = true;
    }
  });
});
