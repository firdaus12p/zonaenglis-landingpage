// Promo Claims Routes
// Purpose: Handle direct promo claims without affiliate/promo codes

import express from "express";
import db from "../db/connection.js";
import {
  validatePhoneNumber,
  generateDeviceFingerprint,
} from "../services/whatsapp.js";

const router = express.Router();

/**
 * POST /api/promo-claims/claim
 * Submit a direct promo claim without code
 *
 * Request body:
 * {
 *   user_name: string (required),
 *   user_phone: string (required),
 *   user_email?: string,
 *   user_city?: string,
 *   program_id?: number,
 *   program_name: string (required),
 *   program_branch?: string,
 *   program_type?: string,
 *   program_category?: string,
 *   urgency?: 'urgent' | 'this_month' | 'browsing'
 * }
 */
router.post("/claim", async (req, res) => {
  try {
    console.log("\n📝 Direct promo claim request:", req.body);

    const {
      user_name,
      user_phone,
      user_email,
      user_city,
      program_id,
      program_name,
      program_branch,
      program_type,
      program_category,
      urgency = "browsing",
    } = req.body;

    // Validate required fields
    if (!user_name || !user_phone || !program_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_name, user_phone, program_name",
      });
    }

    // Validate phone number format
    if (!validatePhoneNumber(user_phone)) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number format. Use 08xxx or 628xxx format.",
      });
    }

    // Check if this phone already claimed today (prevent spam)
    const today = new Date().toISOString().split("T")[0];
    const [existingClaim] = await db.query(
      "SELECT id, user_name, program_name FROM promo_claims WHERE user_phone = ? AND DATE(created_at) = ? AND deleted_at IS NULL",
      [user_phone, today]
    );

    if (existingClaim.length > 0) {
      const existing = existingClaim[0];
      return res.status(429).json({
        success: false,
        error: `Nomor ini sudah mengajukan klaim untuk "${existing.program_name}" hari ini. Anda hanya bisa mengajukan 1 klaim per hari.`,
        existing_program: existing.program_name,
      });
    }

    // Generate device fingerprint for additional spam prevention
    const deviceFingerprint = generateDeviceFingerprint(req);

    console.log("📝 Inserting promo claim record...");

    // Insert promo claim record
    const [result] = await db.query(
      `INSERT INTO promo_claims 
       (user_name, user_phone, user_email, user_city, program_id, program_name, 
        program_branch, program_type, program_category, urgency, device_fingerprint, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'promo_hub')`,
      [
        user_name,
        user_phone,
        user_email || null,
        user_city || null,
        program_id || null,
        program_name,
        program_branch || null,
        program_type || null,
        program_category || null,
        urgency,
        deviceFingerprint,
      ]
    );

    const claimId = result.insertId;

    console.log(
      `✅ Promo claim submitted: ID ${claimId}, User: ${user_name}, Program: ${program_name}`
    );

    // Return success
    res.json({
      success: true,
      claim_id: claimId,
      message:
        "Promo claim submitted successfully! Admin will contact you soon.",
    });
  } catch (error) {
    console.error("❌ Error submitting promo claim:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit promo claim",
      details: error.message,
    });
  }
});

/**
 * GET /api/promo-claims/all
 * Get all active promo claims (for admin dashboard)
 */
router.get("/all", async (req, res) => {
  try {
    const [claims] = await db.query(
      `SELECT 
        pc.id, pc.user_name, pc.user_phone, pc.user_email, pc.user_city,
        pc.program_name, pc.program_branch, pc.program_type, pc.program_category,
        pc.urgency, pc.follow_up_status, pc.follow_up_notes, pc.registered,
        pc.created_at,
        DATEDIFF(NOW(), pc.created_at) as days_ago,
        p.id as program_id_link, p.title as program_title,
        au.username as follow_up_by_name
       FROM promo_claims pc
       LEFT JOIN programs p ON pc.program_id = p.id
       LEFT JOIN admin_users au ON pc.follow_up_by = au.id
       WHERE pc.deleted_at IS NULL
       ORDER BY 
         CASE pc.follow_up_status
           WHEN 'pending' THEN 1
           WHEN 'contacted' THEN 2
           WHEN 'converted' THEN 3
           ELSE 4
         END,
         pc.created_at DESC
       LIMIT 200`,
      []
    );

    res.json({
      success: true,
      claims: claims,
      count: claims.length,
    });
  } catch (error) {
    console.error("❌ Error getting promo claims:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get promo claims",
    });
  }
});

/**
 * GET /api/promo-claims/stats
 * Get statistics for promo claims
 */
router.get("/stats", async (req, res) => {
  try {
    // Get total claims count
    const [totalCount] = await db.query(
      "SELECT COUNT(*) as total FROM promo_claims WHERE deleted_at IS NULL",
      []
    );

    // Get today's count
    const today = new Date().toISOString().split("T")[0];
    const [todayCount] = await db.query(
      "SELECT COUNT(*) as today FROM promo_claims WHERE DATE(created_at) = ? AND deleted_at IS NULL",
      [today]
    );

    // Get pending follow-ups
    const [pendingCount] = await db.query(
      "SELECT COUNT(*) as pending FROM promo_claims WHERE follow_up_status = 'pending' AND deleted_at IS NULL",
      []
    );

    // Get contacted
    const [contactedCount] = await db.query(
      "SELECT COUNT(*) as contacted FROM promo_claims WHERE follow_up_status = 'contacted' AND deleted_at IS NULL",
      []
    );

    // Get conversions
    const [conversions] = await db.query(
      "SELECT COUNT(*) as converted FROM promo_claims WHERE follow_up_status = 'converted' AND deleted_at IS NULL",
      []
    );

    // Get lost leads
    const [lostCount] = await db.query(
      "SELECT COUNT(*) as lost FROM promo_claims WHERE follow_up_status = 'lost' AND deleted_at IS NULL",
      []
    );

    res.json({
      success: true,
      stats: {
        total_claims: totalCount[0].total,
        today_claims: todayCount[0].today,
        pending: pendingCount[0].pending,
        contacted: contactedCount[0].contacted,
        conversions: conversions[0].converted,
        lost: lostCount[0].lost,
      },
    });
  } catch (error) {
    console.error("❌ Error getting promo claim stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get statistics",
    });
  }
});

/**
 * PATCH /api/promo-claims/update-status/:claim_id
 * Update follow-up status for a claim
 */
router.patch("/update-status/:claim_id", async (req, res) => {
  try {
    const { claim_id } = req.params;
    const { follow_up_status, follow_up_notes, registered, follow_up_by } =
      req.body;

    const updates = [];
    const values = [];

    if (follow_up_status) {
      updates.push("follow_up_status = ?");
      values.push(follow_up_status);
    }

    if (follow_up_notes !== undefined) {
      updates.push("follow_up_notes = ?");
      values.push(follow_up_notes);
    }

    if (registered !== undefined) {
      updates.push("registered = ?");
      values.push(registered);

      if (registered) {
        updates.push("registered_at = NOW()");
      }
    }

    if (follow_up_by !== undefined) {
      updates.push("follow_up_by = ?");
      values.push(follow_up_by);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    values.push(claim_id);

    await db.query(
      `UPDATE promo_claims SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: "Claim status updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating claim status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update claim status",
    });
  }
});

/**
 * DELETE /api/promo-claims/:claim_id
 * Soft delete a promo claim
 */
router.delete("/:claim_id", async (req, res) => {
  try {
    const { claim_id } = req.params;
    const { deleted_by } = req.body;

    const [result] = await db.query(
      "UPDATE promo_claims SET deleted_at = NOW(), deleted_by = ? WHERE id = ? AND deleted_at IS NULL",
      [deleted_by || "admin", claim_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Claim not found or already deleted",
      });
    }

    res.json({
      success: true,
      message: "Claim deleted successfully (soft delete)",
      deleted_id: parseInt(claim_id),
    });
  } catch (error) {
    console.error("❌ Error deleting claim:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete claim",
    });
  }
});

/**
 * PUT /api/promo-claims/restore/:claim_id
 * Restore a soft-deleted claim
 */
router.put("/restore/:claim_id", async (req, res) => {
  try {
    const { claim_id } = req.params;

    const [result] = await db.query(
      "UPDATE promo_claims SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL",
      [claim_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Claim not found or not deleted",
      });
    }

    res.json({
      success: true,
      message: "Claim restored successfully",
      restored_id: parseInt(claim_id),
    });
  } catch (error) {
    console.error("❌ Error restoring claim:", error);
    res.status(500).json({
      success: false,
      error: "Failed to restore claim",
    });
  }
});

export default router;
