// Affiliate Tracking Routes
// Purpose: Track affiliate code usage and notify ambassadors

import express from "express";
import db from "../db/connection.js";
import {
  generateAmbassadorNotificationUrl,
  validatePhoneNumber,
  generateDeviceFingerprint,
} from "../services/whatsapp.js";

const router = express.Router();

/**
 * POST /api/affiliate/track
 * Track affiliate code usage and prepare ambassador notification
 *
 * Request body:
 * {
 *   user_name: string (required),
 *   user_phone: string (required),
 *   user_email?: string,
 *   user_city?: string,
 *   affiliate_code: string (required),
 *   program_id?: number,
 *   program_name?: string,
 *   discount_applied?: number,
 *   urgency?: 'urgent' | 'this_month' | 'browsing'
 * }
 */
router.post("/track", async (req, res) => {
  try {
    console.log("\n🔍 Affiliate tracking request:", req.body);

    const {
      user_name,
      user_phone,
      user_email,
      user_city,
      affiliate_code,
      program_id,
      program_name,
      discount_applied,
      urgency = "browsing",
    } = req.body;

    // Validate required fields
    if (!user_name || !user_phone || !affiliate_code) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_name, user_phone, affiliate_code",
      });
    }

    // Validate phone number format
    if (!validatePhoneNumber(user_phone)) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number format. Use 08xxx or 628xxx format.",
      });
    }

    // Get ambassador info from affiliate code
    const [ambassadors] = await db.query(
      "SELECT id, name, phone, affiliate_code FROM ambassadors WHERE affiliate_code = ? AND is_active = 1",
      [affiliate_code]
    );

    if (ambassadors.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Affiliate code '${affiliate_code}' not found or inactive`,
      });
    }

    const ambassador = ambassadors[0];

    // Check if this phone already used ANY affiliate code today (prevent spam)
    const today = new Date().toISOString().split("T")[0];
    const [existingUsage] = await db.query(
      "SELECT id, affiliate_code, user_name FROM affiliate_usage WHERE user_phone = ? AND DATE(first_used_at) = ?",
      [user_phone, today]
    );

    if (existingUsage.length > 0) {
      const existing = existingUsage[0];

      // If same code, allow (user can apply same code to multiple programs)
      if (existing.affiliate_code === affiliate_code) {
        return res.json({
          success: true,
          already_tracked: true,
          message:
            "You already used this code today. Discount still applies to all programs!",
          notification_sent: false,
        });
      }

      // Different code - prevent spam
      return res.status(429).json({
        success: false,
        error: `Nomor ini sudah menggunakan kode ${existing.affiliate_code} hari ini. Anda hanya bisa menggunakan 1 kode affiliate per hari.`,
        existing_code: existing.affiliate_code,
      });
    }

    // Generate device fingerprint for additional spam prevention
    const deviceFingerprint = generateDeviceFingerprint(req);

    console.log("📝 Inserting affiliate usage record...");
    console.log("📝 Ambassador ID:", ambassador.id);
    console.log("📝 Ambassador Name:", ambassador.name);
    console.log("📝 Affiliate Code:", affiliate_code);

    // Insert affiliate usage record
    const [result] = await db.query(
      `INSERT INTO affiliate_usage 
       (user_name, user_phone, user_email, user_city, affiliate_code, ambassador_id, 
        program_id, program_name, discount_applied, urgency, device_fingerprint, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'promo_hub')`,
      [
        user_name,
        user_phone,
        user_email || null,
        user_city || null,
        affiliate_code,
        ambassador.id,
        program_id || null,
        program_name || "General Interest",
        discount_applied || null,
        urgency,
        deviceFingerprint,
      ]
    );

    const usageId = result.insertId;

    console.log(
      `✅ Affiliate usage tracked: ID ${usageId}, User: ${user_name}, Code: ${affiliate_code}, Ambassador ID: ${ambassador.id}`
    );
    console.log(
      `✅ This should now appear in admin dashboard for ambassador: ${ambassador.name}`
    );

    // Generate WhatsApp Click-to-Chat URL for ambassador notification
    const whatsappUrl = generateAmbassadorNotificationUrl(
      ambassador.phone,
      { user_name, user_phone, user_email, user_city },
      affiliate_code,
      { program_name, discount_applied }
    );

    // Update notification status
    await db.query(
      "UPDATE affiliate_usage SET notified_to_ambassador = TRUE, notified_at = NOW(), notification_method = 'click_to_chat' WHERE id = ?",
      [usageId]
    );

    // Return success with WhatsApp URL
    res.json({
      success: true,
      usage_id: usageId,
      ambassador: {
        name: ambassador.name,
        phone: ambassador.phone,
      },
      whatsapp_url: whatsappUrl,
      notification_method: "click_to_chat",
      message:
        "Affiliate code tracked successfully! Click the WhatsApp link to notify ambassador.",
    });
  } catch (error) {
    console.error("❌ Error tracking affiliate usage:", error);
    res.status(500).json({
      success: false,
      error: "Failed to track affiliate usage",
      details: error.message,
    });
  }
});

/**
 * GET /api/affiliate/stats/:ambassador_id
 * Get affiliate usage statistics for an ambassador
 */
router.get("/stats/:ambassador_id", async (req, res) => {
  try {
    const { ambassador_id } = req.params;

    // Get total usage count
    const [totalCount] = await db.query(
      "SELECT COUNT(*) as total FROM affiliate_usage WHERE ambassador_id = ?",
      [ambassador_id]
    );

    // Get today's count
    const today = new Date().toISOString().split("T")[0];
    const [todayCount] = await db.query(
      "SELECT COUNT(*) as today FROM affiliate_usage WHERE ambassador_id = ? AND DATE(first_used_at) = ?",
      [ambassador_id, today]
    );

    // Get pending follow-ups
    const [pendingCount] = await db.query(
      "SELECT COUNT(*) as pending FROM affiliate_usage WHERE ambassador_id = ? AND follow_up_status = 'pending'",
      [ambassador_id]
    );

    // Get conversions
    const [conversions] = await db.query(
      "SELECT COUNT(*) as converted FROM affiliate_usage WHERE ambassador_id = ? AND registered = TRUE",
      [ambassador_id]
    );

    res.json({
      success: true,
      stats: {
        total_uses: totalCount[0].total,
        today_uses: todayCount[0].today,
        pending_followups: pendingCount[0].pending,
        conversions: conversions[0].converted,
        conversion_rate:
          totalCount[0].total > 0
            ? ((conversions[0].converted / totalCount[0].total) * 100).toFixed(
                2
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("❌ Error getting affiliate stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get affiliate statistics",
    });
  }
});

/**
 * GET /api/affiliate/unread-counts
 * Get unread usage counts for all ambassadors (new leads since last viewed)
 */
router.get("/unread-counts", async (req, res) => {
  try {
    // Get all ambassadors with their last_viewed_at timestamp
    const [ambassadors] = await db.query(
      "SELECT id, last_viewed_at FROM ambassadors WHERE is_active = 1"
    );

    const unreadCounts = {};

    // For each ambassador, count usages created after last_viewed_at
    for (const ambassador of ambassadors) {
      const { id, last_viewed_at } = ambassador;

      let query;
      let params;

      if (last_viewed_at) {
        // Count only leads created after last view
        query = `
          SELECT COUNT(*) as unread 
          FROM affiliate_usage 
          WHERE ambassador_id = ? 
          AND first_used_at > ?
        `;
        params = [id, last_viewed_at];
      } else {
        // Never viewed before - count all leads
        query = `
          SELECT COUNT(*) as unread 
          FROM affiliate_usage 
          WHERE ambassador_id = ?
        `;
        params = [id];
      }

      const [result] = await db.query(query, params);
      const unreadCount = result[0].unread;
      unreadCounts[id] = unreadCount;

      console.log(
        `📊 Ambassador ID ${id}: ${unreadCount} unread leads (last_viewed: ${
          last_viewed_at || "never"
        })`
      );
    }

    console.log("✅ Final unread counts:", unreadCounts);
    res.json({
      success: true,
      unread_counts: unreadCounts,
    });
  } catch (error) {
    console.error("❌ Error getting unread counts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get unread counts",
    });
  }
});

/**
 * PUT /api/affiliate/mark-viewed/:ambassador_id
 * Mark ambassador as viewed (update last_viewed_at to current timestamp)
 */
router.put("/mark-viewed/:ambassador_id", async (req, res) => {
  try {
    const { ambassador_id } = req.params;

    await db.query(
      "UPDATE ambassadors SET last_viewed_at = NOW() WHERE id = ?",
      [ambassador_id]
    );

    res.json({
      success: true,
      message: "Ambassador marked as viewed",
      ambassador_id: parseInt(ambassador_id),
      viewed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error marking ambassador as viewed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark ambassador as viewed",
    });
  }
});

/**
 * GET /api/affiliate/leads/:ambassador_id
 * Get active leads for an ambassador
 */
router.get("/leads/:ambassador_id", async (req, res) => {
  try {
    const { ambassador_id } = req.params;

    const [leads] = await db.query(
      `SELECT 
        au.id, au.user_name, au.user_phone, au.user_email, au.user_city,
        au.affiliate_code, au.program_name, au.discount_applied, au.urgency,
        au.first_used_at, au.follow_up_status, au.follow_up_notes,
        DATEDIFF(NOW(), au.first_used_at) as days_ago,
        amb.name as ambassador_name, amb.phone as ambassador_phone
       FROM affiliate_usage au
       LEFT JOIN ambassadors amb ON au.ambassador_id = amb.id
       WHERE au.ambassador_id = ? AND au.follow_up_status IN ('pending', 'contacted')
       ORDER BY au.first_used_at DESC
       LIMIT 50`,
      [ambassador_id]
    );

    res.json({
      success: true,
      leads: leads,
      count: leads.length,
    });
  } catch (error) {
    console.error("❌ Error getting affiliate leads:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get affiliate leads",
    });
  }
});

/**
 * PATCH /api/affiliate/update-status/:usage_id
 * Update follow-up status for a tracked usage
 */
router.patch("/update-status/:usage_id", async (req, res) => {
  try {
    const { usage_id } = req.params;
    const { follow_up_status, follow_up_notes, registered } = req.body;

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

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    values.push(usage_id);

    await db.query(
      `UPDATE affiliate_usage SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: "Affiliate usage status updated",
    });
  } catch (error) {
    console.error("❌ Error updating affiliate status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update status",
    });
  }
});

/**
 * DELETE /api/affiliate/lead/:usage_id
 * Delete a tracked affiliate usage (for admin to remove duplicate/spam entries)
 * This allows users to use their phone number again after admin removes their data
 */
router.delete("/lead/:usage_id", async (req, res) => {
  try {
    const { usage_id } = req.params;

    // Delete the affiliate usage record
    const [result] = await db.query(
      "DELETE FROM affiliate_usage WHERE id = ?",
      [usage_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Affiliate usage record not found",
      });
    }

    res.json({
      success: true,
      message: "Affiliate usage deleted successfully",
      deleted_id: parseInt(usage_id),
    });
  } catch (error) {
    console.error("❌ Error deleting affiliate usage:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete affiliate usage",
    });
  }
});

export default router;
