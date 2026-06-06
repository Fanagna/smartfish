import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler, notFound } from "./middleware/error";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: env.corsOrigin.includes("*") ? true : env.corsOrigin,
    credentials: true,
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

  app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
  app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 300 }));

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
