import request from "supertest";

const API_URL = "https://galio-a9c7f612fd32.herokuapp.com";
let userToken: string;
let geocacheId: string;

describe("User and Geocache Operations", () => {
  beforeAll(async () => {
    const loginResponse = await request(API_URL).post("/login").send({
      email: "testuser@example.com",
      password: "UserPassword123",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("token");
    userToken = loginResponse.body.token;
  });

  it("should retrieve user profile data", async () => {
    const response = await request(API_URL)
      .get("/profile")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("username");
  });

  it("should create a new geocache", async () => {
    const geocacheData = {
      name: "Test Geocache",
      creator: "testuser",
      description: "Ceci est une géocache de test",
      latitude: 48.8566,
      longitude: 2.3522,
      difficulty: "3",
      password: "secret123",
    };

    const response = await request(API_URL)
      .post("/geocache")
      .set("Authorization", `Bearer ${userToken}`)
      .send(geocacheData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("geocache");
    geocacheId = response.body.geocache._id;
  });

  it("should fail to create a geocache without required fields", async () => {
    const response = await request(API_URL)
      .post("/geocache")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Incomplete Geocache" });

    expect(response.status).toBe(400);
  });

  it("should delete the test geocache", async () => {
    const response = await request(API_URL)
      .delete(`/geocache/${geocacheId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Géocache supprimée.");
  });
});
