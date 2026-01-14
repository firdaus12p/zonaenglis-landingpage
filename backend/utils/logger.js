/**
 * Structured Logging Utility
 * Zona English Backend
 * Created: January 14, 2026
 *
 * Simple but effective logging without external dependencies
 * Logs are formatted for easy parsing and monitoring
 */

const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

const LOG_COLORS = {
  ERROR: "\x1b[31m", // Red
  WARN: "\x1b[33m", // Yellow
  INFO: "\x1b[36m", // Cyan
  DEBUG: "\x1b[90m", // Gray
  RESET: "\x1b[0m",
};

class Logger {
  constructor(module = "APP") {
    this.module = module;
    this.environment = process.env.NODE_ENV || "development";
  }

  /**
   * Format log entry with structured data
   */
  formatLog(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      module: this.module,
      message,
      ...meta,
    };

    // In production, output JSON for log aggregators
    if (this.environment === "production") {
      return JSON.stringify(logEntry);
    }

    // In development, human-readable format with colors
    const color = LOG_COLORS[level] || "";
    const reset = LOG_COLORS.RESET;
    const metaStr =
      Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";

    return `${color}[${timestamp}] ${level} [${this.module}]${reset} ${message}${metaStr}`;
  }

  /**
   * Log error message
   */
  error(message, meta = {}) {
    const logMessage = this.formatLog(LOG_LEVELS.ERROR, message, meta);
    console.error(logMessage);

    // In production, you might want to send to external service
    // e.g., Sentry, LogRocket, Datadog, etc.
  }

  /**
   * Log warning message
   */
  warn(message, meta = {}) {
    const logMessage = this.formatLog(LOG_LEVELS.WARN, message, meta);
    console.warn(logMessage);
  }

  /**
   * Log info message
   */
  info(message, meta = {}) {
    const logMessage = this.formatLog(LOG_LEVELS.INFO, message, meta);
    console.log(logMessage);
  }

  /**
   * Log debug message (only in development)
   */
  debug(message, meta = {}) {
    if (this.environment === "development") {
      const logMessage = this.formatLog(LOG_LEVELS.DEBUG, message, meta);
      console.log(logMessage);
    }
  }

  /**
   * Log HTTP request
   */
  logRequest(req, res, duration) {
    const meta = {
      method: req.method,
      path: req.originalUrl || req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
    };

    // Add user info if authenticated
    if (req.user) {
      meta.user = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      };
    }

    const level = res.statusCode >= 500 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
    const message = `${req.method} ${req.originalUrl || req.path} ${
      res.statusCode
    }`;

    if (level === LOG_LEVELS.ERROR) {
      this.error(message, meta);
    } else {
      this.info(message, meta);
    }
  }

  /**
   * Log database query (for debugging)
   */
  logQuery(query, params, duration) {
    if (this.environment === "development") {
      this.debug("Database Query", {
        query,
        params,
        duration: `${duration}ms`,
      });
    }
  }

  /**
   * Log security event
   */
  logSecurity(event, meta = {}) {
    this.warn(`SECURITY: ${event}`, meta);
  }
}

/**
 * Create logger instance for a module
 */
export function createLogger(module) {
  return new Logger(module);
}

/**
 * Default logger instance
 */
export default new Logger("SERVER");
