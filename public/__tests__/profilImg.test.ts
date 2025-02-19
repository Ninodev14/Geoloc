const request = require("supertest");
const app = require("../../server");

describe("GET /profile", () => {
  let token;

  beforeAll(() => {
    token = "validJwtTokenHere";
  });

  test("devrait renvoyer 401 si pas de token", async () => {
    const response = await request(app).get("/profile").expect(401);
    expect(response.body.message).toBe("Token manquant ou invalide");
  });

  test("devrait renvoyer 200 avec un profil valide si token est correct", async () => {
    const response = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty("username");
    expect(response.body).toHaveProperty("profileImage");
  });

  test("devrait renvoyer 401 si le token est invalide", async () => {
    const invalidToken = "invalidJwtTokenHere";
    const response = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${invalidToken}`)
      .expect(401);

    expect(response.body.message).toBe("Token invalide");
  });
});
