import express, { Application } from "express";
import { runBasicMiddlewares } from "./runBasicMiddlewares";
import { runRouteHandlers } from "./runRouteHandlers";
import { getPort } from "./config";

const port = getPort();
const app = express();

runBasicMiddlewares(app);
// main app
runRouteHandlers(app);

// starting the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
