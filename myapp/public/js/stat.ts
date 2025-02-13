interface UserRanking {
  username: string;
  foundCount: number;
}

interface GeocacheRanking {
  geocacheId: string;
  name: string;
  foundCount: number;
}

const fetchRankings = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Utilisateur non connecté.");
      return;
    }

    const response = await fetch("http://localhost:5000/rankings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors du chargement du classement.");
    }

    const { userRankings, geocacheRankings } = await response.json();
    displayRankings(userRankings, geocacheRankings);
  } catch (error) {
    console.error("Erreur lors de la récupération du classement:", error);
  }
};

const displayRankings = (
  userRankings: UserRanking[],
  geocacheRankings: GeocacheRanking[]
): void => {
  const userRankingList = document.getElementById("user-ranking-list");
  const geocacheRankingList = document.getElementById("geocache-ranking-list");

  if (userRankingList) {
    userRankingList.innerHTML = userRankings
      .map(
        (user, index) =>
          `<li><strong>#${index + 1} ${user.username}</strong> - ${
            user.foundCount
          } géocaches trouvées</li>`
      )
      .join("");
  }

  if (geocacheRankingList) {
    geocacheRankingList.innerHTML = geocacheRankings
      .map(
        (geocache, index) =>
          `<li><strong>#${index + 1} ${geocache.name}</strong> - ${
            geocache.foundCount
          } fois trouvée</li>`
      )
      .join("");
  }
};

const loadMostPopularGeocache = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/most-popular-geocaches"
    );

    if (!response.ok) {
      throw new Error(
        "Erreur lors de la récupération des géocaches populaires."
      );
    }

    const geocaches = await response.json();
    console.log("Réponse API côté frontend :", geocaches);

    const popularContainer = document.getElementById("popular-geocache");
    if (!popularContainer) return;

    if (!geocaches || geocaches.length === 0) {
      popularContainer.innerHTML = "<p>Aucune géocache populaire trouvée.</p>";
    } else {
      popularContainer.innerHTML = `
        <h3>🏆 Top 10 des Géocaches les plus populaires</h3>
        <ul>
          ${geocaches
            .map(
              (geo, index) => `
                <li>
                  <strong>#${index + 1} ${geo.name || "Nom inconnu"}</strong> - 
                  ${geo.description || "Pas de description disponible"} - 
                  ❤️ ${geo.totalLikes ?? 0} likes
                </li>
              `
            )
            .join("")}
        </ul>
      `;
    }
  } catch (error) {
    console.error(error);
  }
};

loadMostPopularGeocache();

document.addEventListener("DOMContentLoaded", fetchRankings);
