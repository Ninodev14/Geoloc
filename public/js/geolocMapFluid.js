document.addEventListener("DOMContentLoaded", function () {
    var toggleMapSizeBtn = document.getElementById("toggleMapSizeBtn");
    var mapElement = document.getElementById("map");
    var leftColumn = document.querySelector(".col-md-3");
    if (!toggleMapSizeBtn || !mapElement || !leftColumn) {
        console.error("Un ou plusieurs éléments du DOM sont manquants");
        return;
    }
    var isFullScreen = false;
    toggleMapSizeBtn.addEventListener("click", function () {
        if (isFullScreen) {
            mapElement.classList.remove("full-screen-map");
            leftColumn.classList.remove("full-screen-left-column");
            toggleMapSizeBtn.innerHTML = '<i class="bi bi-arrow-expand"></i> <';
            isFullScreen = false;
        }
        else {
            mapElement.classList.add("full-screen-map");
            leftColumn.classList.add("full-screen-left-column");
            toggleMapSizeBtn.innerHTML = '<i class="bi bi-arrow-collapse"></i> >';
            isFullScreen = true;
        }
    });
});
