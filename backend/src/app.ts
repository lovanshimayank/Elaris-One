import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js";
import path from "path";
const app = express();

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "🚀 Elaris-One Backend Running Successfully",
  });
});

app.use("/api/v1", routes);

export default app;