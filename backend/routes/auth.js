import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db/connection.js";

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "zona-english-secret-key-2025";
const JWT_EXPIRES_IN = "7d"; // Token valid for 7 days

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

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password harus diisi",
      });
    }

    // Find user by email
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? AND is_active = true",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Update last login
    await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return success response
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
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
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get fresh user data from database
    const [users] = await db.query(
      "SELECT id, email, name, role, is_active FROM users WHERE id = ?",
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
    const decoded = jwt.verify(token, JWT_SECRET);

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
