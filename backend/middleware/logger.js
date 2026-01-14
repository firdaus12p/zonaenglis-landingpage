/**
 * HTTP Request Logging Middleware
 * Logs all incoming requests with timing
 */

import { createLogger } from "../utils/logger.js";

const logger = createLogger("HTTP");

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request start in development
  if (process.env.NODE_ENV === "development") {
    logger.debug(`→ ${req.method} ${req.originalUrl}`, {
      query: req.query,
      ip: req.ip,
    });
  }

  // Capture response finish event
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.logRequest(req, res, duration);
  });

  next();
};

export default requestLogger;
