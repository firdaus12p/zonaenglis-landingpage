// Validation Routes (for affiliate code validation in PromoHub)
import express from "express";
import db from "../db/connection.js";

const router = express.Router();

// POST /api/validate/affiliate-code - Validate affiliate/ambassador code
router.post("/affiliate-code", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      valid: false,
      error: "Affiliate code is required",
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, name, role, location, affiliate_code, commission_rate 
       FROM ambassadors 
       WHERE affiliate_code = ? 
       AND is_active = 1`,
      [code]
    );

    if (rows.length === 0) {
      return res.json({
        valid: false,
        message: "Kode tidak valid. Periksa kembali kode yang Anda masukkan.",
      });
    }

    const ambassador = rows[0];

    res.json({
      valid: true,
      message: `Kode valid! Diskon Rp 50.000 diterapkan.`,
      ambassador: {
        id: ambassador.id,
        name: ambassador.name,
        role: ambassador.role,
        location: ambassador.location,
        code: ambassador.affiliate_code,
        commission_rate: ambassador.commission_rate,
      },
      discount: 50000,
    });
  } catch (error) {
    console.error("Error validating affiliate code:", error);
    res.status(500).json({
      valid: false,
      error: "Failed to validate affiliate code",
    });
  }
});

export default router;
