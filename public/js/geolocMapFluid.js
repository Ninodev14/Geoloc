document.addEventListener("DOMContentLoaded", function () {
  const toggleMapSizeBtn = document.getElementById("toggleMapSizeBtn");
  const mapElement = document.getElementById("map");
  const leftColumn = document.querySelector(".col-md-3");

  let isFullScreen = false;

  toggleMapSizeBtn.addEventListener("click", () => {
    if (isFullScreen) {
      mapElement.classList.remove("full-screen-map");
      leftColumn.classList.remove("full-screen-left-column");
      toggleMapSizeBtn.innerHTML =
        '<i class="bi bi-arrow-expand"></i> Agrandir la carte';
      isFullScreen = false;
    } else {
      // Si la carte est dans sa taille initiale, met-la en plein écran
      mapElement.classList.add("full-screen-map");
      leftColumn.classList.add("full-screen-left-column");
      toggleMapSizeBtn.innerHTML =
        '<i class="bi bi-arrow-collapse"></i> Réduire la carte';
      isFullScreen = true;
    }
  });
});
