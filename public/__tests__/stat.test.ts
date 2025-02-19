import request from "supertest";

const API_URL = "https://galio-a9c7f612fd32.herokuapp.com";
let userToken: string;

describe("Classements et Géocaches Populaires", () => {
  beforeAll(async () => {
    const loginResponse = await request(API_URL).post("/login").send({
      email: "testuser@example.com",
      password: "UserPassword123",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("token");
    userToken = loginResponse.body.token;
  });

  it("should fetch user and geocache rankings", async () => {
    const response = await request(API_URL)
      .get("/rankings")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("userRankings");
    expect(response.body).toHaveProperty("geocacheRankings");

    if (response.body.userRankings.length > 0) {
      expect(response.body.userRankings[0]).toHaveProperty("username");
      expect(response.body.userRankings[0]).toHaveProperty("foundCount");
    }

    if (response.body.geocacheRankings.length > 0) {
      expect(response.body.geocacheRankings[0]).toHaveProperty("geocacheId");
      expect(response.body.geocacheRankings[0]).toHaveProperty("name");
      expect(response.body.geocacheRankings[0]).toHaveProperty("foundCount");
    }
  });

  it("should fetch most popular geocaches", async () => {
    const response = await request(API_URL).get("/most-popular-geocaches");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty("name");
      expect(response.body[0]).toHaveProperty("description");
      expect(response.body[0]).toHaveProperty("totalLikes");
    }
  });

  it("should return an error for unauthorized rankings fetch", async () => {
    const response = await request(API_URL).get("/rankings");

    expect(response.status).toBe(401);
  });
});
