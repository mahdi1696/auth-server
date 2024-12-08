import errorHandler from "errorhandler";
import app from "./app";
import http from "http";

const server = http.createServer(app);

/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === "development") {
  app.use(errorHandler());
}

/**
 * Start Express server.
 */

app.get("/", (req, res) => {
  res.send("I'm running");
});

server.listen(app.get("port"), () => {
  console.log(
    "  App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

export default server;
