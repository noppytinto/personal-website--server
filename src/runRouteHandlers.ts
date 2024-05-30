import { Application } from "express";
import errorRouteHandler from "./routes/errorRoute";
import helloWorldRoute from "./routes/helloWorldRoute";
import notFoundRoute from "./routes/notFoundRoute";

export function runRouteHandlers(app: Application) {
    app.get("/hello", helloWorldRoute);

    // catchall for 404 errors
    app.use(notFoundRoute);

    // return 403 for cors errors
    app.use(errorRouteHandler);
}
