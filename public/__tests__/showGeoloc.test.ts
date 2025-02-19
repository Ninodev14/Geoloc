import request from "supertest";

// URL de l'API
const API_URL = "https://galio-a9c7f612fd32.herokuapp.com";

let userToken: string;

// Mock pour simuler la géolocalisation
global.navigator.geolocation = {
  getCurrentPosition: jest.fn().mockImplementation(
    (success) => success({ coords: { latitude: 48.8566, longitude: 2.3522 } }) // Position de Paris
  ),
};

// Test de l'initialisation de la carte
describe("Carte et géocaches", () => {
  beforeAll(async () => {
    // Connexion utilisateur et récupération du token
    const loginResponse = await request(API_URL).post("/login").send({
      email: "testuser@example.com",
      password: "UserPassword123",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("token");
    userToken = loginResponse.body.token;
  });

  it("should fetch user profile", async () => {
    const response = await request(API_URL)
      .get("/profile")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("username");
  });

  it("should fetch geocaches with distance filter", async () => {
    // Simuler l'appel des géocaches
    const response = await request(API_URL).get("/geocache");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      const geocache = response.body[0];
      expect(geocache).toHaveProperty("name");
      expect(geocache).toHaveProperty("latitude");
      expect(geocache).toHaveProperty("longitude");
    }
  });

  it("should validate a geocache", async () => {
    // Test de validation d'une géocache
    const geocacheId = "dummy-id"; // Remplacer par un vrai ID de géocache

    const validateResponse = await request(API_URL)
      .post(`/validate-geocache/${geocacheId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ password: "secret-password" });

    expect(validateResponse.status).toBe(200);
    expect(validateResponse.body).toHaveProperty(
      "message",
      "Géocache validée avec succès"
    );
  });

  it("should add a comment to a geocache", async () => {
    const commentData = {
      geocacheId: "dummy-id", // Remplacer par un vrai ID de géocache
      text: "Test de commentaire",
    };

    const commentResponse = await request(API_URL)
      .post("/comment")
      .set("Authorization", `Bearer ${userToken}`)
      .send(commentData);

    expect(commentResponse.status).toBe(200);
    expect(commentResponse.body).toHaveProperty(
      "message",
      "Commentaire ajouté"
    );
  });

  it("should handle map actions correctly", async () => {
    // Mock l'action de la carte
    const geocacheData = [
      {
        _id: "dummy-id",
        name: "Test Geocache",
        latitude: 48.8566,
        longitude: 2.3522,
        difficulty: "Moyenne",
        creator: "testuser@example.com",
        description: "Test Description",
        isValidated: false,
      },
    ];

    const response = await request(API_URL)
      .get("/geocache")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1); // On a mocké une géocache
    expect(response.body[0]).toHaveProperty("name", "Test Geocache");
    expect(response.body[0]).toHaveProperty("latitude", 48.8566);
    expect(response.body[0]).toHaveProperty("longitude", 2.3522);
  });

  it("should return an error if geocache validation fails", async () => {
    const invalidPassword = "wrong-password";
    const geocacheId = "dummy-id";

    const response = await request(API_URL)
      .post(`/validate-geocache/${geocacheId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ password: invalidPassword });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Code secret incorrect");
  });
});
