import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import errorHandler from "./errors/error.middleware.js";
import path from "path";
import { globalLimiter } from "./middleware/rateLimit.js";

const app = express();

// CORS configuration – allow frontend origin and credentials
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  credentials: true,
}));

// Apply global rate limiter
app.use(globalLimiter);

// Security middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NOTE: Static uploads are removed; use protected download endpoint instead
// app.use(
//   "/uploads",
//   express.static(path.join(process.cwd(), "uploads"))
// );

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "🚀 Elaris-One Backend Running Successfully",
  });
});

// API routes
app.use("/api/v1", routes);

// Centralized error handling
app.use(errorHandler);

export default app;