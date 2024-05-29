// error route

import { Request, Response, NextFunction } from "express";

export const errorRoute = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    // if CORS error, return 403
    if (err.message === "Not allowed by CORS") {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.status(403);
        res.send("Not allowed by CORS");
        return;
    }

    // if no CORS error, return 500
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(500);
    res.send("Internal server error");
};

export default errorRoute;
