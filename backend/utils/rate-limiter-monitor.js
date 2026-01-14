/**
 * Rate Limiter Monitoring Utility
 * Tracks and logs rate limiting events
 */

import { createLogger } from "../utils/logger.js";

const logger = createLogger("RATE_LIMITER");

class RateLimiterMonitor {
  constructor() {
    this.stats = {
      totalBlocked: 0,
      blockedIPs: new Map(), // IP -> block count
      lastReset: Date.now(),
    };

    // Reset stats every 24 hours
    setInterval(() => {
      this.resetDailyStats();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Log rate limit hit
   */
  logRateLimitHit(ip, endpoint, type = "general") {
    this.stats.totalBlocked++;

    const currentCount = this.stats.blockedIPs.get(ip) || 0;
    this.stats.blockedIPs.set(ip, currentCount + 1);

    logger.logSecurity("Rate limit exceeded", {
      ip,
      endpoint,
      type,
      totalBlocksToday: this.stats.totalBlocked,
      ipBlockCount: currentCount + 1,
    });

    // Alert if single IP is blocked many times
    if (currentCount + 1 >= 10) {
      logger.warn("Suspicious activity - repeated rate limit hits", {
        ip,
        blockCount: currentCount + 1,
        recommendation: "Consider blocking this IP",
      });
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      totalBlocked: this.stats.totalBlocked,
      uniqueIPsBlocked: this.stats.blockedIPs.size,
      topOffenders: Array.from(this.stats.blockedIPs.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count })),
      since: new Date(this.stats.lastReset).toISOString(),
    };
  }

  /**
   * Reset daily statistics
   */
  resetDailyStats() {
    logger.info("Resetting daily rate limiter stats", this.getStats());

    this.stats = {
      totalBlocked: 0,
      blockedIPs: new Map(),
      lastReset: Date.now(),
    };
  }
}

// Singleton instance
const monitor = new RateLimiterMonitor();

/**
 * Custom rate limiter handler with monitoring
 */
export const createMonitoredRateLimiter = (name, options = {}) => {
  return (req, res, next) => {
    const clientIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Check rate limit logic here
    const rateLimitKey = `${name}_${clientIp}`;

    // Your rate limit logic...
    // If rate limit exceeded:
    // monitor.logRateLimitHit(clientIp, req.path, name);

    next();
  };
};

/**
 * Middleware to add rate limit stats endpoint
 */
export const rateLimiterStatsMiddleware = (req, res) => {
  // Only allow admins to view stats
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const stats = monitor.getStats();
  res.json({
    success: true,
    stats,
  });
};

export default monitor;
