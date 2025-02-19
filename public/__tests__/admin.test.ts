import request from "supertest";

const API_URL = "https://galio-a9c7f612fd32.herokuapp.com";

describe("Admin Authentication & User Management", () => {
  let adminToken: string;
  let userToken: string;
  let testUserEmail = "testuser@example.com";

  beforeAll(async () => {
    // Connexion admin
    const adminResponse = await request(API_URL).post("/login").send({
      email: "admin@example.com",
      password: "AdminPassword123",
    });

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body).toHaveProperty("token");
    adminToken = adminResponse.body.token;

    // Connexion utilisateur
    const userResponse = await request(API_URL).post("/login").send({
      email: testUserEmail,
      password: "UserPassword123",
    });

    expect(userResponse.status).toBe(200);
    expect(userResponse.body).toHaveProperty("token");
    userToken = userResponse.body.token;
  });

  it("should restrict access for non-admin users", async () => {
    const response = await request(API_URL)
      .get("/profile")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Accès interdit ou utilisateur non administrateur."
    );
  });

  it("should allow admin to fetch users", async () => {
    const response = await request(API_URL)
      .get("/admin/user")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("users");
    expect(Array.isArray(response.body.users)).toBe(true);
  });

  it("should allow admin to promote a user", async () => {
    const response = await request(API_URL)
      .post("/make-admin")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: testUserEmail });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Utilisateur promu avec succès.");
  });

  it("should allow admin to edit a user", async () => {
    const response = await request(API_URL)
      .put("/edit-user")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: testUserEmail,
        newUsername: "UpdatedUser",
        newIsAdmin: true,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Utilisateur mis à jour avec succès.");
  });

  it("should allow admin to delete a user", async () => {
    const response = await request(API_URL)
      .delete("/delete-user")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: testUserEmail });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Utilisateur supprimé avec succès.");
  });

  it("should return an error if user is not found", async () => {
    const response = await request(API_URL)
      .delete("/delete-user")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "nonexistent@example.com" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Utilisateur introuvable.");
  });

  it("should handle server errors gracefully", async () => {
    jest
      .spyOn(global, "fetch")
      .mockRejectedValue(new Error("Internal Server Error"));

    try {
      const response = await request(API_URL)
        .get("/admin/user")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Erreur serveur.");
    } catch (error) {
      console.error("Erreur simulée :", error);
    }
  });
});
