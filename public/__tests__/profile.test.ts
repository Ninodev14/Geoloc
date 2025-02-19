const request = require("supertest");
const app = require("../../server");

describe("GET /profile", () => {
  let validToken;
  let invalidToken;

  beforeAll(() => {
    validToken = jwt.sign(
      { username: "testUser", email: "testuser@example.com", isAdmin: true },
      "secret_key"
    );
    invalidToken = "invalidToken123";
  });

  test("devrait renvoyer 401 si aucun token est présent", async () => {
    const response = await request(app).get("/profile").expect(401);

    expect(response.body.message).toBe("Token manquant ou invalide");
  });

  test("devrait renvoyer 401 si le token est invalide", async () => {
    const response = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${invalidToken}`)
      .expect(401);

    expect(response.body.message).toBe("Token invalide");
  });

  test("devrait renvoyer 200 avec un profil valide si le token est correct", async () => {
    const response = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${validToken}`)
      .expect(200);
    expect(response.body.user).toHaveProperty("username", "testUser");
    expect(response.body.user).toHaveProperty("email", "testuser@example.com");
    expect(response.body.user).toHaveProperty("isAdmin", true);
  });

  test("devrait renvoyer 401 si le token est manquant dans l'en-tête", async () => {
    const response = await request(app).get("/profile").expect(401);
    expect(response.body.message).toBe("Token manquant ou invalide");
  });
});
