import dotenv from "dotenv";
// import app from "./app";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { corsOptions, rateLimitHandler } from "./config";
import { errorRoute } from "./routes/errorRoute";
import notFoundRoute from "./routes/notFoundRoute";
import helloWorldRoute from "./routes/helloWorldRoute";

dotenv.config();
const port = process.env.PORT || 3000;

const app: Application = express();

// middlewares for standard security
app.use(morgan("combined"));
app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enable pre-flight across-the-board
app.use(rateLimitHandler);

// TODO: middlewares for parsing

// main app
app.get("/hello", helloWorldRoute);

// catchall for 404 errors
app.use(notFoundRoute);

// return 403 for cors errors
app.use(errorRoute);

// starting the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
