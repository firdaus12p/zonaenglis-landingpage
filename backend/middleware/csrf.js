/**
 * CSRF Protection Middleware
 * Lightweight CSRF protection for state-changing operations
 *
 * Uses double-submit cookie pattern:
 * 1. Server sends CSRF token in cookie
 * 2. Client must include same token in request header
 * 3. Server verifies they match
 */

import crypto from "crypto";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("CSRF");

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "zona_csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a random CSRF token
 */
function generateToken() {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * Middleware to set CSRF token cookie
 * Should be used on routes that render forms or need CSRF protection
 */
export const csrfCookieSetter = (req, res, next) => {
  // Check if token already exists in cookie
  let token = req.cookies?.[CSRF_COOKIE_NAME];

  // Generate new token if doesn't exist
  if (!token) {
    token = generateToken();

    // Set cookie with token
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    logger.debug("Generated new CSRF token", { ip: req.ip });
  }

  // Attach token to response locals for easy access
  res.locals.csrfToken = token;

  next();
};

/**
 * Middleware to verify CSRF token
 * Should be used on state-changing routes (POST, PUT, DELETE, PATCH)
 */
export const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET, HEAD, OPTIONS (safe methods)
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Get token from cookie
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  // Get token from header
  const headerToken = req.headers[CSRF_HEADER_NAME];

  // Check if tokens exist
  if (!cookieToken) {
    logger.logSecurity("CSRF check failed - missing cookie token", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    return res.status(403).json({
      error: "CSRF token missing",
      message: "Request must include CSRF token cookie",
    });
  }

  if (!headerToken) {
    logger.logSecurity("CSRF check failed - missing header token", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    return res.status(403).json({
      error: "CSRF token missing",
      message: "Request must include X-CSRF-Token header",
    });
  }

  // Verify tokens match (constant-time comparison to prevent timing attacks)
  const tokensMatch = crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  );

  if (!tokensMatch) {
    logger.logSecurity("CSRF check failed - token mismatch", {
      ip: req.ip,
      path: req.path,
      method: req.method,
      user: req.user?.email,
    });

    return res.status(403).json({
      error: "CSRF token invalid",
      message: "CSRF token mismatch",
    });
  }

  // CSRF check passed
  logger.debug("CSRF check passed", {
    ip: req.ip,
    path: req.path,
    method: req.method,
  });

  next();
};

/**
 * Endpoint to get CSRF token for frontend
 * Frontend can call this to get the token and include it in requests
 */
export const csrfTokenEndpoint = (req, res) => {
  const token = res.locals.csrfToken || req.cookies?.[CSRF_COOKIE_NAME];

  if (!token) {
    return res.status(500).json({
      error: "Failed to generate CSRF token",
    });
  }

  res.json({
    csrfToken: token,
  });
};

export default {
  csrfCookieSetter,
  csrfProtection,
  csrfTokenEndpoint,
};
