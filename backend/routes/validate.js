// Validation Routes (for affiliate code validation in PromoHub)
import express from "express";
import db from "../db/connection.js";

const router = express.Router();

// POST /api/validate/code - Universal code validation (promo codes + affiliate codes)
router.post("/code", async (req, res) => {
  const { code, purchaseAmount } = req.body;

  console.log("🔍 Validating code:", { code, purchaseAmount });

  if (!code) {
    console.log("❌ No code provided");
    return res.status(400).json({
      valid: false,
      error: "Kode diperlukan",
    });
  }

  try {
    // Check if it's an affiliate/ambassador code first
    console.log("🔎 Checking ambassadors table...");
    const [ambassadorRows] = await db.query(
      `SELECT id, name, role, location, institution, affiliate_code, testimonial, phone, commission_rate 
       FROM ambassadors 
       WHERE affiliate_code = ? 
       AND is_active = 1`,
      [code]
    );

    console.log(`✅ Ambassador query result: ${ambassadorRows.length} rows`);

    if (ambassadorRows.length > 0) {
      const ambassador = ambassadorRows[0];
      console.log("🎉 Ambassador code found:", ambassador.name);
      return res.json({
        valid: true,
        type: "ambassador",
        message: `Kode Ambassador valid! Diskon Rp 50.000 diterapkan.`,
        ambassador: {
          id: ambassador.id,
          name: ambassador.name,
          role: ambassador.role,
          location: ambassador.location,
          institution: ambassador.institution,
          code: ambassador.affiliate_code,
          testimonial: ambassador.testimonial,
          phone: ambassador.phone,
        },
        discount: 50000,
        discountType: "fixed",
        finalAmount: purchaseAmount ? purchaseAmount - 50000 : null,
      });
    }

    // Check if it's a promo code
    console.log("🔎 Checking promo_codes table...");

    // First, check if code exists at all
    const [allPromoRows] = await db.query(
      `SELECT * FROM promo_codes WHERE code = ?`,
      [code]
    );

    if (allPromoRows.length === 0) {
      // Code doesn't exist
      console.log("❌ Code not found in database");
      return res.json({
        valid: false,
        message: "Kode tidak valid. Periksa kembali kode yang Anda masukkan.",
        reason: "not_found",
      });
    }

    const promo = allPromoRows[0];

    // Check if inactive
    if (promo.is_active === 0) {
      console.log("❌ Promo code is inactive");
      return res.json({
        valid: false,
        message: `Kode promo "${promo.code}" sudah tidak aktif.`,
        reason: "inactive",
        promo: {
          code: promo.code,
          name: promo.name,
        },
      });
    }

    // Check if expired or not yet valid
    const now = new Date();
    const validFrom = new Date(promo.valid_from);
    const validUntil = new Date(promo.valid_until);

    if (now < validFrom) {
      console.log("❌ Promo code not yet valid");
      return res.json({
        valid: false,
        message: `Kode promo "${
          promo.code
        }" belum dapat digunakan. Valid mulai ${validFrom.toLocaleDateString(
          "id-ID"
        )}.`,
        reason: "not_yet_valid",
        promo: {
          code: promo.code,
          name: promo.name,
          valid_from: promo.valid_from,
        },
      });
    }

    if (now > validUntil) {
      console.log("❌ Promo code expired");
      return res.json({
        valid: false,
        message: `Kode promo "${
          promo.code
        }" sudah kadaluarsa. Periode berlaku sampai ${validUntil.toLocaleDateString(
          "id-ID"
        )}.`,
        reason: "expired",
        promo: {
          code: promo.code,
          name: promo.name,
          valid_until: promo.valid_until,
        },
      });
    }

    console.log("🎉 Promo code found and valid:", promo.name);

    // Check usage limit (quota)
    if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit) {
      console.log("❌ Usage limit reached");
      return res.json({
        valid: false,
        message: `Kode promo "${promo.code}" sudah mencapai batas penggunaan (${promo.used_count}/${promo.usage_limit}).`,
        reason: "quota_full",
        promo: {
          code: promo.code,
          name: promo.name,
          used_count: promo.used_count,
          usage_limit: promo.usage_limit,
        },
      });
    }

    // Check minimum purchase
    if (
      purchaseAmount &&
      promo.min_purchase > 0 &&
      purchaseAmount < promo.min_purchase
    ) {
      return res.json({
        valid: false,
        message: `Minimum pembelian Rp ${promo.min_purchase.toLocaleString(
          "id-ID"
        )} untuk menggunakan kode ini.`,
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

    const finalAmount = purchaseAmount ? purchaseAmount - discountAmount : null;

    console.log("✅ Sending success response:", {
      type: "promo",
      discount: discountAmount,
      finalAmount,
    });

    res.json({
      valid: true,
      type: "promo",
      message: `Kode Promo valid! ${
        promo.discount_type === "percentage"
          ? `Diskon ${promo.discount_value}%`
          : `Diskon Rp ${discountAmount.toLocaleString("id-ID")}`
      } diterapkan.`,
      promo: {
        code: promo.code,
        name: promo.name,
        description: promo.description,
        discountType: promo.discount_type,
        discountValue: promo.discount_value,
      },
      discount: discountAmount,
      discountType: promo.discount_type,
      finalAmount: finalAmount,
    });
  } catch (error) {
    console.error("❌ Error validating code:", error);
    res.status(500).json({
      valid: false,
      error: "Gagal memvalidasi kode",
    });
  }
});

// POST /api/validate/affiliate-code - Validate affiliate/ambassador code (legacy endpoint)
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
      `SELECT id, name, role, location, institution, affiliate_code, testimonial, phone, commission_rate 
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
        institution: ambassador.institution,
        code: ambassador.affiliate_code,
        testimonial: ambassador.testimonial,
        phone: ambassador.phone,
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
