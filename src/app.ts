import express from "express";
import compression from "compression";
import cors from "cors";
import path from "path";

import authenticationRouter from "./routes/authenticationRouter";
import { authenticationAndAuthorization } from "./service/authentication/authentication";
import Logging from "./util/logging";

// Create Express server
const app = express();

app.use((req, res, next) => {
  /** Log the req */
  Logging.info(
    `Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`
  );

  res.on("finish", () => {
    /** Log the res */
    Logging.info(
      `Result -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`
    );
  });

  next();
});

// Express configuration
app.set("port", process.env.PORT || 3001);
app.use(compression());
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ limit: "4mb", extended: true }));
app.use(
  cors({
    origin: ["http://localhost:3002", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */

app.use("/authentication", authenticationRouter);

app.post(
  "/test",
  authenticationAndAuthorization("admin", "0"),
  (req, res) => {
    res.send("ok");
  }
);

app.post(
  "/checkRefreshToken",
  authenticationAndAuthorization("customer"),
  (req, res) => {
    res.send(req.body);
  }
);

export default app;
