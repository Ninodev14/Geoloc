const getUserData = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé dans le localStorage.");
      return;
    }

    const response = await fetch(
      "https://galiotest.osc-fr1.scalingo.io/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Erreur lors de la récupération des données utilisateur."
      );
    }

    const data = await response.json();
    const creatorInput = document.getElementById("creator") as HTMLInputElement;
    if (creatorInput) {
      creatorInput.value = data.user.username;
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données utilisateur:",
      error
    );
  }
};

getUserData();

document
  .getElementById("geocacheForm")
  ?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const geocache = {
      name: (document.getElementById("name") as HTMLInputElement).value,
      creator: (document.getElementById("creator") as HTMLInputElement).value,
      description: (
        document.getElementById("description") as HTMLTextAreaElement
      ).value,
      latitude: parseFloat(
        (document.getElementById("latitude") as HTMLInputElement).value
      ),
      longitude: parseFloat(
        (document.getElementById("longitude") as HTMLInputElement).value
      ),
      difficulty: (document.getElementById("difficulty") as HTMLSelectElement)
        .value,
      password: (document.getElementById("password") as HTMLInputElement).value,
    };

    try {
      const response = await fetch(
        "https://galiotest.osc-fr1.scalingo.io/geocache",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(geocache),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la géocache.");
      }

      alert("Géocache ajoutée avec succès !");
      window.location.href = "geoloc.html";
    } catch (error) {
      console.error("Erreur :", error);
    }
  });
