import request from "supertest";

const API_URL = "https://galio-a9c7f612fd32.herokuapp.com";
let userToken: string;
let geocacheId: string;
let commentId: string;

describe("Geocache System", () => {
  beforeAll(async () => {
    const userResponse = await request(API_URL).post("/login").send({
      email: "testuser@example.com",
      password: "UserPassword123",
    });

    expect(userResponse.status).toBe(200);
    expect(userResponse.body).toHaveProperty("token");
    userToken = userResponse.body.token;
  });

  it("should create a new geocache", async () => {
    const response = await request(API_URL)
      .post("/geocache")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        latitude: 48.8566,
        longitude: 2.3522,
        name: "Géocache Test",
        description: "Une super géocache à Paris",
        difficulty: 3,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("geocache");
    geocacheId = response.body.geocache._id;
  });

  it("should retrieve the geocache details", async () => {
    const response = await request(API_URL)
      .get(`/geocache/${geocacheId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.geocache).toHaveProperty("name", "Géocache Test");
  });

  it("should allow a user to like the geocache", async () => {
    const response = await request(API_URL)
      .post(`/geocache/${geocacheId}/like`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ userId: "testUserId" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Like ajouté.");
  });

  it("should allow a user to comment on the geocache", async () => {
    const response = await request(API_URL)
      .post(`/comment/${geocacheId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ text: "Superbe géocache !" });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("comment");
    commentId = response.body.comment._id;
  });

  it("should retrieve comments for the geocache", async () => {
    const response = await request(API_URL)
      .get(`/comment/${geocacheId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.comments)).toBe(true);
  });

  it("should allow a user to like a comment", async () => {
    const response = await request(API_URL)
      .post(`/comment/${commentId}/like`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Like ajouté.");
  });

  it("should delete the test geocache", async () => {
    const response = await request(API_URL)
      .delete(`/geocache/${geocacheId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Géocache supprimée.");
  });
});
