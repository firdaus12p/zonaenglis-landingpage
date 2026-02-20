// Bridge Cards Routes
// Handles: Student auth, flashcard content, mastered tracking, admin CMS, student management
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db/connection.js";
import { authenticateToken } from "./auth.js";
import { createLogger } from "../utils/logger.js";

const router = express.Router();
const logger = createLogger("BRIDGE-CARDS");

// JWT config — same secret as main auth, different payload structure
const JWT_SECRET =
  process.env.JWT_SECRET || "zona-english-dev-secret-DO-NOT-USE-IN-PRODUCTION";
const BRIDGE_JWT_EXPIRES_IN = "30d"; // Student tokens last 30 days

// ====== MIDDLEWARE ======

/**
 * Middleware: Verify bridge student JWT token
 * Checks token type === "bridge_student" to prevent admin/student token mixing
 */
const authenticateBridgeStudent = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type !== "bridge_student") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Token bukan untuk siswa Bridge Cards",
        });
    }

    req.student = decoded;
    next();
  } catch {
    return res
      .status(401)
      .json({
        success: false,
        message: "Token tidak valid atau sudah kadaluarsa",
      });
  }
};

/**
 * Middleware: Admin-only access (reuses main admin auth)
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return res
      .status(403)
      .json({
        error: "Akses ditolak. Hanya admin yang dapat mengakses fitur ini",
      });
  }
  next();
};

// ====================================================================
// STUDENT ENDPOINTS
// ====================================================================

/**
 * POST /api/bridge-cards/auth/login
 * Student login with email/student_code + PIN
 */
router.post("/auth/login", async (req, res) => {
  try {
    const { credential, pin } = req.body;

    if (!credential || !pin) {
      return res
        .status(400)
        .json({ success: false, message: "Credential dan PIN harus diisi" });
    }

    // Find student by email OR student_code
    const [students] = await db.query(
      "SELECT id, name, email, student_code, pin_hash, total_mastered, is_active FROM bridge_students WHERE (email = ? OR student_code = ?) AND is_active = 1 AND deleted_at IS NULL",
      [credential, credential],
    );

    if (students.length === 0) {
      logger.warn("Bridge login failed - student not found", { credential });
      return res
        .status(401)
        .json({ success: false, message: "Credential atau PIN salah" });
    }

    const student = students[0];

    // Verify PIN
    const pinValid = await bcrypt.compare(pin, student.pin_hash);
    if (!pinValid) {
      logger.warn("Bridge login failed - wrong PIN", { studentId: student.id });
      return res
        .status(401)
        .json({ success: false, message: "Credential atau PIN salah" });
    }

    // Update last_login
    await db.query(
      "UPDATE bridge_students SET last_login = NOW() WHERE id = ?",
      [student.id],
    );

    // Sign JWT with bridge_student type
    const token = jwt.sign(
      {
        id: student.id,
        name: student.name,
        email: student.email,
        studentCode: student.student_code,
        type: "bridge_student",
      },
      JWT_SECRET,
      { expiresIn: BRIDGE_JWT_EXPIRES_IN },
    );

    // Compute level name from totalMastered
    const levelName = computeLevelName(student.total_mastered);

    res.json({
      success: true,
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        studentCode: student.student_code,
        totalMastered: student.total_mastered,
        levelName,
      },
    });
  } catch (error) {
    logger.error("Bridge login error", { error: error.message });
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
});

/**
 * GET /api/bridge-cards/auth/verify
 * Verify student token validity
 */
router.get("/auth/verify", authenticateBridgeStudent, async (req, res) => {
  try {
    const [students] = await db.query(
      "SELECT id, name, email, student_code, total_mastered FROM bridge_students WHERE id = ? AND is_active = 1 AND deleted_at IS NULL",
      [req.student.id],
    );

    if (students.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Akun tidak ditemukan" });
    }

    const student = students[0];
    const levelName = computeLevelName(student.total_mastered);

    res.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        studentCode: student.student_code,
        totalMastered: student.total_mastered,
        levelName,
      },
    });
  } catch (error) {
    logger.error("Bridge verify error", { error: error.message });
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
});

/**
 * GET /api/bridge-cards/cards
 * Student: Get all active cards grouped by category
 */
router.get("/cards", authenticateBridgeStudent, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, category, content_front AS contentFront, content_back AS contentBack, keywords, audio_asset AS audioAsset FROM bridge_cards WHERE is_active = 1 AND deleted_at IS NULL ORDER BY category, id ASC",
    );

    // Parse keywords from comma-separated string to array
    const cards = rows.map((row) => ({
      ...row,
      keywords: row.keywords
        ? row.keywords.split(",").map((k) => k.trim())
        : [],
    }));

    const warmup = cards.filter((c) => c.category === "warmup");
    const partner = cards.filter((c) => c.category === "partner");

    res.json({ warmup, partner });
  } catch (error) {
    logger.error("Error fetching bridge cards", { error: error.message });
    res.status(500).json({ error: "Gagal memuat kartu" });
  }
});

/**
 * POST /api/bridge-cards/mastered
 * Student: Submit a newly mastered card (anti-doping: unique constraint)
 */
router.post("/mastered", authenticateBridgeStudent, async (req, res) => {
  try {
    const { cardId } = req.body;
    const studentId = req.student.id;

    if (!cardId) {
      return res
        .status(400)
        .json({ success: false, message: "cardId harus diisi" });
    }

    // Verify card exists
    const [cardRows] = await db.query(
      "SELECT id FROM bridge_cards WHERE id = ? AND is_active = 1 AND deleted_at IS NULL",
      [cardId],
    );
    if (cardRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Kartu tidak ditemukan" });
    }

    // Insert mastered record — UNIQUE constraint prevents duplicates
    try {
      await db.query(
        "INSERT INTO bridge_mastered (student_id, card_id) VALUES (?, ?)",
        [studentId, cardId],
      );

      // Increment total_mastered counter
      await db.query(
        "UPDATE bridge_students SET total_mastered = total_mastered + 1 WHERE id = ?",
        [studentId],
      );

      // Get updated total
      const [updated] = await db.query(
        "SELECT total_mastered FROM bridge_students WHERE id = ?",
        [studentId],
      );

      res.json({ success: true, newTotal: updated[0].total_mastered });
    } catch (dupError) {
      // Duplicate entry = already mastered, not an error for the user
      if (dupError.code === "ER_DUP_ENTRY") {
        const [current] = await db.query(
          "SELECT total_mastered FROM bridge_students WHERE id = ?",
          [studentId],
        );
        return res.json({
          success: true,
          newTotal: current[0].total_mastered,
          alreadyMastered: true,
        });
      }
      throw dupError;
    }
  } catch (error) {
    logger.error("Error submitting mastered card", { error: error.message });
    res
      .status(500)
      .json({ success: false, message: "Gagal menyimpan progress" });
  }
});

/**
 * GET /api/bridge-cards/leaderboard
 * Student: Get top students leaderboard
 */
router.get("/leaderboard", authenticateBridgeStudent, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, total_mastered AS totalMastered FROM bridge_students WHERE is_active = 1 AND deleted_at IS NULL ORDER BY total_mastered DESC LIMIT 50",
    );

    const leaderboard = rows.map((row) => ({
      ...row,
      levelName: computeLevelName(row.totalMastered),
    }));

    res.json(leaderboard);
  } catch (error) {
    logger.error("Error fetching leaderboard", { error: error.message });
    res.status(500).json({ error: "Gagal memuat leaderboard" });
  }
});

// ====================================================================
// ADMIN ENDPOINTS — All require authenticateToken + requireAdmin
// ====================================================================

// ------ CARDS CMS ------

/**
 * GET /api/bridge-cards/admin/cards
 * Admin: Get all cards (including inactive), with soft-delete filter
 */
router.get(
  "/admin/cards",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT id, category, content_front AS contentFront, content_back AS contentBack, keywords, audio_asset AS audioAsset, is_active, created_at, updated_at FROM bridge_cards WHERE deleted_at IS NULL ORDER BY created_at DESC",
      );

      const cards = rows.map((row) => ({
        ...row,
        keywords: row.keywords
          ? row.keywords.split(",").map((k) => k.trim())
          : [],
      }));

      res.json(cards);
    } catch (error) {
      logger.error("Admin: Error fetching cards", { error: error.message });
      res.status(500).json({ error: "Gagal memuat kartu" });
    }
  },
);

/**
 * GET /api/bridge-cards/admin/cards/:id
 * Admin: Get single card by ID
 */
router.get(
  "/admin/cards/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT id, category, content_front AS contentFront, content_back AS contentBack, keywords, audio_asset AS audioAsset, is_active FROM bridge_cards WHERE id = ? AND deleted_at IS NULL",
        [req.params.id],
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Kartu tidak ditemukan" });
      }

      const card = {
        ...rows[0],
        keywords: rows[0].keywords
          ? rows[0].keywords.split(",").map((k) => k.trim())
          : [],
      };

      res.json(card);
    } catch (error) {
      logger.error("Admin: Error fetching card", { error: error.message });
      res.status(500).json({ error: "Gagal memuat kartu" });
    }
  },
);

/**
 * POST /api/bridge-cards/admin/cards
 * Admin: Create a new flashcard
 */
router.post(
  "/admin/cards",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { category, contentFront, contentBack, keywords } = req.body;

      if (!category || !contentFront || !contentBack) {
        return res
          .status(400)
          .json({
            error: "category, contentFront, dan contentBack wajib diisi",
          });
      }

      // Convert keywords from comma-separated to stored format
      const keywordsStr = keywords || null;

      const [result] = await db.query(
        "INSERT INTO bridge_cards (category, content_front, content_back, keywords) VALUES (?, ?, ?, ?)",
        [category, contentFront, contentBack, keywordsStr],
      );

      logger.info("Admin: Card created", { cardId: result.insertId, category });

      res.status(201).json({
        success: true,
        id: result.insertId,
        message: "Kartu berhasil dibuat",
      });
    } catch (error) {
      logger.error("Admin: Error creating card", { error: error.message });
      res.status(500).json({ error: "Gagal membuat kartu" });
    }
  },
);

/**
 * PUT /api/bridge-cards/admin/cards/:id
 * Admin: Update an existing flashcard
 */
router.put(
  "/admin/cards/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { category, contentFront, contentBack, keywords } = req.body;
      const cardId = req.params.id;

      if (!category || !contentFront || !contentBack) {
        return res
          .status(400)
          .json({
            error: "category, contentFront, dan contentBack wajib diisi",
          });
      }

      const keywordsStr = keywords || null;

      const [result] = await db.query(
        "UPDATE bridge_cards SET category = ?, content_front = ?, content_back = ?, keywords = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL",
        [category, contentFront, contentBack, keywordsStr, cardId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Kartu tidak ditemukan" });
      }

      logger.info("Admin: Card updated", { cardId });

      res.json({ success: true, message: "Kartu berhasil diperbarui" });
    } catch (error) {
      logger.error("Admin: Error updating card", { error: error.message });
      res.status(500).json({ error: "Gagal memperbarui kartu" });
    }
  },
);

/**
 * DELETE /api/bridge-cards/admin/cards/:id
 * Admin: Soft-delete a flashcard
 */
router.delete(
  "/admin/cards/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const cardId = req.params.id;

      const [result] = await db.query(
        "UPDATE bridge_cards SET deleted_at = NOW(), is_active = 0 WHERE id = ? AND deleted_at IS NULL",
        [cardId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Kartu tidak ditemukan" });
      }

      logger.info("Admin: Card deleted (soft)", { cardId });

      res.json({ success: true, message: "Kartu berhasil dihapus" });
    } catch (error) {
      logger.error("Admin: Error deleting card", { error: error.message });
      res.status(500).json({ error: "Gagal menghapus kartu" });
    }
  },
);

// ------ STUDENTS MANAGEMENT ------

/**
 * GET /api/bridge-cards/admin/students
 * Admin: Get all registered students
 */
router.get(
  "/admin/students",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT id, name, email, student_code AS studentCode, total_mastered AS totalMastered, is_active, last_login AS lastLogin, created_at AS createdAt FROM bridge_students WHERE deleted_at IS NULL ORDER BY created_at DESC",
      );

      res.json(rows);
    } catch (error) {
      logger.error("Admin: Error fetching students", { error: error.message });
      res.status(500).json({ error: "Gagal memuat daftar siswa" });
    }
  },
);

/**
 * GET /api/bridge-cards/admin/students/:id
 * Admin: Get single student by ID
 */
router.get(
  "/admin/students/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT id, name, email, student_code AS studentCode, total_mastered AS totalMastered, is_active, created_at AS createdAt FROM bridge_students WHERE id = ? AND deleted_at IS NULL",
        [req.params.id],
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }

      res.json(rows[0]);
    } catch (error) {
      logger.error("Admin: Error fetching student", { error: error.message });
      res.status(500).json({ error: "Gagal memuat data siswa" });
    }
  },
);

/**
 * POST /api/bridge-cards/admin/students
 * Admin: Create a new student account
 */
router.post(
  "/admin/students",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { name, email, studentCode, pin } = req.body;

      if (!name || !email || !studentCode || !pin) {
        return res
          .status(400)
          .json({ error: "name, email, studentCode, dan pin wajib diisi" });
      }

      if (pin.length < 4) {
        return res.status(400).json({ error: "PIN minimal 4 karakter" });
      }

      // Hash PIN
      const pinHash = await bcrypt.hash(pin, 10);

      const [result] = await db.query(
        "INSERT INTO bridge_students (name, email, student_code, pin_hash) VALUES (?, ?, ?, ?)",
        [name, email, studentCode, pinHash],
      );

      logger.info("Admin: Student created", {
        studentId: result.insertId,
        email,
      });

      res.status(201).json({
        success: true,
        id: result.insertId,
        message: "Siswa berhasil didaftarkan",
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ error: "Email atau Student Code sudah terdaftar" });
      }
      logger.error("Admin: Error creating student", { error: error.message });
      res.status(500).json({ error: "Gagal membuat akun siswa" });
    }
  },
);

/**
 * PUT /api/bridge-cards/admin/students/:id
 * Admin: Update student data (name, email, studentCode, optional PIN reset)
 */
router.put(
  "/admin/students/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { name, email, studentCode, pin } = req.body;
      const studentId = req.params.id;

      if (!name || !email || !studentCode) {
        return res
          .status(400)
          .json({ error: "name, email, dan studentCode wajib diisi" });
      }

      // Build update query conditionally (PIN is optional on edit)
      if (pin && pin.length >= 4) {
        const pinHash = await bcrypt.hash(pin, 10);
        await db.query(
          "UPDATE bridge_students SET name = ?, email = ?, student_code = ?, pin_hash = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL",
          [name, email, studentCode, pinHash, studentId],
        );
      } else {
        await db.query(
          "UPDATE bridge_students SET name = ?, email = ?, student_code = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL",
          [name, email, studentCode, studentId],
        );
      }

      logger.info("Admin: Student updated", { studentId });

      res.json({ success: true, message: "Data siswa berhasil diperbarui" });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({
            error: "Email atau Student Code sudah digunakan siswa lain",
          });
      }
      logger.error("Admin: Error updating student", { error: error.message });
      res.status(500).json({ error: "Gagal memperbarui data siswa" });
    }
  },
);

/**
 * DELETE /api/bridge-cards/admin/students/:id
 * Admin: Soft-delete a student
 */
router.delete(
  "/admin/students/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const studentId = req.params.id;

      const [result] = await db.query(
        "UPDATE bridge_students SET deleted_at = NOW(), is_active = 0 WHERE id = ? AND deleted_at IS NULL",
        [studentId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }

      logger.info("Admin: Student deleted (soft)", { studentId });

      res.json({ success: true, message: "Akun siswa berhasil dihapus" });
    } catch (error) {
      logger.error("Admin: Error deleting student", { error: error.message });
      res.status(500).json({ error: "Gagal menghapus akun siswa" });
    }
  },
);

// ------ ADMIN LEADERBOARD ------

/**
 * GET /api/bridge-cards/admin/leaderboard
 * Admin: Get leaderboard with full details
 */
router.get(
  "/admin/leaderboard",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT id, name, email, student_code AS studentCode, total_mastered AS totalMastered, last_login AS lastLogin FROM bridge_students WHERE is_active = 1 AND deleted_at IS NULL ORDER BY total_mastered DESC LIMIT 100",
      );

      const leaderboard = rows.map((row) => ({
        ...row,
        levelName: computeLevelName(row.totalMastered),
      }));

      res.json(leaderboard);
    } catch (error) {
      logger.error("Admin: Error fetching leaderboard", {
        error: error.message,
      });
      res.status(500).json({ error: "Gagal memuat leaderboard" });
    }
  },
);

// ====== UTILITY ======

/**
 * Compute level name based on total mastered cards
 */
function computeLevelName(totalMastered) {
  if (totalMastered >= 200) return "Master";
  if (totalMastered >= 100) return "Expert";
  if (totalMastered >= 50) return "Advanced";
  if (totalMastered >= 20) return "Intermediate";
  if (totalMastered >= 5) return "Beginner";
  return "Newbie";
}

export default router;
