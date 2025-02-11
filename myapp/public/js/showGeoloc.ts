const leafletScript = document.createElement("script");
leafletScript.src = "https://unpkg.com/leaflet/dist/leaflet.js";
leafletScript.onload = () => initializeMap();
document.head.appendChild(leafletScript);

let map: L.Map;
let selectedGeocacheId: string | null = null;
const greenIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
  iconSize: [32, 32],
});

const defaultIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252032.png",
  iconSize: [32, 32],
});

let distanceLimit: number = 10;

const initializeMap = () => {
  map = L.map("map").setView([48.8566, 2.3522], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  getUserData();

  const distanceFilter = document.getElementById(
    "distance-filter"
  ) as HTMLSelectElement;
  distanceFilter.addEventListener("change", (event) => {
    distanceLimit = parseInt((event.target as HTMLSelectElement).value, 10); // Update distance limit
    loadGeocaches(); // Reload geocaches with the new filter
  });
};

const getUserLocation = (): Promise<L.LatLng> => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          resolve(L.latLng(lat, lon));
        },
        (error) => reject(error)
      );
    } else {
      reject("La géolocalisation n'est pas supportée");
    }
  });
};

let userData: {
  username: string;
  profileImage?: string;
  isAdmin?: boolean;
} | null = null;

const getUserData = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé.");
      return;
    }

    const response = await fetch("http://localhost:5000/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        "Erreur lors de la récupération des données utilisateur."
      );
    }

    const data = await response.json();
    userData = data.user;
    document.getElementById("username")!.textContent = userData.username;

    if (userData.profileImage) {
      (
        document.getElementById("profile-image") as HTMLImageElement
      ).src = `http://localhost:5000/${userData.profileImage}`;
    }

    loadGeocaches();
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données utilisateur:",
      error
    );
  }
};

const loadGeocaches = async (): Promise<void> => {
  try {
    const response = await fetch("http://localhost:5000/geocache");
    if (!response.ok) {
      throw new Error("Erreur lors du chargement des géocaches.");
    }

    const geocaches: Array<{
      _id: string;
      name: string;
      difficulty: string;
      creator: string;
      description: string;
      latitude: number;
      longitude: number;
      isValidated: boolean;
    }> = await response.json();

    const token = localStorage.getItem("token");
    let validatedGeocaches: Array<string> = [];

    if (token) {
      const validationResponse = await fetch(
        "http://localhost:5000/validated-geocaches",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      validatedGeocaches = await validationResponse.json();
    }

    // Récupérer l'ID utilisateur depuis localStorage
    const userId = userData?.username; // Utiliser le username comme ID unique

    if (!userId) {
      console.error("Utilisateur non trouvé");
      return;
    }

    // Vérifier les géocaches validées dans le localStorage pour cet utilisateur
    const localValidatedGeocaches = JSON.parse(
      localStorage.getItem(`validatedGeocaches_${userId}`) || "[]"
    );

    const userLocation = await getUserLocation();

    geocaches.forEach((geo) => {
      const geoLocation = L.latLng(geo.latitude, geo.longitude);
      const distanceToGeo = userLocation.distanceTo(geoLocation) / 1000;

      if (distanceLimit > 0 && distanceToGeo > distanceLimit) {
        return;
      }

      // Vérifier si cette géocache a été validée par l'utilisateur actuel
      const isValidatedLocally =
        localValidatedGeocaches.includes(geo._id) ||
        validatedGeocaches.includes(geo._id);

      let popupContent = `<b>${geo.name}</b><br>
        Difficulté: ${geo.difficulty}<br>
        Créée par: ${geo.creator}<br>
        Description: ${geo.description}<br>`;

      if (userData && (userData.username === geo.creator || userData.isAdmin)) {
        popupContent += ` 
          <button class="editBtn" data-id="${geo._id}" style="margin-top: 10px;">Modifier</button>
          <button class="deleteBtn" data-id="${geo._id}" style="margin-top: 10px;">Supprimer</button>
        `;
      }

      if (!isValidatedLocally) {
        popupContent += `<button class="validateBtn" data-id="${geo._id}" style="margin-top: 10px;">Valider</button>`;
      }

      popupContent += `<button class="show-comments-btn" data-id="${geo._id}" style="margin-top: 10px;">Voir Commentaires</button>`;

      // Si validée par l'utilisateur ou globalement validée, utiliser greenIcon
      const markerIcon =
        isValidatedLocally || geo.isValidated ? greenIcon : defaultIcon;

      const marker = L.marker([geo.latitude, geo.longitude], {
        icon: markerIcon,
      })
        .addTo(map)
        .bindPopup(popupContent);

      marker.on("popupopen", () => {
        const editBtn = document.querySelector(
          `.editBtn[data-id="${geo._id}"]`
        ) as HTMLButtonElement | null;
        const deleteBtn = document.querySelector(
          `.deleteBtn[data-id="${geo._id}"]`
        ) as HTMLButtonElement | null;
        const showCommentsBtn = document.querySelector(
          `.show-comments-btn[data-id="${geo._id}"]`
        ) as HTMLButtonElement | null;
        const validateBtn = document.querySelector(
          `.validateBtn[data-id="${geo._id}"]`
        );

        if (editBtn) {
          editBtn.addEventListener("click", () => {
            window.location.href = `edit_geocache.html?id=${geo._id}`;
          });
        }

        if (validateBtn) {
          validateBtn.addEventListener("click", () => {
            const code = prompt("Entrez le code secret de la géocache :");
            if (code) {
              validateGeocache(geo._id, code, marker);
            }
          });
        }

        if (deleteBtn) {
          deleteBtn.addEventListener("click", async () => {
            const confirmed = confirm(
              "Êtes-vous sûr de vouloir supprimer cette géocache ?"
            );
            if (confirmed) {
              const token = localStorage.getItem("token");
              await fetch(`http://localhost:5000/geocache/${geo._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              alert("Géocache supprimée avec succès.");
              location.reload();
            }
          });
        }

        if (showCommentsBtn) {
          showCommentsBtn.addEventListener("click", () => {
            window.location.href = `commentaires.html?id=${geo._id}`;
          });
        }
      });
    });
  } catch (error) {
    console.error("Erreur de chargement des géocaches:", error);
  }
};

const validateGeocache = async (geocacheId, code, marker) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:5000/validate-geocache/${geocacheId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: code }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert(data.message);

      // Mettre à jour l'icône du marqueur pour indiquer que la géocache est validée
      marker.setIcon(greenIcon);

      // Récupérer l'ID utilisateur depuis localStorage
      const userId = userData?.username; // Utiliser le username comme ID unique

      if (!userId) {
        console.error("Utilisateur non trouvé");
        return;
      }

      // Ajouter cette géocache à la liste validée localement pour l'utilisateur
      const validatedGeocaches = JSON.parse(
        localStorage.getItem(`validatedGeocaches_${userId}`) || "[]"
      );
      if (!validatedGeocaches.includes(geocacheId)) {
        validatedGeocaches.push(geocacheId);
        localStorage.setItem(
          `validatedGeocaches_${userId}`,
          JSON.stringify(validatedGeocaches)
        );
      }

      // Supprimer le bouton de validation dans l'interface
      const validateBtn = document.querySelector(
        `.validateBtn[data-id="${geocacheId}"]`
      );
      if (validateBtn) {
        validateBtn.remove();
      }
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Erreur lors de la validation :", error);
  }
};

const loadComments = async (geocacheId: string) => {
  const commentsList = document.getElementById("comments-list");
  if (!commentsList) return;

  const response = await fetch(`http://localhost:5000/comment/${geocacheId}`);
  const data = await response.json();

  commentsList.innerHTML = data.comments
    .map(
      (comment) =>
        `<div class="comment">
          <p><strong>${comment.username}</strong>: ${comment.text}</p>
        </div>`
    )
    .join("");
};

document
  .getElementById("submit-comment")
  ?.addEventListener("click", async () => {
    if (selectedGeocacheId === null) return;

    const commentText = (
      document.getElementById("comment-text") as HTMLTextAreaElement
    ).value;
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5000/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        geocacheId: selectedGeocacheId,
        text: commentText,
      }),
    });

    if (response.ok) {
      loadComments(selectedGeocacheId);
      alert("Commentaire ajouté !");
    } else {
      alert("Erreur lors de l'ajout du commentaire.");
    }
  });

document.getElementById("addGeocacheBtn")?.addEventListener("click", () => {
  window.location.href = "create_geocache.html";
});
