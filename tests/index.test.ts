import request from "supertest";
import express, { Request, Response } from "express";
import app from "../src/app";

describe("GET /", () => {
    it('should return 200 and "Hello, world!"', async () => {
        const response = await request(app).get("/");
        expect(response.status).toBe(200);
        expect(response.text).toBe("Hello, world!");
    });
});
