import express, { Application } from "express";
import supertest from "supertest";
import { runBasicMiddlewares } from "../src/runBasicMiddlewares";
import { runRouteHandlers } from "../src/runRouteHandlers";

// minimal test setup
const app: Application = express();
runBasicMiddlewares(app);
runRouteHandlers(app);

describe("GET /", () => {
    const allowedOrigin = "https://example.com";

    describe("CORS", () => {
        // test preflight
        it("should return 204 for preflight", async () => {
            const response = await supertest(app)
                .options("/test")
                .set("Origin", allowedOrigin);

            expect(response.status).toBe(204);
            expect(response.headers["access-control-allow-origin"]).toBe(
                allowedOrigin
            );
            expect(response.headers["access-control-allow-methods"]).toBe(
                "GET"
            );
            expect(response.headers["access-control-allow-headers"]).toEqual(
                expect.stringContaining("Content-Type")
            );
            expect(response.headers["access-control-allow-headers"]).toEqual(
                expect.stringContaining("Authorization")
            );
        });

        it("should allow requests from allowed origins", async () => {
            const response = await supertest(app)
                .get("/test")
                .set("Origin", allowedOrigin);

            expect(response.headers["access-control-allow-origin"]).toBe(
                allowedOrigin
            );
        });

        it("should return 403 for CORS error", async () => {
            // Define a disallowed origin
            const disallowedOrigin = "http://example.com";

            // Make a GET request to your server from the disallowed origin
            const response = await supertest(app)
                .get("/test")
                .set("Origin", disallowedOrigin);

            // Assert that the server responds with CORS error
            expect(response.statusCode).toBe(403); // Or whatever status code your server responds with for CORS error
        });
    });

    it('should return 200 and "Hello, world!"', async () => {
        const response = await supertest(app).get("/hello");
        expect(response.status).toBe(200);
        expect(response.text).toBe("Hello, world!");
    });

    it("should return 404 for unknown path", async () => {
        const response = await supertest(app).get("/unknown");
        expect(response.status).toBe(404);
        expect(response.text).toBe("Path not found");
    });
});
