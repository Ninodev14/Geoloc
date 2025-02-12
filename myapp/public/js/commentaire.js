let map;
let geocacheId = new URLSearchParams(window.location.search).get("id");

const initializeMap = async () => {
  if (!geocacheId) {
    alert("Aucune géocache sélectionnée !");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vous devez être connecté pour voir cette géocache.");
      window.location.href = "index.html";
      return;
    }

    const response = await fetch(
      `http://localhost:5000/geocache/${geocacheId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Accès non autorisé. Veuillez vous connecter.");
      if (response.status === 404) throw new Error("Géocache introuvable.");
      throw new Error("Erreur lors de la récupération des données.");
    }

    const geocache = await response.json();

    map = L.map("map").setView(
      [geocache.geocache.latitude, geocache.geocache.longitude],
      13
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    L.marker([geocache.geocache.latitude, geocache.geocache.longitude]).addTo(
      map
    ).bindPopup(`
        <b>${geocache.geocache.name}</b><br>
        ${geocache.geocache.description}<br>
        Difficulté: ${geocache.geocache.difficulty}<br>
        Créée par: ${geocache.geocache.creator}
    `);

    loadComments();
  } catch (error) {
    console.error(error);

    alert(error.message);
  }
};
document
  .getElementById("submit-comment")
  ?.addEventListener("click", async () => {
    const commentText = document.getElementById("comment-text").value.trim();
    const commentImage = document.getElementById("comment-image").files[0];

    if (!commentText) {
      alert("Veuillez entrer un commentaire.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vous devez être connecté pour commenter.");

      const formData = new FormData();
      formData.append("text", commentText);
      if (commentImage) formData.append("image", commentImage);

      const response = await fetch(
        `http://localhost:5000/comment/${geocacheId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors de l'ajout du commentaire.");

      document.getElementById("comment-text").value = "";
      document.getElementById("comment-image").value = "";

      loadComments();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  });

const loadComments = async () => {
  const commentsList = document.getElementById("comments-list");
  commentsList.innerHTML = "Chargement des commentaires...";

  try {
    const token = localStorage.getItem("token");
    if (!token)
      throw new Error("Vous devez être connecté pour voir les commentaires.");

    const response = await fetch(
      `http://localhost:5000/comment/${geocacheId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok)
      throw new Error("Erreur lors du chargement des commentaires.");

    const data = await response.json();
    commentsList.innerHTML = data.comments.length
      ? data.comments
          .map(
            (comment) => `
            <div class="comment">
              <p><strong>${comment.creator.username || "Anonyme"}</strong>: ${
              comment.text
            }</p>
              ${
                comment.image
                  ? `<img src="http://localhost:5000${comment.image}" alt="Image du commentaire" style="max-width: 200px; margin-top: 5px;"/>`
                  : ""
              }
            </div>`
          )
          .join("")
      : "<p>Aucun commentaire pour cette géocache.</p>";
  } catch (error) {
    console.error(error);
    commentsList.innerHTML = "<p>Impossible de charger les commentaires.</p>";
  }
};

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  alert("Vous avez été déconnecté.");
  window.location.href = "login.html";
});

document.getElementById("backToMapBtn")?.addEventListener("click", () => {
  window.location.href = "geoloc.html";
});

initializeMap();
