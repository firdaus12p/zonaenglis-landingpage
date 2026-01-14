/**
 * Simple CSRF Protection for Public Forms
 *
 * For authenticated endpoints, JWT in Authorization header
 * already provides CSRF protection (not in cookies).
 *
 * This is for public form submissions (promo claims, affiliate tracking)
 */

import crypto from "crypto";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("CSRF_PUBLIC");

// Store tokens temporarily (in production, use Redis)
const tokenStore = new Map();

// Cleanup expired tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now - data.timestamp > 3600000) {
      // 1 hour
      tokenStore.delete(token);
    }
  }
}, 3600000);

/**
 * Generate public form token
 */
export const generatePublicFormToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  tokenStore.set(token, {
    timestamp: Date.now(),
    used: false,
  });
  return token;
};

/**
 * Validate and consume public form token (one-time use)
 */
export const validatePublicFormToken = (token) => {
  if (!token) {
    return false;
  }

  const data = tokenStore.get(token);

  if (!data) {
    return false; // Token doesn't exist
  }

  if (data.used) {
    return false; // Token already used
  }

  const now = Date.now();
  if (now - data.timestamp > 3600000) {
    // 1 hour expiry
    tokenStore.delete(token);
    return false;
  }

  // Mark as used
  data.used = true;
  return true;
};

/**
 * Middleware for public form endpoints
 */
export const publicFormProtection = (req, res, next) => {
  // Skip for GET requests
  if (req.method === "GET") {
    return next();
  }

  const token = req.body?.formToken || req.headers["x-form-token"];

  if (!validatePublicFormToken(token)) {
    logger.logSecurity("Invalid public form token", {
      ip: req.ip,
      path: req.path,
      hasToken: !!token,
    });

    return res.status(403).json({
      success: false,
      error: "Invalid or expired form token",
      message: "Please refresh the page and try again",
    });
  }

  next();
};

/**
 * Endpoint to generate form token
 */
export const formTokenEndpoint = (req, res) => {
  const token = generatePublicFormToken();

  res.json({
    success: true,
    formToken: token,
    expiresIn: 3600, // seconds
  });
};

export default {
  generatePublicFormToken,
  validatePublicFormToken,
  publicFormProtection,
  formTokenEndpoint,
};
