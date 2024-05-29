import dotenv from "dotenv";
import express, { Application } from "express";
import { runBasicMiddlewares } from "./runBasicMiddlewares";
import { runRouteHandlers } from "./runRouteHandlers";

dotenv.config();
const port = process.env.PORT || 3000;
const app: Application = express();

runBasicMiddlewares(app);
// main app
runRouteHandlers(app);

// starting the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
