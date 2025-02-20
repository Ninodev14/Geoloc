interface Geocache {
  geocache: {
    latitude: number;
    longitude: number;
    name: string;
    description: string;
    difficulty: number;
    creator: string;
    likes: string[];
  };
}

interface Comment {
  text: string;
  creator: {
    username: string;
  };
  image?: string;
}
const getCurrentUserId = (token: string | null): string | null => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId;
  } catch (error) {
    console.error("Erreur lors du décodage du token", error);
    return null;
  }
};

let map: L.Map | undefined;
const geocacheId: string | null = new URLSearchParams(
  window.location.search
).get("id");

const initializeMap = async (): Promise<void> => {
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
      `https://galiotest.osc-fr1.scalingo.io/geocache/${geocacheId}`,
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

    const geocache: Geocache = await response.json();

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

    const likeButton = document.getElementById("like-geocache-btn");
    if (likeButton && geocache.geocache.likes) {
      likeButton.innerHTML = `❤️ Aimer la Géocache (${geocache.geocache.likes.length})`;
    }

    loadComments();
  } catch (error) {
    console.error(error);
    alert((error as Error).message);
  }
};

document
  .getElementById("submit-comment")
  ?.addEventListener("click", async () => {
    const commentText = (
      document.getElementById("comment-text") as HTMLInputElement
    )?.value.trim();
    const commentImage = (
      document.getElementById("comment-image") as HTMLInputElement
    )?.files?.[0];

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
        `https://galiotest.osc-fr1.scalingo.io/comment/${geocacheId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors de l'ajout du commentaire.");

      (document.getElementById("comment-text") as HTMLInputElement).value = "";
      (document.getElementById("comment-image") as HTMLInputElement).value = "";

      loadComments();
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  });

const loadComments = async () => {
  const commentsList = document.getElementById("comments-list");
  if (!commentsList) return;

  commentsList.innerHTML = "Chargement des commentaires...";

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Vous devez être connecté.");

    const response = await fetch(
      `https://galiotest.osc-fr1.scalingo.io/comment/${geocacheId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Erreur de chargement des commentaires.");

    const data = await response.json();

    commentsList.innerHTML = data.comments.length
      ? data.comments
          .map(
            (comment) => ` 
            <div class="comment" data-id="${comment._id}">
              <p><strong>${comment.creator.username || "Anonyme"}</strong>: ${
              comment.text
            }</p>
              ${
                comment.image
                  ? `<img src="https://galiotest.osc-fr1.scalingo.io/${comment.image}" style="max-width: 200px;"/>`
                  : ""
              }
            </div>`
          )
          .join("")
      : "<p>Aucun commentaire.</p>";
  } catch (error) {
    console.error(error);
    commentsList.innerHTML = "<p>Impossible de charger les commentaires.</p>";
  }
};

document
  .getElementById("like-geocache-btn")
  ?.addEventListener("click", async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("Vous devez être connecté pour aimer cette géocache.");

      const currentUserId = getCurrentUserId(token);

      if (!currentUserId)
        throw new Error("Impossible de récupérer l'ID de l'utilisateur.");

      const response = await fetch(
        `https://galiotest.osc-fr1.scalingo.io/geocache/${geocacheId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: currentUserId }),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error details:", errorResponse);
        throw new Error(
          errorResponse.message || "Erreur lors de l'ajout du like."
        );
      }

      updateLikeCount();
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  });

const updateLikeCount = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Vous devez être connecté.");

    const response = await fetch(
      `https://galiotest.osc-fr1.scalingo.io/geocache/${geocacheId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Erreur de récupération des données.");

    const geocache: Geocache = await response.json();

    const likeButton = document.getElementById("like-geocache-btn");
    if (likeButton && geocache.geocache.likes) {
      likeButton.innerHTML = `❤️ Aimer la Géocache (${geocache.geocache.likes.length})`;
    }
  } catch (error) {
    console.error(error);
  }
};

const likeComment = async (commentId, btn) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Vous devez être connecté.");

    const response = await fetch(
      `https://galiotest.osc-fr1.scalingo.io/comment/${commentId}/like`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Erreur lors du like.");

    const currentLikes = btn.querySelector("span");
    currentLikes.textContent = parseInt(currentLikes.textContent) + 1;
  } catch (error) {
    console.error(error);
    alert("Erreur lors du like.");
  }
};

loadComments();

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  alert("Vous avez été déconnecté.");
  window.location.href = "login.html";
});

document.getElementById("backToMapBtn")?.addEventListener("click", () => {
  window.location.href = "geoloc.html";
});

initializeMap();
