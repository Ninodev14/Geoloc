const getToken = (): string | null => localStorage.getItem("token");
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (event: Event) => {
      event.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }
});

const checkAuthentication = async (): Promise<void> => {
  const token: string | null = getToken();
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const response: Response = await fetch(
      "https://galiotest.osc-fr1.scalingo.io/profile",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data: {
      user?: { username: string; profileImage?: string };
      error?: string;
    } = await response.json();

    if (response.ok && data.user) {
      const usernameElement = document.getElementById("username");
      const profileImageElement = document.getElementById(
        "profile-image"
      ) as HTMLImageElement | null;

      if (usernameElement) {
        usernameElement.textContent = data.user.username;
      }
      if (profileImageElement && data.user.profileImage) {
        profileImageElement.src = data.user.profileImage;
      }
    } else {
      console.error("Erreur lors de la récupération du profil :", data.error);
      window.location.href = "index.html";
    }
  } catch (error) {
    console.error("Erreur :", error);
    window.location.href = "index.html";
  }
};

window.onload = checkAuthentication;
