// Bridge Cards Routes
// Handles: Student auth, flashcard content, mastered tracking, AI voice practice, admin CMS, student management
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import db from "../db/connection.js";
import { authenticateToken } from "./auth.js";
import { createLogger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TTS_CACHE_DIR = path.join(__dirname, "..", "uploads", "tts");

const router = express.Router();
const logger = createLogger("BRIDGE-CARDS");

// JWT config — same secret as main auth, different payload structure
const JWT_SECRET =
  process.env.JWT_SECRET || "zona-english-dev-secret-DO-NOT-USE-IN-PRODUCTION";
const BRIDGE_JWT_EXPIRES_IN = "30d"; // Student tokens last 30 days

// AI Voice Practice config
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const VOICEMAKER_API_KEY = process.env.VOICEMAKER_API_KEY || "";
const VOICEMAKER_API_URL =
  "https://developer.voicemaker.in/api/v1/voice/convert";

// Conversation Practice config
const MAX_CHAT_TURNS = 6; // Max user turns before Ze AI wraps up

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
      return res.status(403).json({
        success: false,
        message: "Token bukan untuk siswa Bridge Cards",
      });
    }

    req.student = decoded;
    next();
  } catch {
    return res.status(401).json({
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
    return res.status(403).json({
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
      "SELECT id, name, email, student_code, pin_hash, total_mastered, is_active, created_at FROM bridge_students WHERE (email = ? OR student_code = ?) AND is_active = 1 AND deleted_at IS NULL",
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
        createdAt: student.created_at,
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
      "SELECT id, name, email, student_code, total_mastered, created_at FROM bridge_students WHERE id = ? AND is_active = 1 AND deleted_at IS NULL",
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
        createdAt: student.created_at,
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
// STUDENT: AI VOICE PRACTICE ENDPOINTS
// ====================================================================

/**
 * POST /api/bridge-cards/voice/analyze
 * Student: Submit spoken text for AI analysis against target text
 * Returns grammar/vocab/pronunciation scores + corrections
 */
router.post("/voice/analyze", authenticateBridgeStudent, async (req, res) => {
  try {
    const { cardId, spokenText, targetText } = req.body;
    const studentId = req.student.id;

    // Input validation
    if (!cardId || !spokenText || !targetText) {
      return res.status(400).json({
        success: false,
        message: "cardId, spokenText, dan targetText wajib diisi",
      });
    }

    // Sanitize inputs — strip HTML tags to prevent stored XSS
    const cleanSpoken = String(spokenText)
      .replace(/<[^>]*>/g, "")
      .trim();
    const cleanTarget = String(targetText)
      .replace(/<[^>]*>/g, "")
      .trim();

    if (cleanSpoken.length === 0 || cleanSpoken.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "spokenText harus 1-1000 karakter",
      });
    }

    // Verify card exists (non-blocking: still analyze if card is fallback/not in DB)
    const [cardRows] = await db.query(
      "SELECT id FROM bridge_cards WHERE id = ? AND is_active = 1 AND deleted_at IS NULL",
      [cardId],
    );
    const cardExistsInDB = cardRows.length > 0;

    // Check Groq API key availability
    if (!GROQ_API_KEY) {
      logger.error("GROQ_API_KEY not configured");
      return res.status(503).json({
        success: false,
        message: "Layanan AI belum dikonfigurasi",
      });
    }

    // Call Groq LLM for analysis
    const aiPrompt = buildAnalysisPrompt(cleanSpoken, cleanTarget);
    const aiResponse = await callGroqAPI(aiPrompt);

    if (!aiResponse) {
      return res.status(502).json({
        success: false,
        message: "Gagal mendapatkan analisis dari AI",
      });
    }

    // Save to history — only if card exists in DB (skip for fallback/static cards)
    if (cardExistsInDB) {
      await db.query(
        `INSERT INTO bridge_voice_history
           (student_id, card_id, spoken_text, target_text, grammar_score, vocab_score, pronunciation_score, feedback_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          studentId,
          cardId,
          cleanSpoken,
          cleanTarget,
          aiResponse.grammarScore,
          aiResponse.vocabScore,
          aiResponse.pronunciationScore,
          JSON.stringify(aiResponse),
        ],
      );
    } else {
      logger.warn("Voice analysis: card not in DB, skipping history save", {
        cardId,
        studentId,
      });
    }

    logger.info("Voice analysis completed", {
      studentId,
      cardId,
      grammarScore: aiResponse.grammarScore,
    });

    res.json({
      success: true,
      ...aiResponse,
    });
  } catch (error) {
    logger.error("Voice analysis error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menganalisis suara",
    });
  }
});

/**
 * POST /api/bridge-cards/voice/tts
 * Student: Generate TTS audio for correct pronunciation reference
 * Caches generated audio to avoid redundant API calls
 */
router.post("/voice/tts", authenticateBridgeStudent, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || String(text).trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "text wajib diisi",
      });
    }

    const cleanText = String(text)
      .replace(/<[^>]*>/g, "")
      .trim();

    if (cleanText.length > 500) {
      return res.status(400).json({
        success: false,
        message: "text maksimal 500 karakter",
      });
    }

    // Check cache first
    const cacheKey = crypto
      .createHash("md5")
      .update(cleanText.toLowerCase())
      .digest("hex");
    const cacheFile = path.join(TTS_CACHE_DIR, `${cacheKey}.mp3`);

    try {
      await fs.access(cacheFile);
      // Cache hit — return existing file URL
      return res.json({
        success: true,
        audioUrl: `/uploads/tts/${cacheKey}.mp3`,
      });
    } catch {
      // Cache miss — proceed to generate
    }

    // Check Voicemaker API key availability
    if (!VOICEMAKER_API_KEY) {
      logger.error("VOICEMAKER_API_KEY not configured");
      return res.status(503).json({
        success: false,
        message: "Layanan TTS belum dikonfigurasi",
      });
    }

    // Call Voicemaker.in API
    const audioUrl = await callVoicemakerAPI(cleanText, cacheKey);

    if (!audioUrl) {
      return res.status(502).json({
        success: false,
        message: "Gagal menghasilkan audio",
      });
    }

    res.json({
      success: true,
      audioUrl,
    });
  } catch (error) {
    logger.error("TTS generation error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghasilkan audio",
    });
  }
});

// ====================================================================
// STUDENT CHAT ENDPOINTS — AI Conversation Practice
// ====================================================================

/**
 * POST /api/bridge-cards/chat/respond
 * Student: Send a message and receive a conversational response from Ze AI.
 * Also signals when the conversation should end (after MAX_CHAT_TURNS).
 */
router.post("/chat/respond", authenticateBridgeStudent, async (req, res) => {
  try {
    const { chatHistory } = req.body;

    if (!Array.isArray(chatHistory)) {
      return res
        .status(400)
        .json({ success: false, message: "chatHistory harus berupa array" });
    }

    // Prevent token abuse — max 12 messages (6 turns × 2 roles)
    if (chatHistory.length > 12) {
      return res.status(400).json({
        success: false,
        message: "Panjang chatHistory melebihi batas maksimum (12 pesan)",
      });
    }

    // Validate and sanitize each message
    for (const msg of chatHistory) {
      if (!msg || !["user", "ai"].includes(msg.role)) {
        return res
          .status(400)
          .json({ success: false, message: "Format pesan tidak valid" });
      }
      if (typeof msg.content !== "string" || msg.content.trim().length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Konten pesan tidak boleh kosong" });
      }
      if (msg.content.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Panjang pesan melebihi 500 karakter",
        });
      }
    }

    if (!GROQ_API_KEY) {
      logger.error("GROQ_API_KEY not configured");
      return res
        .status(503)
        .json({ success: false, message: "Layanan AI belum dikonfigurasi" });
    }

    // Count completed turns (each user message = 1 turn)
    const turnCount = chatHistory.filter((m) => m.role === "user").length;
    const shouldEnd = turnCount >= MAX_CHAT_TURNS;

    const messages = buildConversationMessages(chatHistory, turnCount);
    const aiResponse = await callGroqConversation(messages);

    if (!aiResponse) {
      return res
        .status(502)
        .json({ success: false, message: "Gagal mendapatkan respons dari AI" });
    }

    logger.info("Chat respond completed", {
      studentId: req.student.id,
      turnCount,
      shouldEnd,
    });

    res.json({ success: true, message: aiResponse, shouldEnd });
  } catch (error) {
    logger.error("Chat respond error", { error: error.message });
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server" });
  }
});

/**
 * POST /api/bridge-cards/chat/analyze
 * Student: Analyze the full chat session and return a language performance report.
 * Reuses the same VoiceAnalysisResult format for consistency with the frontend.
 */
router.post("/chat/analyze", authenticateBridgeStudent, async (req, res) => {
  try {
    const { chatHistory } = req.body;

    if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
      return res.status(400).json({
        success: false,
        message: "chatHistory harus berupa array dan tidak boleh kosong",
      });
    }

    if (chatHistory.length > 12) {
      return res.status(400).json({
        success: false,
        message: "Panjang chatHistory melebihi batas maksimum (12 pesan)",
      });
    }

    // Only user messages matter for analysis — validate presence
    const userMessages = chatHistory.filter((m) => m.role === "user");
    if (userMessages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada pesan dari user untuk dianalisis",
      });
    }

    if (!GROQ_API_KEY) {
      logger.error("GROQ_API_KEY not configured");
      return res
        .status(503)
        .json({ success: false, message: "Layanan AI belum dikonfigurasi" });
    }

    const prompt = buildChatAnalysisPrompt(chatHistory);
    const analysisResult = await callGroqAPI(prompt);

    if (!analysisResult) {
      return res
        .status(502)
        .json({ success: false, message: "Gagal menganalisis percakapan" });
    }

    logger.info("Chat analysis completed", {
      studentId: req.student.id,
      userMessages: userMessages.length,
    });

    res.json({ success: true, ...analysisResult });
  } catch (error) {
    logger.error("Chat analyze error", { error: error.message });
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server" });
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
        return res.status(400).json({
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
        return res.status(400).json({
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
        return res.status(409).json({
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

// ====== AI VOICE PRACTICE HELPERS ======

/**
 * Build the analysis prompt for Groq LLM
 * @param {string} spokenText - What the student said (from speech-to-text)
 * @param {string} targetText - The expected correct sentence
 * @returns {string} The system+user prompt for the AI
 */
/**
 * Build OpenAI-format messages array for Ze AI conversation.
 * Injects Ze AI persona as system prompt and maps chat history to API format.
 * @param {{ role: 'user'|'ai', content: string }[]} chatHistory - Current conversation
 * @param {number} turnCount - Number of completed user turns so far
 * @returns {{ role: string, content: string }[]} Messages for Groq API
 */
function buildConversationMessages(chatHistory, turnCount) {
  const isLastTurn = turnCount >= MAX_CHAT_TURNS;

  const systemPrompt = `You are "Ze AI", a friendly and slightly witty English conversation practice assistant for Zona English language school.

Your personality:
- Warm, encouraging, and naturally conversational
- Uses light humor without being distracting
- Keeps responses SHORT (2-3 sentences max) for a natural back-and-forth rhythm
- Always responds in English only
- Corrects errors very gently — never makes the student feel bad

Your job: Have a natural, flowing English conversation with the student. Ask open-ended questions to keep them talking. React naturally to what they say.

${
    isLastTurn
      ? `IMPORTANT — THIS IS THE FINAL EXCHANGE: You must end the conversation NOW with a funny, creative excuse to leave (e.g., your cat knocked over your coffee, you just spotted a UFO, your pizza arrived). Keep it short and funny. Then warmly tell the student their results are ready and wish them well!`
      : `Turn ${turnCount + 1} of ${MAX_CHAT_TURNS}: Keep the conversation going naturally.`
  }`;

  const apiMessages = [
    { role: "system", content: systemPrompt },
    // Map chat history: 'ai' role → 'assistant' for Groq API compatibility
    ...chatHistory.map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: String(msg.content).replace(/<[^>]*>/g, "").trim(),
    })),
  ];

  return apiMessages;
}

/**
 * Call Groq API for conversational AI response (plain text output).
 * Distinct from callGroqAPI which is purpose-built for JSON analysis responses.
 * @param {{ role: string, content: string }[]} messages - Full messages array
 * @returns {string|null} AI response text or null on failure
 */
async function callGroqConversation(messages) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.75, // More creative for natural conversation
        max_tokens: 256,   // Keep responses concise
      }),
    });

    if (!response.ok) {
      logger.error("Groq conversation API error", {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      logger.error("Groq conversation API returned empty content");
      return null;
    }

    return content;
  } catch (error) {
    logger.error("Groq conversation API call failed", { error: error.message });
    return null;
  }
}

/**
 * Build analysis prompt from a completed chat session.
 * Formats the conversation as a readable dialogue for the LLM to assess.
 * @param {{ role: 'user'|'ai', content: string }[]} chatHistory - Completed conversation
 * @returns {string} Analysis prompt string
 */
function buildChatAnalysisPrompt(chatHistory) {
  const dialogue = chatHistory
    .map((msg) => {
      const speaker = msg.role === "user" ? "Student" : "Ze AI";
      const cleanContent = String(msg.content).replace(/<[^>]*>/g, "").trim();
      return `${speaker}: ${cleanContent}`;
    })
    .join("\n");

  return `You are an English language tutor analyzing a student's performance in a conversation practice session.

Conversation transcript:
${dialogue}

Evaluate ONLY the student's messages (lines starting with "Student:"). Analyze their grammar, vocabulary usage, and overall fluency based on the text patterns.

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "grammarScore": <number 0-100>,
  "vocabScore": <number 0-100>,
  "pronunciationScore": <number 0-100>,
  "corrections": [
    {
      "wrong": "<what the student wrote incorrectly>",
      "right": "<the correct form>",
      "explanation": "<brief explanation in Bahasa Indonesia>"
    }
  ],
  "overallFeedback": "<encouraging summary feedback in Bahasa Indonesia, 2-3 sentences>"
}

Scoring rules:
- grammarScore: Grammar correctness across all student messages
- vocabScore: Variety and accuracy of vocabulary used
- pronunciationScore: Word-level accuracy and sentence completeness (text-based proxy)
- corrections: Up to 5 most important errors from across the whole conversation
- Always respond in valid JSON only`;
}

function buildAnalysisPrompt(spokenText, targetText) {
  return `You are an English language tutor analyzing a student's spoken response.
The student is learning English. Compare what they said to the target sentence.

Target sentence: "${targetText}"
Student said: "${spokenText}"

Analyze and respond with ONLY valid JSON (no markdown, no code fences):
{
  "grammarScore": <number 0-100>,
  "vocabScore": <number 0-100>,
  "pronunciationScore": <number 0-100>,
  "corrections": [
    {
      "wrong": "<what the student said incorrectly>",
      "right": "<the correct form>",
      "explanation": "<brief explanation in Bahasa Indonesia>"
    }
  ],
  "overallFeedback": "<encouraging feedback in Bahasa Indonesia, 1-2 sentences>"
}

Scoring rules:
- grammarScore: Evaluate grammar correctness (tenses, articles, prepositions, word order)
- vocabScore: How accurately the vocabulary matches the target
- pronunciationScore: Word-level accuracy comparing transcribed text to target (missing/extra/wrong words)
- If the student's text is identical to the target, all scores should be 100 and corrections empty
- corrections array should contain specific wrong->right pairs, max 5 items
- Always respond in valid JSON only`;
}

/**
 * Call Groq API for AI-powered text analysis
 * @param {string} prompt - The analysis prompt
 * @returns {object|null} Parsed analysis result or null on failure
 */
async function callGroqAPI(prompt) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a precise English language analysis tool. Always respond with valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      logger.error("Groq API error", {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      logger.error("Groq API returned empty content");
      return null;
    }

    // Parse JSON from AI response — strip code fences if present
    const jsonStr = content
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const parsed = JSON.parse(jsonStr);

    // Clamp scores to 0-100 range
    return {
      grammarScore: Math.max(
        0,
        Math.min(100, Math.round(Number(parsed.grammarScore) || 0)),
      ),
      vocabScore: Math.max(
        0,
        Math.min(100, Math.round(Number(parsed.vocabScore) || 0)),
      ),
      pronunciationScore: Math.max(
        0,
        Math.min(100, Math.round(Number(parsed.pronunciationScore) || 0)),
      ),
      corrections: Array.isArray(parsed.corrections)
        ? parsed.corrections.slice(0, 5).map((c) => ({
            wrong: String(c.wrong || ""),
            right: String(c.right || ""),
            explanation: String(c.explanation || ""),
          }))
        : [],
      overallFeedback: String(parsed.overallFeedback || "Terus berlatih! 💪"),
    };
  } catch (error) {
    logger.error("Groq API call failed", { error: error.message });
    return null;
  }
}

/**
 * Call Voicemaker.in API to generate TTS audio
 * Downloads and caches the audio file locally
 * @param {string} text - Text to convert to speech
 * @param {string} cacheKey - MD5 hash used as filename
 * @returns {string|null} Relative URL to cached audio or null on failure
 */
async function callVoicemakerAPI(text, cacheKey) {
  try {
    // Ensure cache directory exists
    await fs.mkdir(TTS_CACHE_DIR, { recursive: true });

    const response = await fetch(VOICEMAKER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VOICEMAKER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Engine: "neural",
        VoiceId: "ai3-Jony",
        LanguageCode: "en-US",
        Text: text,
        OutputFormat: "mp3",
        SampleRate: "48000",
        Effect: "default",
        MasterSpeed: "0",
        MasterVolume: "0",
        MasterPitch: "0",
      }),
    });

    if (!response.ok) {
      logger.error("Voicemaker API error", {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = await response.json();

    if (!data.success || !data.path) {
      logger.error("Voicemaker API returned no audio path", { data });
      return null;
    }

    // Download the audio file and save to local cache
    const audioResponse = await fetch(data.path);
    if (!audioResponse.ok) {
      logger.error("Failed to download Voicemaker audio", {
        status: audioResponse.status,
      });
      return null;
    }

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    const localPath = path.join(TTS_CACHE_DIR, `${cacheKey}.mp3`);
    await fs.writeFile(localPath, audioBuffer);

    const relativeUrl = `/uploads/tts/${cacheKey}.mp3`;
    logger.info("TTS audio cached", { cacheKey, text: text.substring(0, 50) });

    return relativeUrl;
  } catch (error) {
    logger.error("Voicemaker API call failed", { error: error.message });
    return null;
  }
}

export default router;
