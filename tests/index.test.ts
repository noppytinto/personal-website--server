import express from "express";
import supertest from "supertest";
import { runBasicMiddlewares } from "../src/runBasicMiddlewares";
import { runRouteHandlers } from "../src/runRouteHandlers";

// minimal test setup
const app = express();
runBasicMiddlewares(app);
runRouteHandlers(app);

const allowedOrigin = "https://example.com";

describe("GET /", () => {
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
            const response = await supertest(app)
                .get("/test")
                .set("Origin", "notallowed.com");

            expect(response.statusCode).toBe(403);
        });
    });

    it('should return 200 and "Hello, world!"', async () => {
        const response = await supertest(app)
            .get("/hello")
            .set("Origin", allowedOrigin);

        expect(response.status).toBe(200);
        expect(response.text).toBe("Hello, world!");
    });

    it("should return 404 for unknown path", async () => {
        const response = await supertest(app)
            .get("/unknown")
            .set("Origin", allowedOrigin);
        expect(response.status).toBe(404);
        expect(response.text).toBe("Path not found");
    });
});
