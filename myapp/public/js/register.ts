interface RegisterResponse {
  message?: string;
  error?: string;
}
document
  .getElementById("registerForm")
  ?.addEventListener("submit", async (e: Event) => {
    e.preventDefault();

    const usernameInput = document.getElementById(
      "username"
    ) as HTMLInputElement | null;
    const emailInput = document.getElementById(
      "email"
    ) as HTMLInputElement | null;
    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement | null;
    const imageInput = document.getElementById(
      "profileImage"
    ) as HTMLInputElement | null;
    const messageElement = document.getElementById(
      "message"
    ) as HTMLElement | null;

    if (
      !usernameInput ||
      !emailInput ||
      !passwordInput ||
      !imageInput ||
      !messageElement
    ) {
      console.error("Un ou plusieurs éléments du DOM sont introuvables.");
      return;
    }

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const imageFile = imageInput.files?.[0];

    if (!imageFile) {
      messageElement.textContent = "Veuillez sélectionner une image.";
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("profileImage", imageFile);

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        body: formData,
      });

      const data: RegisterResponse = await response.json();
      messageElement.textContent =
        data.message || data.error || "Une erreur est survenue.";

      if (data.message) {
        window.location.href = "/login.html";
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      messageElement.textContent = "Erreur de connexion. Veuillez réessayer.";
    }
  });
