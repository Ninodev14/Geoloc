import request from "supertest";

const API_URL = "https://galio-a9c7f612fd32.herokuapp.com";
let userToken: string;
let geocacheId: string;

describe("Geocache Retrieval and Update", () => {
  beforeAll(async () => {
    const loginResponse = await request(API_URL).post("/login").send({
      email: "testuser@example.com",
      password: "UserPassword123",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("token");
    userToken = loginResponse.body.token;

    const geocacheResponse = await request(API_URL)
      .post("/geocache")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Geocache Test",
        creator: "testuser",
        description: "Ceci est une géocache de test",
        latitude: 48.8566,
        longitude: 2.3522,
        difficulty: "3",
        password: "secret123",
      });

    expect(geocacheResponse.status).toBe(201);
    geocacheId = geocacheResponse.body.geocache._id;
  });

  it("should retrieve geocache data", async () => {
    const response = await request(API_URL)
      .get(`/geocache/${geocacheId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("geocache");
    expect(response.body.geocache.name).toBe("Geocache Test");
  });

  it("should update geocache data", async () => {
    const updatedGeocache = {
      name: "Geocache Test Modifiée",
      creator: "testuser",
      description: "Description mise à jour",
      latitude: 40.7128,
      longitude: -74.006,
      difficulty: "4",
      password: "newpassword",
    };

    const response = await request(API_URL)
      .put(`/geocache/${geocacheId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updatedGeocache);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Géocache mise à jour.");

    const getUpdatedResponse = await request(API_URL)
      .get(`/geocache/${geocacheId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(getUpdatedResponse.status).toBe(200);
    expect(getUpdatedResponse.body.geocache.name).toBe(
      "Geocache Test Modifiée"
    );
    expect(getUpdatedResponse.body.geocache.description).toBe(
      "Description mise à jour"
    );
  });

  it("should fail to update geocache with invalid data", async () => {
    const response = await request(API_URL)
      .put(`/geocache/${geocacheId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "" });

    expect(response.status).toBe(400);
  });

  afterAll(async () => {
    const response = await request(API_URL)
      .delete(`/geocache/${geocacheId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Géocache supprimée.");
  });
});
