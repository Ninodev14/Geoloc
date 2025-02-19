import request from "supertest";

const API_URL = "https://galio-a9c7f612fd32.herokuapp.com";

describe("POST /login", () => {
  it("should log in successfully with valid credentials", async () => {
    const response = await request(API_URL).post("/login").send({
      email: "valid@example.com",
      password: "ValidPassword123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
  });

  it("should return an error with invalid credentials", async () => {
    const response = await request(API_URL).post("/login").send({
      email: "invalid@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Email ou mot de passe incorrect.");
  });

  it("should return an error if fields are missing", async () => {
    const response = await request(API_URL)
      .post("/login")
      .send({ email: "valid@example.com" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Tous les champs sont requis.");
  });

  it("should handle server errors gracefully", async () => {
    jest
      .spyOn(global, "fetch")
      .mockRejectedValue(new Error("Internal Server Error"));

    try {
      const response = await request(API_URL).post("/login").send({
        email: "valid@example.com",
        password: "ValidPassword123",
      });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Erreur serveur.");
    } catch (error) {
      console.error("Erreur simulée :", error);
    }
  });
});
