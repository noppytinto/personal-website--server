import express, { RequestHandler } from "express";

const notFoundRoute: RequestHandler = (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(404);
    res.send("Path not found");
};

export default notFoundRoute;
