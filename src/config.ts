import rateLimit from "express-rate-limit";
import { CorsOptions } from "cors";
const port = process.env.PORT || 3000;

export const allowedOrigins = [
    `http://localhost:${port}`,
    "https://example.com",
];
const allowedMethods = ["GET"];
const allowedHeaders = ["Content-Type", "Authorization"];

export const corsOptions: CorsOptions = {
    allowedHeaders,
    methods: allowedMethods,
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }

        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
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
