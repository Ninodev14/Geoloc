document
  .getElementById("loginForm")
  ?.addEventListener("submit", async (e: Event) => {
    e.preventDefault();

    const emailInput = document.getElementById(
      "email"
    ) as HTMLInputElement | null;
    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement | null;
    const messageElement = document.getElementById(
      "message"
    ) as HTMLElement | null;

    if (!emailInput || !passwordInput || !messageElement) {
      console.error("Un ou plusieurs éléments du DOM sont introuvables.");
      return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      const response = await fetch(
        "https://galio-a9c7f612fd32.herokuapp.com/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data: { token?: string; error?: string } = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "geoloc.html";
      } else {
        messageElement.textContent = data.error || "Une erreur est survenue.";
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      if (messageElement) {
        messageElement.textContent = "Erreur de connexion. Veuillez réessayer.";
      }
    }
  });
