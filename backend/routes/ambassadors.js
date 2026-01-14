// Ambassador Routes
import express from "express";
import db from "../db/connection.js";
import { authenticateToken } from "./auth.js";

const router = express.Router();

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return res.status(403).json({
      error: "Akses ditolak. Hanya admin yang dapat mengakses fitur ini",
    });
  }
  next();
};

// GET /api/ambassadors - Get all active ambassadors
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, role, location, institution, achievement, commission, referrals, badge_text, badge_variant, image_url, affiliate_code, testimonial, is_active, phone, email, total_earnings FROM ambassadors WHERE is_active = 1 ORDER BY institution ASC, id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching ambassadors:", error);
    res.status(500).json({ error: "Failed to fetch ambassadors" });
  }
});

// GET /api/ambassadors/:id - Get single ambassador
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, role, location, institution, achievement, commission, referrals, badge_text, badge_variant, 
              image_url, affiliate_code, testimonial, is_active, phone, email, bank_account, bank_name, commission_rate, 
              total_earnings, created_at, updated_at 
       FROM ambassadors WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Ambassador not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching ambassador:", error);
    res.status(500).json({ error: "Failed to fetch ambassador" });
  }
});

// POST /api/ambassadors - Create new ambassador (ADMIN ONLY)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  const {
    name,
    role,
    location,
    institution,
    achievement,
    commission,
    referrals,
    badge_text,
    badge_variant,
    image_url,
    affiliate_code,
    testimonial,
    phone,
    email,
    bank_account,
    bank_name,
    commission_rate,
  } = req.body;

  // Validation
  if (!name || !role || !location || !affiliate_code) {
    return res.status(400).json({
      error: "Missing required fields: name, role, location, affiliate_code",
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO ambassadors 
      (name, role, location, institution, achievement, commission, referrals, badge_text, badge_variant, image_url, affiliate_code, testimonial, phone, email, bank_account, bank_name, commission_rate, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        name,
        role,
        location,
        institution || null,
        achievement || null,
        commission || 0,
        referrals || 0,
        badge_text || null,
        badge_variant || "ambassador",
        image_url || null,
        affiliate_code,
        testimonial || null,
        phone || null,
        email || null,
        bank_account || null,
        bank_name || null,
        commission_rate || 15.0,
      ]
    );

    res.status(201).json({
      message: "Ambassador created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating ambassador:", error);

    // Handle duplicate affiliate code
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Affiliate code already exists" });
    }

    res.status(500).json({ error: "Failed to create ambassador" });
  }
});

// PUT /api/ambassadors/:id - Update ambassador (ADMIN ONLY)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const {
    name,
    role,
    location,
    institution,
    achievement,
    commission,
    referrals,
    badge_text,
    badge_variant,
    image_url,
    affiliate_code,
    testimonial,
    phone,
    email,
    bank_account,
    bank_name,
    commission_rate,
    is_active,
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE ambassadors 
       SET name = ?, role = ?, location = ?, institution = ?, achievement = ?, commission = ?, referrals = ?, 
           badge_text = ?, badge_variant = ?, image_url = ?, affiliate_code = ?, testimonial = ?, phone = ?, 
           email = ?, bank_account = ?, bank_name = ?, commission_rate = ?, is_active = ?
       WHERE id = ?`,
      [
        name,
        role,
        location,
        institution,
        achievement,
        commission,
        referrals,
        badge_text,
        badge_variant,
        image_url,
        affiliate_code,
        testimonial,
        phone,
        email,
        bank_account,
        bank_name,
        commission_rate,
        is_active,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Ambassador not found" });
    }

    res.json({ message: "Ambassador updated successfully" });
  } catch (error) {
    console.error("Error updating ambassador:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Affiliate code already exists" });
    }

    res.status(500).json({ error: "Failed to update ambassador" });
  }
});

// DELETE /api/ambassadors/:id - Delete ambassador (soft delete) (ADMIN ONLY)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE ambassadors SET is_active = 0 WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Ambassador not found" });
    }

    res.json({ message: "Ambassador deleted successfully" });
  } catch (error) {
    console.error("Error deleting ambassador:", error);
    res.status(500).json({ error: "Failed to delete ambassador" });
  }
});

// GET /api/ambassadors/code/:affiliateCode - Get ambassador by affiliate code
router.get("/code/:affiliateCode", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, role, location, institution, affiliate_code, testimonial, phone, email, commission_rate, 
              badge_text, badge_variant, image_url, total_earnings 
       FROM ambassadors WHERE affiliate_code = ? AND is_active = 1`,
      [req.params.affiliateCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Ambassador code not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching ambassador by code:", error);
    res.status(500).json({ error: "Failed to fetch ambassador" });
  }
});

export default router;
