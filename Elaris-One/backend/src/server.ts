import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

app.listen(env.PORT, () => {
  logger.info("==================================");
  logger.info("🚀 Elaris-One Server Started");
  logger.info(`🌐 http://localhost:${env.PORT}`);
  logger.info(`🧩 Environment: ${env.NODE_ENV}`);
  logger.info("==================================");
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});