import express, { RequestHandler } from "express";

const router = express.Router();

router.use((_req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.status(404);
    res.send("Path not found");
});

export default router;
