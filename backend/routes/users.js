/**
 * ZONA ENGLISH - USER MANAGEMENT API ROUTES
 * Admin-only endpoints for user CRUD operations
 * Created: November 2, 2025
 */

import express from "express";
import bcrypt from "bcryptjs";
import db from "../db/connection.js";
import { authenticateToken } from "./auth.js";

const router = express.Router();

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya admin yang dapat mengakses fitur ini",
    });
  }
  next();
};

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get("/", requireAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT 
        id, 
        email, 
        name, 
        role, 
        is_active, 
        last_login, 
        created_at, 
        updated_at 
      FROM users 
      ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data user",
    });
  }
});

/**
 * GET /api/users/:id
 * Get single user by ID (admin only)
 */
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      `SELECT 
        id, 
        email, 
        name, 
        role, 
        is_active, 
        last_login, 
        created_at, 
        updated_at 
      FROM users 
      WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data user",
    });
  }
});

/**
 * POST /api/users
 * Create new user (admin only)
 */
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { email, password, name, role = "user" } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, dan nama harus diisi",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password harus minimal 6 karakter",
      });
    }

    // Check if email already exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (email, password_hash, name, role, is_active) 
       VALUES (?, ?, ?, ?, true)`,
      [email, password_hash, name, role]
    );

    res.json({
      success: true,
      message: "User berhasil ditambahkan",
      data: {
        id: result.insertId,
        email,
        name,
        role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat membuat user",
    });
  }
});

/**
 * PUT /api/users/:id
 * Update user details (admin only)
 */
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, is_active } = req.body;

    // Check if user exists
    const [existing] = await db.query("SELECT id FROM users WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Format email tidak valid",
        });
      }

      // Check if email is taken by another user
      const [emailCheck] = await db.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email sudah digunakan oleh user lain",
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }
    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (role !== undefined) {
      updates.push("role = ?");
      values.push(role);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada data yang diupdate",
      });
    }

    values.push(id);

    await db.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: "User berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate user",
    });
  }
});

/**
 * PUT /api/users/:id/password
 * Change user password (admin only or own account)
 */
router.put("/:id/password", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, currentPassword } = req.body;

    // Check if user is admin or updating own password
    const isAdmin = req.user.role === "admin";
    const isOwnAccount = req.user.id === parseInt(id);

    if (!isAdmin && !isOwnAccount) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk mengubah password user ini",
      });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password baru harus minimal 6 karakter",
      });
    }

    // If updating own password, verify current password
    if (isOwnAccount && !isAdmin) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Password lama harus diisi",
        });
      }

      const [users] = await db.query(
        "SELECT password_hash FROM users WHERE id = ?",
        [id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        users[0].password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Password lama tidak sesuai",
        });
      }
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      password_hash,
      id,
    ]);

    res.json({
      success: true,
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengubah password",
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: "Anda tidak dapat menghapus akun sendiri",
      });
    }

    // Check if user exists
    const [users] = await db.query("SELECT id FROM users WHERE id = ?", [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Soft delete by setting is_active to false
    await db.query("UPDATE users SET is_active = false WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus user",
    });
  }
});

/**
 * GET /api/users/profile/me
 * Get current user profile
 */
router.get("/profile/me", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT 
        id, 
        email, 
        name, 
        role, 
        is_active, 
        last_login, 
        created_at 
      FROM users 
      WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil profil",
    });
  }
});

/**
 * PUT /api/users/profile/me
 * Update current user profile (own account)
 */
router.put("/profile/me", authenticateToken, async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Format email tidak valid",
        });
      }

      // Check if email is taken by another user
      const [emailCheck] = await db.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, req.user.id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email sudah digunakan",
        });
      }
    }

    // Build update query
    const updates = [];
    const values = [];

    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }
    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada data yang diupdate",
      });
    }

    values.push(req.user.id);

    await db.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: "Profil berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate profil",
    });
  }
});

export default router;
