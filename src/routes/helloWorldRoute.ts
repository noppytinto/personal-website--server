import { RequestHandler } from "express";

const helloWorldRoute: RequestHandler = (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200);
    res.send("Hello, world!");
};

export default helloWorldRoute;
