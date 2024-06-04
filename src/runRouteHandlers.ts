import { Express } from "express";
import errorRouteHandler from "./routes/errorRoute";
import helloWorldRoute from "./routes/helloWorldRoute";
import notFoundRoute from "./routes/notFoundRoute";
import pageMetaRoute from "./routes/pageMetaRoutes";

export function runRouteHandlers(app: Express) {
  app.get("/hello", helloWorldRoute);

  app.get("/page-meta", pageMetaRoute);

  // catchall for 404 errors
  app.use(notFoundRoute);

  // return 403 for cors errors
  app.use(errorRouteHandler);
}
