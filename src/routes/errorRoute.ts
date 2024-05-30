import { ErrorRequestHandler } from "express";

// TODO: use express router
export const errorRoute: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error("fffffffffffffffffffffffffffffff: ", err);

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
