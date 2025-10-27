// Promo Code Routes
import express from "express";
import db from "../db/connection.js";

const router = express.Router();

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

// GET /api/promos/:code - Get specific promo code
router.get("/:code", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM promo_codes 
       WHERE code = ? 
       AND is_active = 1
       AND NOW() BETWEEN valid_from AND valid_until`,
      [req.params.code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Promo code not found or expired" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching promo code:", error);
    res.status(500).json({ error: "Failed to fetch promo code" });
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
