const getToken = (): string | null => localStorage.getItem("token");

const checkAuthentication = async (): Promise<void> => {
  const token: string | null = getToken();
  if (!token) {
    window.location.href = "/index.html";
    return;
  }

  try {
    const response: Response = await fetch(
      "https://galio-a9c7f612fd32.herokuapp.com/profile",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data: {
      user?: { username: string; profileImage?: string; isAdmin?: boolean };
      error?: string;
    } = await response.json();

    if (response.ok && data.user && data.user.isAdmin) {
      fetchUsers(token);
    } else {
      console.error("Accès interdit ou utilisateur non administrateur.");
      window.location.href = "/geoloc.html";
    }
  } catch (error) {
    console.error("Erreur d'authentification :", error);
    window.location.href = "/index.html";
  }
};

const fetchUsers = (token: string) => {
  fetch("https://galio-a9c7f612fd32.herokuapp.com/admin/user", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.getElementById("userTableBody");
      tbody.innerHTML = "";
      data.users.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.isAdmin ? "Admin" : "Utilisateur"}</td>
                <td>
                  <button onclick="editUser('${user.email}')">Modifier</button>
                  ${
                    !user.isAdmin
                      ? `<button onclick="makeAdmin('${user.email}')">Promouvoir</button>`
                      : ""
                  }
                  <button onclick="deleteUser('${
                    user.email
                  }')">Supprimer</button>
                </td>
              `;
        tbody.appendChild(row);
      });
    })
    .catch((error) =>
      console.error("Erreur lors de la récupération des utilisateurs:", error)
    );
};

const makeAdmin = (email) => {
  const token = getToken();
  if (!token) return;

  fetch("https://galio-a9c7f612fd32.herokuapp.com/make-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  }).then(() => fetchUsers(token));
};

const editUser = (email) => {
  const newUsername = prompt("Entrez le nouveau nom d'utilisateur:");
  const newIsAdmin = confirm("L'utilisateur doit-il être administrateur?");
  if (!newUsername) return;

  const token = getToken();
  fetch("https://galio-a9c7f612fd32.herokuapp.com/edit-user", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, newUsername, newIsAdmin }),
  })
    .then(() => fetchUsers(token))
    .catch((error) => console.error("Erreur de modification:", error));
};

const deleteUser = (email) => {
  const token = getToken();
  if (!token) return;

  fetch("https://galio-a9c7f612fd32.herokuapp.com/delete-user", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        console.error("Erreur lors de la suppression:", data.error);
      } else {
        fetchUsers(token);
      }
    })
    .catch((error) => {
      console.error("Erreur de requête:", error);
    });
};

window.onload = checkAuthentication;
