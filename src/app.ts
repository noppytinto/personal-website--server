import express, { Request, Response, Application } from "express";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, world!");
});

export default app;
