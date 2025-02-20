const getGeocacheData = async (): Promise<void> => {
  const geocacheId = new URLSearchParams(window.location.search).get("id");
  if (!geocacheId) {
    console.error("ID de la géocache manquant dans l'URL.");
    return;
  }

  try {
    const response = await fetch(
      `https://galiotest.osc-fr1.scalingo.io/geocache/${geocacheId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await response.json();
    const geocache = data.geocache;

    (document.getElementById("name") as HTMLInputElement).value = geocache.name;
    (document.getElementById("creator") as HTMLInputElement).value =
      geocache.creator;
    (document.getElementById("description") as HTMLTextAreaElement).value =
      geocache.description;
    (document.getElementById("latitude") as HTMLInputElement).value =
      geocache.latitude.toString();
    (document.getElementById("longitude") as HTMLInputElement).value =
      geocache.longitude.toString();
    (document.getElementById("difficulty") as HTMLSelectElement).value =
      geocache.difficulty;
    (document.getElementById("password") as HTMLInputElement).value =
      geocache.password;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données de la géocache :",
      error
    );
  }
};

getGeocacheData();

document
  .getElementById("geocacheForm")
  ?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const geocacheId = new URLSearchParams(window.location.search).get("id");
    if (!geocacheId) {
      console.error("ID de la géocache introuvable.");
      return;
    }

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
        `https://galiotest.osc-fr1.scalingo.io/geocache/${geocacheId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(geocache),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la géocache.");
      }

      alert("Géocache mise à jour avec succès !");
      window.location.href = "geoloc.html";
    } catch (error) {
      console.error("Erreur :", error);
    }
  });
