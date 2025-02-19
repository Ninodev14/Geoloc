document.addEventListener("DOMContentLoaded", function () {
  const toggleMapSizeBtn = document.getElementById(
    "toggleMapSizeBtn"
  ) as HTMLButtonElement | null;
  const mapElement = document.getElementById("map") as HTMLElement | null;
  const leftColumn = document.querySelector(".col-md-3") as HTMLElement | null;

  if (!toggleMapSizeBtn || !mapElement || !leftColumn) {
    console.error("Un ou plusieurs éléments du DOM sont manquants");
    return;
  }

  let isFullScreen: boolean = false;

  toggleMapSizeBtn.addEventListener("click", () => {
    if (isFullScreen) {
      mapElement.classList.remove("full-screen-map");
      leftColumn.classList.remove("full-screen-left-column");
      toggleMapSizeBtn.innerHTML = '<i class="bi bi-arrow-expand"></i> <';
      isFullScreen = false;
    } else {
      mapElement.classList.add("full-screen-map");
      leftColumn.classList.add("full-screen-left-column");
      toggleMapSizeBtn.innerHTML = '<i class="bi bi-arrow-collapse"></i> >';
      isFullScreen = true;
    }
  });
});
