import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db/connection.js";
import { createLogger } from "../utils/logger.js";

const router = express.Router();
const logger = createLogger("AUTH");

// JWT Secret - MUST be set in production via environment variable
const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET in production
if (NODE_ENV === "production" && !JWT_SECRET) {
  console.error("❌ CRITICAL: JWT_SECRET environment variable is not set!");
  console.error("   This is required for production security.");
  console.error(
    "   Please set JWT_SECRET in your .env file with a strong random value."
  );
  process.exit(1);
}

// Use fallback only in development (with warning)
const EFFECTIVE_JWT_SECRET =
  JWT_SECRET ||
  (() => {
    console.warn("⚠️  WARNING: Using default JWT_SECRET in development mode.");
    console.warn("   Set JWT_SECRET in .env for production deployment!");
    return "zona-english-dev-secret-DO-NOT-USE-IN-PRODUCTION";
  })();

const JWT_EXPIRES_IN = "7d"; // Token valid for 7 days

// Simple rate limiting: Track failed login attempts
const loginAttempts = new Map(); // Store IP -> { count, lastAttempt }
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Clean up old attempts every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > LOCKOUT_DURATION) {
      loginAttempts.delete(ip);
    }
  }
}, 60 * 60 * 1000);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 *
 * Body: { email: string, password: string }
 * Returns: { success: true, token: string, user: { id, email, name, role } }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Check rate limiting
    const attempts = loginAttempts.get(clientIp);
    if (attempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;

      if (
        attempts.count >= MAX_ATTEMPTS &&
        timeSinceLastAttempt < LOCKOUT_DURATION
      ) {
        const remainingTime = Math.ceil(
          (LOCKOUT_DURATION - timeSinceLastAttempt) / 60000
        );
        return res.status(429).json({
          success: false,
          message: `Terlalu banyak percobaan login gagal. Coba lagi dalam ${remainingTime} menit.`,
        });
      }

      // Reset if lockout duration has passed
      if (timeSinceLastAttempt >= LOCKOUT_DURATION) {
        loginAttempts.delete(clientIp);
      }
    }

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password harus diisi",
      });
    }

    // Find user by email (select only needed fields)
    const [users] = await db.query(
      "SELECT id, email, password_hash, name, role, is_active, must_change_password FROM admin_users WHERE email = ? AND is_active = true",
      [email]
    );

    if (users.length === 0) {
      // Record failed attempt
      const current = loginAttempts.get(clientIp) || {
        count: 0,
        lastAttempt: 0,
      };
      loginAttempts.set(clientIp, {
        count: current.count + 1,
        lastAttempt: Date.now(),
      });

      logger.logSecurity("Failed login - user not found", {
        email,
        ip: clientIp,
      });

      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Record failed attempt
      const current = loginAttempts.get(clientIp) || {
        count: 0,
        lastAttempt: 0,
      };
      loginAttempts.set(clientIp, {
        count: current.count + 1,
        lastAttempt: Date.now(),
      });

      logger.logSecurity("Failed login - wrong password", {
        email,
        userId: user.id,
        ip: clientIp,
      });

      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Clear failed attempts on successful login
    loginAttempts.delete(clientIp);

    // Update last login
    await db.query("UPDATE admin_users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      EFFECTIVE_JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return success response
    logger.info("Login successful", {
      userId: user.id,
      email: user.email,
      role: user.role,
      ip: clientIp,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        must_change_password: Boolean(user.must_change_password),
      },
    });
  } catch (error) {
    logger.error("Login error", {
      error: error.message,
      email,
      ip: clientIp,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * GET /api/auth/verify
 * Verify JWT token and return user data
 *
 * Headers: { Authorization: "Bearer <token>" }
 * Returns: { success: true, user: { id, email, name, role } }
 */
router.get("/verify", async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);

    // Get fresh user data from database
    const [users] = await db.query(
      "SELECT id, email, name, role, is_active, must_change_password FROM admin_users WHERE id = ?",
      [decoded.id]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan atau tidak aktif",
      });
    }

    const user = users[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        must_change_password: Boolean(user.must_change_password),
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token sudah kadaluarsa",
      });
    }

    console.error("Error in verify:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client should remove token)
 *
 * Returns: { success: true, message: string }
 */
router.post("/logout", (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint exists for consistency and can be extended for token blacklisting
  res.json({
    success: true,
    message: "Logout berhasil",
  });
});

/**
 * Middleware to protect routes
 * Usage: router.get('/protected', authenticateToken, (req, res) => {...})
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak ditemukan",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kadaluarsa",
    });
  }
};

export default router;
