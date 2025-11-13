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
      query = `SELECT id, code, name, description, discount_type, discount_value, 
               min_purchase, max_discount, usage_limit, used_count, 
               valid_from, valid_until, is_active, applicable_to, created_at, updated_at
               FROM promo_codes WHERE id = ?`;
      params = [req.params.id];
    } else {
      // Public fetching by code
      query = `SELECT id, code, name, description, discount_type, discount_value, 
               min_purchase, max_discount, usage_limit, used_count, 
               valid_from, valid_until, is_active, applicable_to
               FROM promo_codes 
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
      `SELECT id, code, name, description, discount_type, discount_value, 
       min_purchase, max_discount, usage_limit, used_count, 
       valid_from, valid_until, is_active, applicable_to
       FROM promo_codes 
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
  console.log(
    `\n⚠️ [${new Date().toISOString()}] /use endpoint called! This should NOT be used!`
  );
  console.log("📦 Request body:", req.body);

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

/**
 * POST /api/promos/track
 * Track promo code usage with user details (similar to affiliate tracking)
 *
 * Request body:
 * {
 *   promo_code: string (required),
 *   user_name: string (required),
 *   user_phone: string (required),
 *   user_email?: string,
 *   program_name?: string,
 *   original_amount?: number,
 *   discount_amount?: number,
 *   final_amount?: number
 * }
 */
router.post("/track", async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    const requestId = Math.random().toString(36).substring(7);
    console.log(
      `\n🔍 [${timestamp}] [REQ:${requestId}] Promo tracking request received:`
    );
    console.log("📦 Request body:", req.body);
    console.log("🌐 Client IP:", req.ip || req.connection.remoteAddress);

    const {
      promo_code,
      user_name,
      user_phone,
      user_email,
      program_name,
      original_amount,
      discount_amount,
      final_amount,
    } = req.body;

    // Validate required fields
    if (!promo_code || !user_name || !user_phone) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: promo_code, user_name, user_phone",
      });
    }

    // Get promo code info
    const [promos] = await db.query(
      "SELECT id, code, name, discount_value, is_active FROM promo_codes WHERE code = ?",
      [promo_code]
    );

    if (promos.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Promo code '${promo_code}' not found`,
      });
    }

    const promo = promos[0];

    if (!promo.is_active) {
      return res.status(400).json({
        success: false,
        error: `Promo code '${promo_code}' is not active`,
      });
    }

    // ⚠️ CRITICAL: Check duplicate BEFORE doing anything else
    // This prevents race conditions when multiple requests come in simultaneously
    const today = new Date().toISOString().split("T")[0];

    // Use FOR UPDATE to lock the row and prevent race conditions
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [existingUsage] = await connection.query(
        "SELECT id FROM promo_usage WHERE promo_code_id = ? AND user_phone = ? AND DATE(used_at) = ? AND deleted_at IS NULL FOR UPDATE",
        [promo.id, user_phone, today]
      );

      if (existingUsage.length > 0) {
        await connection.rollback();
        connection.release();

        console.log(
          `⚠️ [${new Date().toISOString()}] [REQ:${requestId}] DUPLICATE TRACKING PREVENTED: ${promo_code} - ${user_phone}`
        );
        console.log(`   Existing usage ID: ${existingUsage[0].id}`);
        return res.json({
          success: true,
          already_tracked: true,
          message:
            "You already used this promo code today. Discount still applies!",
        });
      }

      console.log(
        `✅ [${new Date().toISOString()}] [REQ:${requestId}] No duplicate found, proceeding with tracking...`
      );

      // Insert usage record
      const [result] = await connection.query(
        `INSERT INTO promo_usage 
         (promo_code_id, user_name, user_phone, user_email, program_name, 
          original_amount, discount_amount, final_amount, follow_up_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          promo.id,
          user_name,
          user_phone,
          user_email || null,
          program_name || null,
          original_amount || 0,
          discount_amount || 0,
          final_amount || 0,
        ]
      );

      // ⚠️ REMOVED MANUAL INCREMENT - Database trigger handles this!
      // Trigger 'after_promo_usage_insert' calls UpdatePromoUsage() stored procedure
      // which sets used_count = COUNT(*) of all active promo_usage records
      // Manual increment here causes DOUBLE counting!

      console.log(
        `📈 [${new Date().toISOString()}] [REQ:${requestId}] Waiting for database trigger to update used_count...`
      );

      // Get count after trigger execution (trigger fires AFTER INSERT)
      const [afterCount] = await connection.query(
        "SELECT used_count FROM promo_codes WHERE id = ?",
        [promo.id]
      );
      console.log(
        `📈 [${new Date().toISOString()}] [REQ:${requestId}] AFTER TRIGGER - used_count: ${
          afterCount[0].used_count
        } (auto-updated by trigger)`
      );

      // Commit transaction
      await connection.commit();
      connection.release();

      console.log(
        `✅ [${new Date().toISOString()}] [REQ:${requestId}] Promo usage tracked successfully: ${promo_code} - ${user_name} (${user_phone})`
      );
      console.log(`   [REQ:${requestId}] Usage ID: ${result.insertId}`);
      console.log(`   [REQ:${requestId}] Promo Name: ${promo.name}`);

      res.json({
        success: true,
        message: "Promo code usage tracked successfully",
        usage_id: result.insertId,
        promo_name: promo.name,
      });
    } catch (transactionError) {
      // Rollback on error
      await connection.rollback();
      connection.release();
      throw transactionError;
    }
  } catch (error) {
    console.error("❌ Error tracking promo usage:", error);
    res.status(500).json({
      success: false,
      error: "Failed to track promo usage",
    });
  }
});

/**
 * GET /api/promos/stats/:promo_id
 * Get usage statistics for a specific promo code
 */
router.get("/stats/:promo_id", async (req, res) => {
  try {
    const { promo_id } = req.params;

    // Get total uses (excluding deleted)
    const [totalResult] = await db.query(
      "SELECT COUNT(*) as total FROM promo_usage WHERE promo_code_id = ? AND deleted_at IS NULL",
      [promo_id]
    );

    // Get today's uses
    const today = new Date().toISOString().split("T")[0];
    const [todayResult] = await db.query(
      "SELECT COUNT(*) as today FROM promo_usage WHERE promo_code_id = ? AND DATE(used_at) = ? AND deleted_at IS NULL",
      [promo_id, today]
    );

    // Get pending follow-ups
    const [pendingResult] = await db.query(
      "SELECT COUNT(*) as pending FROM promo_usage WHERE promo_code_id = ? AND follow_up_status = 'pending' AND deleted_at IS NULL",
      [promo_id]
    );

    // Get contacted/follow-ups
    const [followupsResult] = await db.query(
      "SELECT COUNT(*) as followups FROM promo_usage WHERE promo_code_id = ? AND follow_up_status = 'contacted' AND deleted_at IS NULL",
      [promo_id]
    );

    // Get conversions
    const [conversionsResult] = await db.query(
      "SELECT COUNT(*) as conversions FROM promo_usage WHERE promo_code_id = ? AND follow_up_status = 'converted' AND deleted_at IS NULL",
      [promo_id]
    );

    // Get lost
    const [lostResult] = await db.query(
      "SELECT COUNT(*) as lost FROM promo_usage WHERE promo_code_id = ? AND follow_up_status = 'lost' AND deleted_at IS NULL",
      [promo_id]
    );

    const stats = {
      total_uses: totalResult[0].total,
      today_uses: todayResult[0].today,
      pending_followups: pendingResult[0].pending,
      followups: followupsResult[0].followups,
      conversions: conversionsResult[0].conversions,
      lost: lostResult[0].lost,
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching promo stats:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch promo stats" });
  }
});

/**
 * GET /api/promos/leads/:promo_id
 * Get active leads (pending/contacted/converted) for a promo code
 */
router.get("/leads/:promo_id", async (req, res) => {
  try {
    const { promo_id } = req.params;

    const [leads] = await db.query(
      `SELECT 
        pu.id,
        pu.user_name,
        pu.user_phone,
        pu.user_email,
        pu.program_name,
        pu.original_amount,
        pu.discount_amount,
        pu.final_amount,
        pu.follow_up_status,
        pu.follow_up_notes,
        pu.registered,
        pu.used_at as first_used_at,
        DATEDIFF(NOW(), pu.used_at) as days_ago,
        pc.code as promo_code,
        pc.name as promo_name
       FROM promo_usage pu
       JOIN promo_codes pc ON pu.promo_code_id = pc.id
       WHERE pu.promo_code_id = ? 
       AND pu.deleted_at IS NULL
       AND pu.follow_up_status IN ('pending', 'contacted', 'converted')
       ORDER BY pu.used_at DESC`,
      [promo_id]
    );

    res.json({ success: true, leads });
  } catch (error) {
    console.error("Error fetching promo leads:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch promo leads" });
  }
});

/**
 * GET /api/promos/lost-leads/:promo_id
 * Get lost leads for a promo code
 */
router.get("/lost-leads/:promo_id", async (req, res) => {
  try {
    const { promo_id } = req.params;

    const [leads] = await db.query(
      `SELECT 
        pu.id,
        pu.user_name,
        pu.user_phone,
        pu.user_email,
        pu.program_name,
        pu.original_amount,
        pu.discount_amount,
        pu.final_amount,
        pu.follow_up_status,
        pu.follow_up_notes,
        pu.registered,
        pu.used_at as first_used_at,
        DATEDIFF(NOW(), pu.used_at) as days_ago,
        pc.code as promo_code,
        pc.name as promo_name
       FROM promo_usage pu
       JOIN promo_codes pc ON pu.promo_code_id = pc.id
       WHERE pu.promo_code_id = ? 
       AND pu.deleted_at IS NULL
       AND pu.follow_up_status = 'lost'
       ORDER BY pu.used_at DESC`,
      [promo_id]
    );

    res.json({ success: true, leads });
  } catch (error) {
    console.error("Error fetching lost leads:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch lost leads" });
  }
});

/**
 * GET /api/promos/deleted-leads/:promo_id
 * Get deleted leads for a promo code
 */
router.get("/deleted-leads/:promo_id", async (req, res) => {
  try {
    const { promo_id } = req.params;

    const [leads] = await db.query(
      `SELECT 
        pu.id,
        pu.user_name,
        pu.user_phone,
        pu.user_email,
        pu.program_name,
        pu.original_amount,
        pu.discount_amount,
        pu.final_amount,
        pu.follow_up_status,
        pu.used_at as first_used_at,
        pu.deleted_at,
        pu.deleted_by,
        DATEDIFF(NOW(), pu.deleted_at) as days_deleted,
        DATEDIFF(NOW(), pu.used_at) as days_ago,
        pc.code as promo_code,
        pc.name as promo_name
       FROM promo_usage pu
       JOIN promo_codes pc ON pu.promo_code_id = pc.id
       WHERE pu.promo_code_id = ? 
       AND pu.deleted_at IS NOT NULL
       ORDER BY pu.deleted_at DESC`,
      [promo_id]
    );

    res.json({ success: true, leads });
  } catch (error) {
    console.error("Error fetching deleted leads:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch deleted leads" });
  }
});

/**
 * PATCH /api/promos/update-status/:usage_id
 * Update follow-up status for a promo usage
 */
router.patch("/update-status/:usage_id", async (req, res) => {
  try {
    const { usage_id } = req.params;
    const { follow_up_status, registered } = req.body;

    const validStatuses = ["pending", "contacted", "converted", "lost"];
    if (!validStatuses.includes(follow_up_status)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid status. Must be: pending, contacted, converted, or lost",
      });
    }

    await db.query(
      `UPDATE promo_usage 
       SET follow_up_status = ?, registered = ?
       WHERE id = ?`,
      [follow_up_status, registered ? 1 : 0, usage_id]
    );

    res.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ success: false, error: "Failed to update status" });
  }
});

/**
 * DELETE /api/promos/lead/:usage_id
 * Soft delete a promo lead
 */
router.delete("/lead/:usage_id", async (req, res) => {
  try {
    const { usage_id } = req.params;
    const { deleted_by } = req.body;

    await db.query(
      "UPDATE promo_usage SET deleted_at = NOW(), deleted_by = ? WHERE id = ?",
      [deleted_by || "admin", usage_id]
    );

    res.json({ success: true, message: "Lead soft deleted successfully" });
  } catch (error) {
    console.error("Error soft deleting lead:", error);
    res.status(500).json({ success: false, error: "Failed to delete lead" });
  }
});

/**
 * PUT /api/promos/restore/:usage_id
 * Restore a soft-deleted promo lead
 */
router.put("/restore/:usage_id", async (req, res) => {
  try {
    const { usage_id } = req.params;

    await db.query(
      "UPDATE promo_usage SET deleted_at = NULL, deleted_by = NULL WHERE id = ?",
      [usage_id]
    );

    res.json({ success: true, message: "Lead restored successfully" });
  } catch (error) {
    console.error("Error restoring lead:", error);
    res.status(500).json({ success: false, error: "Failed to restore lead" });
  }
});

/**
 * DELETE /api/promos/permanent-delete/:usage_id
 * Permanently delete a promo lead (only if already soft-deleted)
 */
router.delete("/permanent-delete/:usage_id", async (req, res) => {
  try {
    const { usage_id } = req.params;

    // Check if record exists and is soft-deleted
    const [existing] = await db.query(
      "SELECT id, user_name, deleted_at FROM promo_usage WHERE id = ?",
      [usage_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    if (!existing[0].deleted_at) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot permanently delete active records. Please soft-delete first.",
      });
    }

    // Get promo_code_id before deletion to decrement used_count
    const [usageData] = await db.query(
      "SELECT promo_code_id FROM promo_usage WHERE id = ?",
      [usage_id]
    );

    const promoCodeId = usageData[0].promo_code_id;

    // Use transaction to ensure atomicity (delete + decrement happen together)
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Permanent deletion
      await connection.query(
        "DELETE FROM promo_usage WHERE id = ? AND deleted_at IS NOT NULL",
        [usage_id]
      );

      // Decrement used_count (but never go below 0)
      await connection.query(
        "UPDATE promo_codes SET used_count = GREATEST(used_count - 1, 0) WHERE id = ?",
        [promoCodeId]
      );

      // Commit transaction
      await connection.commit();
      connection.release();

      console.log(
        `🗑️ PERMANENT DELETE: Promo Lead ID ${usage_id} (${existing[0].user_name}) permanently removed & used_count decremented`
      );

      res.json({
        success: true,
        message: "Lead permanently deleted from database",
        deleted_id: usage_id,
        deleted_user: existing[0].user_name,
      });
    } catch (transactionError) {
      // Rollback on error
      await connection.rollback();
      connection.release();
      throw transactionError;
    }
  } catch (error) {
    console.error("Error permanently deleting lead:", error);
    res.status(500).json({
      success: false,
      error: "Failed to permanently delete lead",
    });
  }
});

export default router;
