import request from "supertest";

describe("POST /register", () => {
  it("should register a user successfully with valid data", async () => {
    const formData = new FormData();
    formData.append("username", "john_doe");
    formData.append("email", "john@example.com");
    formData.append("password", "password123");

    const imageBuffer = Buffer.from("dummy image data");
    const blob = new Blob([imageBuffer], { type: "image/jpeg" });

    formData.append("profileImage", blob, "profile.jpg");

    const response = await request("https://galio-a9c7f612fd32.herokuapp.com")
      .post("/register")
      .field("username", "john_doe")
      .field("email", "john@example.com")
      .field("password", "password123")
      .attach("profileImage", blob, "profile.jpg");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Utilisateur enregistré avec succès");
  });

  it("should return an error when no image is provided", async () => {
    const response = await request("https://galio-a9c7f612fd32.herokuapp.com")
      .post("/register")
      .field("username", "john_doe")
      .field("email", "john@example.com")
      .field("password", "password123");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Veuillez sélectionner une image.");
  });

  it("should return an error for invalid data", async () => {
    const response = await request("https://galio-a9c7f612fd32.herokuapp.com")
      .post("/register")
      .field("username", "john_doe")
      .field("email", "invalid-email")
      .field("password", "password123")
      .attach("profileImage", Buffer.from("dummy image data"), "profile.jpg");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Email invalide");
  });

  it("should handle server errors gracefully", async () => {
    const response = await request("https://galio-a9c7f612fd32.herokuapp.com")
      .post("/register")
      .field("username", "john_doe")
      .field("email", "john@example.com")
      .field("password", "password123")
      .attach("profileImage", Buffer.from("dummy image data"), "profile.jpg");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Une erreur est survenue.");
  });
});
