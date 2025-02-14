import request from "supertest";
import { Server } from "http";
import app from "../../server";

beforeAll(() => {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
});

jest.mock("localStorage", () => ({
  getItem: jest.fn(),
}));

const server: Server = app.listen(5000);

describe("Authentication and User management API", () => {
  afterAll(() => {
    server.close();
  });

  describe("GET /profile", () => {
    it("should redirect to /index.html if no token is found", async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null); // Simuler l'absence de token

      await request(server)
        .get("/profile")
        .expect(302)
        .expect("Location", "/index.html");
    });

    it("should fetch user data if valid token is provided", async () => {
      const token = "validToken";
      (localStorage.getItem as jest.Mock).mockReturnValue(token);

      // Simuler la réponse de l'API
      const mockResponse = {
        user: { username: "admin", isAdmin: true },
      };

      // Tester la fonction avec un token valide
      await request(server)
        .get("/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res) => {
          expect(res.body.user).toEqual(mockResponse.user);
        });
    });

    it("should redirect to /geoloc.html if user is not admin", async () => {
      const token = "validToken";
      (localStorage.getItem as jest.Mock).mockReturnValue(token);

      // Simuler une réponse de profil sans droits admin
      const mockResponse = {
        user: { username: "user", isAdmin: false },
      };

      await request(server)
        .get("/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(302)
        .expect("Location", "/geoloc.html");
    });
  });

  // Continuez avec les autres tests...
});
