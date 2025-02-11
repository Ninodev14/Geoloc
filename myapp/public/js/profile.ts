const getToken = (): string | null => localStorage.getItem("token");

const fetchProfile = async () => {
  const token = getToken();
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data: {
      user?: { username?: string; email?: string; profileImage?: string };
      error?: string;
    } = await response.json();

    if (response.ok && data.user) {
      document.getElementById("username")!.textContent = `Nom d'utilisateur: ${
        data.user.username || "Non disponible"
      }`;
      document.getElementById("email")!.textContent = `Email: ${
        data.user.email || "Non disponible"
      }`;

      const profileImageElement = document.getElementById(
        "profileImage"
      ) as HTMLImageElement | null;
      if (profileImageElement && data.user.profileImage) {
        profileImageElement.src = data.user.profileImage;
        profileImageElement.style.display = "block";
      }
    } else {
      document.getElementById("username")!.textContent =
        "Erreur lors de la récupération du profil.";
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du profil", error);
    window.location.href = "/login.html";
  }
};

// Déconnexion
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("profileImage");
  window.location.href = "/index.html";
});

fetchProfile();
