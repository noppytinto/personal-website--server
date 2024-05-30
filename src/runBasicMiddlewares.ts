import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Application } from "express";
import rateLimit from "express-rate-limit";
import { getPort } from "./config";

const port = getPort();

export const allowedOrigins = [
    `http://localhost:${port}`,
    "https://example.com",
];
const allowedMethods = ["GET"];
const allowedHeaders = ["Content-Type", "Authorization"];

const corsOptions: CorsOptions = {
    allowedHeaders,
    methods: allowedMethods,
    origin: (origin, callback) => {
        console.log("origin: ", origin);

        if (!origin) {
            callback(null, true);
            return;
        }

        const originFound = allowedOrigins.indexOf(origin) !== -1 || !origin;
        if (originFound) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};

export const rateLimitHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
});

export function runBasicMiddlewares(app: Application) {
    // standard security
    app.use(morgan("combined"));
    app.use(helmet());
    app.use(cors(corsOptions));
    app.options("*", cors(corsOptions)); // Enable pre-flight across-the-board
    app.use(rateLimitHandler);

    // TODO: parsing
}
