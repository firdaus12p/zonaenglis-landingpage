// Promo Code Routes
import express from "express";
import db from "../db/connection.js";

const router = express.Router();

// GET /api/promos/admin/all - Get ALL promo codes for admin (including inactive/expired)
router.get("/admin/all", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, code, name, description, discount_type, discount_value, 
              min_purchase, max_discount, usage_limit, used_count, 
              valid_from, valid_until, is_active, applicable_to, created_at, updated_at
       FROM promo_codes 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching all promo codes:", error);
    res.status(500).json({ error: "Failed to fetch promo codes" });
  }
});

// GET /api/promos - Get all active promo codes
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, code, name, description, discount_type, discount_value, 
              min_purchase, max_discount, usage_limit, used_count, 
              valid_from, valid_until, is_active, applicable_to
       FROM promo_codes 
       WHERE is_active = 1 
       AND NOW() BETWEEN valid_from AND valid_until
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    res.status(500).json({ error: "Failed to fetch promo codes" });
  }
});

// GET /api/promos/:id - Get specific promo code by ID (for admin edit)
router.get("/:id", async (req, res) => {
  try {
    // Check if it's a numeric ID (for admin) or code string (for validation)
    const isNumericId = /^\d+$/.test(req.params.id);

    let query, params;
    if (isNumericId) {
      // Admin fetching by ID
      query = "SELECT * FROM promo_codes WHERE id = ?";
      params = [req.params.id];
    } else {
      // Public fetching by code
      query = `SELECT * FROM promo_codes 
               WHERE code = ? 
               AND is_active = 1
               AND NOW() BETWEEN valid_from AND valid_until`;
      params = [req.params.id];
    }

    const [rows] = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Promo code not found or expired" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching promo code:", error);
    res.status(500).json({ error: "Failed to fetch promo code" });
  }
});

// POST /api/promos - Create new promo code (ADMIN)
router.post("/", async (req, res) => {
  const {
    code,
    name,
    description,
    discount_type,
    discount_value,
    min_purchase,
    max_discount,
    usage_limit,
    valid_from,
    valid_until,
    applicable_to,
    is_active,
  } = req.body;

  // Validation
  if (!code || !name || !discount_type || !discount_value) {
    return res.status(400).json({
      error:
        "Missing required fields: code, name, discount_type, discount_value",
    });
  }

  // Check if code already exists
  try {
    const [existing] = await db.query(
      "SELECT id FROM promo_codes WHERE code = ?",
      [code]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Promo code already exists" });
    }

    // Insert new promo code
    const [result] = await db.query(
      `INSERT INTO promo_codes 
       (code, name, description, discount_type, discount_value, min_purchase, 
        max_discount, usage_limit, valid_from, valid_until, applicable_to, is_active, used_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        code,
        name,
        description || null,
        discount_type,
        discount_value,
        min_purchase || 0,
        max_discount || null,
        usage_limit || null,
        valid_from || null,
        valid_until || null,
        applicable_to || "all",
        is_active !== undefined ? is_active : 1,
      ]
    );

    res.status(201).json({
      message: "Promo code created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating promo code:", error);
    res.status(500).json({ error: "Failed to create promo code" });
  }
});

// PUT /api/promos/:id - Update promo code (ADMIN)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    code,
    name,
    description,
    discount_type,
    discount_value,
    min_purchase,
    max_discount,
    usage_limit,
    valid_from,
    valid_until,
    applicable_to,
    is_active,
  } = req.body;

  try {
    // Check if promo code exists
    const [existing] = await db.query(
      "SELECT id FROM promo_codes WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Promo code not found" });
    }

    // Check if new code conflicts with another promo
    if (code) {
      const [codeExists] = await db.query(
        "SELECT id FROM promo_codes WHERE code = ? AND id != ?",
        [code, id]
      );

      if (codeExists.length > 0) {
        return res.status(400).json({ error: "Promo code already exists" });
      }
    }

    // Update promo code
    await db.query(
      `UPDATE promo_codes SET 
       code = ?, name = ?, description = ?, discount_type = ?, 
       discount_value = ?, min_purchase = ?, max_discount = ?, 
       usage_limit = ?, valid_from = ?, valid_until = ?, 
       applicable_to = ?, is_active = ?
       WHERE id = ?`,
      [
        code,
        name,
        description || null,
        discount_type,
        discount_value,
        min_purchase || 0,
        max_discount || null,
        usage_limit || null,
        valid_from || null,
        valid_until || null,
        applicable_to || "all",
        is_active !== undefined ? is_active : 1,
        id,
      ]
    );

    res.json({ message: "Promo code updated successfully" });
  } catch (error) {
    console.error("Error updating promo code:", error);
    res.status(500).json({ error: "Failed to update promo code" });
  }
});

// PATCH /api/promos/:id/toggle - Toggle active status (ADMIN)
router.patch("/:id/toggle", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if promo code exists
    const [existing] = await db.query(
      "SELECT is_active FROM promo_codes WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Promo code not found" });
    }

    // Toggle the is_active status
    const newStatus = existing[0].is_active === 1 ? 0 : 1;
    await db.query("UPDATE promo_codes SET is_active = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    res.json({
      message: `Promo code ${
        newStatus === 1 ? "activated" : "deactivated"
      } successfully`,
      is_active: newStatus,
    });
  } catch (error) {
    console.error("Error toggling promo code status:", error);
    res.status(500).json({ error: "Failed to toggle promo code status" });
  }
});

// DELETE /api/promos/:id - Delete promo code (ADMIN)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if promo code exists
    const [existing] = await db.query(
      "SELECT id FROM promo_codes WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Promo code not found" });
    }

    // Delete promo code
    await db.query("DELETE FROM promo_codes WHERE id = ?", [id]);

    res.json({ message: "Promo code deleted successfully" });
  } catch (error) {
    console.error("Error deleting promo code:", error);
    res.status(500).json({ error: "Failed to delete promo code" });
  }
});

// POST /api/promos/validate - Validate and apply promo code
router.post("/validate", async (req, res) => {
  const { code, purchaseAmount } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Promo code is required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT * FROM promo_codes 
       WHERE code = ? 
       AND is_active = 1
       AND NOW() BETWEEN valid_from AND valid_until`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        valid: false,
        error: "Promo code not found or expired",
      });
    }

    const promo = rows[0];

    // Check usage limit
    if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit) {
      return res.status(400).json({
        valid: false,
        error: "Promo code usage limit reached",
      });
    }

    // Check minimum purchase
    if (
      purchaseAmount &&
      promo.min_purchase > 0 &&
      purchaseAmount < promo.min_purchase
    ) {
      return res.status(400).json({
        valid: false,
        error: `Minimum purchase amount is Rp ${promo.min_purchase.toLocaleString(
          "id-ID"
        )}`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discount_type === "percentage") {
      discountAmount = (purchaseAmount * promo.discount_value) / 100;

      // Apply max discount if set
      if (promo.max_discount && discountAmount > promo.max_discount) {
        discountAmount = promo.max_discount;
      }
    } else {
      discountAmount = promo.discount_value;
    }

    res.json({
      valid: true,
      promo: {
        code: promo.code,
        name: promo.name,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        discount_amount: discountAmount,
        final_amount: purchaseAmount ? purchaseAmount - discountAmount : null,
      },
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    res.status(500).json({ error: "Failed to validate promo code" });
  }
});

// POST /api/promos/use - Record promo code usage
router.post("/use", async (req, res) => {
  const { code, userId, purchaseAmount, discountAmount } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Promo code is required" });
  }

  try {
    // Get promo code
    const [promos] = await db.query(
      "SELECT id FROM promo_codes WHERE code = ? AND is_active = 1",
      [code]
    );

    if (promos.length === 0) {
      return res.status(404).json({ error: "Promo code not found" });
    }

    const promoId = promos[0].id;

    // Record usage
    await db.query(
      `INSERT INTO promo_usage (promo_code_id, user_id, purchase_amount, discount_amount) 
       VALUES (?, ?, ?, ?)`,
      [promoId, userId || null, purchaseAmount || 0, discountAmount || 0]
    );

    // Increment used_count
    await db.query(
      "UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?",
      [promoId]
    );

    res.json({ message: "Promo code usage recorded successfully" });
  } catch (error) {
    console.error("Error recording promo usage:", error);
    res.status(500).json({ error: "Failed to record promo usage" });
  }
});

export default router;
