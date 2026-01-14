// Affiliate Tracking Routes
// Purpose: Track affiliate code usage and notify ambassadors

import express from "express";
import db from "../db/connection.js";
import { authenticateToken } from "./auth.js";
import {
  generateAmbassadorNotificationUrl,
  validatePhoneNumber,
  generateDeviceFingerprint,
} from "../services/whatsapp.js";

const router = express.Router();

// =====================================================
// RATE LIMITING FOR AFFILIATE TRACKING
// Prevents spam submissions (5 requests per minute per IP)
// =====================================================
const affiliateTrackAttempts = new Map(); // IP -> { count, firstAttempt }
const AFFILIATE_TRACK_MAX_ATTEMPTS = 5; // 5 submissions per minute
const AFFILIATE_TRACK_WINDOW = 60 * 1000; // 1 minute window

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of affiliateTrackAttempts.entries()) {
    if (now - data.firstAttempt > AFFILIATE_TRACK_WINDOW) {
      affiliateTrackAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Rate limiter middleware for affiliate tracking
const affiliateTrackRateLimiter = (req, res, next) => {
  const clientIp =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const now = Date.now();

  const attempts = affiliateTrackAttempts.get(clientIp);

  if (attempts) {
    const timeSinceFirst = now - attempts.firstAttempt;

    // Reset window if expired
    if (timeSinceFirst > AFFILIATE_TRACK_WINDOW) {
      affiliateTrackAttempts.set(clientIp, { count: 1, firstAttempt: now });
      return next();
    }

    // Check if over limit
    if (attempts.count >= AFFILIATE_TRACK_MAX_ATTEMPTS) {
      const remainingSeconds = Math.ceil(
        (AFFILIATE_TRACK_WINDOW - timeSinceFirst) / 1000
      );
      return res.status(429).json({
        success: false,
        error: `Terlalu banyak permintaan. Coba lagi dalam ${remainingSeconds} detik.`,
        retryAfter: remainingSeconds,
      });
    }

    // Increment count
    attempts.count++;
  } else {
    affiliateTrackAttempts.set(clientIp, { count: 1, firstAttempt: now });
  }

  next();
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin privileges required.",
    });
  }
  next();
};

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
router.post("/track", affiliateTrackRateLimiter, async (req, res) => {
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
router.get(
  "/stats/:ambassador_id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
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

      // Get follow ups (contacted status)
      const [followUpCount] = await db.query(
        "SELECT COUNT(*) as followup FROM affiliate_usage WHERE ambassador_id = ? AND follow_up_status = 'contacted'",
        [ambassador_id]
      );

      // Get conversions
      const [conversions] = await db.query(
        "SELECT COUNT(*) as converted FROM affiliate_usage WHERE ambassador_id = ? AND follow_up_status = 'converted' AND deleted_at IS NULL",
        [ambassador_id]
      );

      // Get lost leads
      const [lostCount] = await db.query(
        "SELECT COUNT(*) as lost FROM affiliate_usage WHERE ambassador_id = ? AND follow_up_status = 'lost' AND deleted_at IS NULL",
        [ambassador_id]
      );

      res.json({
        success: true,
        stats: {
          total_uses: totalCount[0].total,
          today_uses: todayCount[0].today,
          pending_followups: pendingCount[0].pending,
          followups: followUpCount[0].followup,
          conversions: conversions[0].converted,
          lost: lostCount[0].lost,
        },
      });
    } catch (error) {
      console.error("❌ Error getting affiliate stats:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get affiliate statistics",
      });
    }
  }
);

/**
 * GET /api/affiliate/unread-counts
 * Get unread usage counts for all ambassadors (new leads since last viewed)
 */
router.get(
  "/unread-counts",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
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
  }
);

/**
 * PUT /api/affiliate/mark-viewed/:ambassador_id
 * Mark ambassador as viewed (update last_viewed_at to current timestamp)
 */
router.put(
  "/mark-viewed/:ambassador_id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
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
  }
);

/**
 * GET /api/affiliate/leads/:ambassador_id
 * Get active leads for an ambassador (excluding deleted and lost)
 */
router.get(
  "/leads/:ambassador_id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { ambassador_id } = req.params;

      const [leads] = await db.query(
        `SELECT 
        au.id, au.user_name, au.user_phone, au.user_email, au.user_city,
        au.affiliate_code, au.program_name, au.discount_applied, au.urgency,
        au.first_used_at, au.follow_up_status, au.follow_up_notes,
        au.registered,
        DATEDIFF(NOW(), au.first_used_at) as days_ago,
        amb.name as ambassador_name, amb.phone as ambassador_phone,
        p.branch, p.type as promo_category, p.program as program_package,
        p.start_date, p.end_date
       FROM affiliate_usage au
       LEFT JOIN ambassadors amb ON au.ambassador_id = amb.id
       LEFT JOIN programs p ON au.program_id = p.id
       WHERE au.ambassador_id = ? 
         AND au.deleted_at IS NULL
         AND au.follow_up_status IN ('pending', 'contacted', 'converted')
       ORDER BY 
         CASE au.follow_up_status
           WHEN 'pending' THEN 1
           WHEN 'contacted' THEN 2
           WHEN 'converted' THEN 3
           ELSE 4
         END,
         au.first_used_at DESC
       LIMIT 100`,
        [ambassador_id]
      );

      res.json({
        success: true,
        leads: leads,
        count: leads.length,
      });
    } catch (error) {
      console.error("❌ Error getting affiliate leads:", error);
      res.json({
        success: false,
        error: "Failed to get affiliate leads",
      });
    }
  }
);

/**
 * GET /api/affiliate/lost-leads/:ambassador_id
 * Get all lost leads for an ambassador
 */
router.get(
  "/lost-leads/:ambassador_id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { ambassador_id } = req.params;

      const [leads] = await db.query(
        `SELECT 
        au.id, au.user_name, au.user_phone, au.user_email, au.user_city,
        au.affiliate_code, au.program_name, au.discount_applied, au.urgency,
        au.first_used_at, au.follow_up_status, au.follow_up_notes,
        au.registered,
        DATEDIFF(NOW(), au.first_used_at) as days_ago,
        amb.name as ambassador_name, amb.phone as ambassador_phone,
        p.branch, p.type as promo_category, p.program as program_package,
        p.start_date, p.end_date
      FROM affiliate_usage au
      LEFT JOIN ambassadors amb ON au.ambassador_id = amb.id
      LEFT JOIN programs p ON au.program_id = p.id
      WHERE au.ambassador_id = ? 
        AND au.deleted_at IS NULL 
        AND au.follow_up_status = 'lost'
      ORDER BY au.first_used_at DESC`,
        [ambassador_id]
      );

      res.json({
        success: true,
        leads: leads,
        count: leads.length,
      });
    } catch (error) {
      console.error("Error getting lost leads:", error);
      res.json({
        success: false,
        error: "Failed to get lost leads",
      });
    }
  }
);

/**
 * GET /api/affiliate/deleted-leads/:ambassador_id
 * Get all deleted leads for an ambassador (soft deleted, showing history)
 */
router.get(
  "/deleted-leads/:ambassador_id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { ambassador_id } = req.params;

      const [leads] = await db.query(
        `SELECT 
        au.id,
        au.user_name,
        au.user_phone,
        au.user_email,
        au.affiliate_code,
        au.program_name,
        au.discount_applied,
        au.follow_up_status,
        au.follow_up_notes,
        au.registered,
        au.deleted_at,
        au.deleted_by,
        DATEDIFF(NOW(), au.deleted_at) as days_deleted,
        amb.name as ambassador_name,
        amb.phone as ambassador_phone
      FROM affiliate_usage au
      LEFT JOIN ambassadors amb ON au.ambassador_id = amb.id
      WHERE au.ambassador_id = ? 
        AND au.deleted_at IS NOT NULL
      ORDER BY au.deleted_at DESC`,
        [ambassador_id]
      );

      res.json({
        success: true,
        leads: leads,
        count: leads.length,
      });
    } catch (error) {
      console.error("Error getting deleted leads:", error);
      res.json({
        success: false,
        error: "Failed to get deleted leads",
      });
    }
  }
);

/**
 * PATCH /api/affiliate/update-status/:usage_id
 * Update follow-up status for a tracked usage
 */
router.patch(
  "/update-status/:usage_id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
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
  }
);

/**
 * DELETE /api/affiliate/lead/:usage_id
 * Soft delete a tracked affiliate usage (marks as deleted instead of removing)
 * This keeps a 3-day history of deleted records before they're purged permanently
 */
router.delete(
  "/lead/:usage_id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { usage_id } = req.params;
      const { deleted_by } = req.body; // Optional: track who deleted it

      // Soft delete by setting deleted_at timestamp
      const [result] = await db.query(
        "UPDATE affiliate_usage SET deleted_at = NOW(), deleted_by = ? WHERE id = ? AND deleted_at IS NULL",
        [deleted_by || "admin", usage_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: "Affiliate usage record not found or already deleted",
        });
      }

      res.json({
        success: true,
        message:
          "Affiliate usage deleted successfully (soft delete - will be purged after 3 days)",
        deleted_id: parseInt(usage_id),
      });
    } catch (error) {
      console.error("❌ Error deleting affiliate usage:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete affiliate usage",
      });
    }
  }
);

/**
 * PUT /api/affiliate/restore/:usage_id
 * Restore a soft-deleted lead (undo soft delete)
 */
router.put(
  "/restore/:usage_id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { usage_id } = req.params;

      // Restore by setting deleted_at and deleted_by to NULL
      const [result] = await db.query(
        "UPDATE affiliate_usage SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL",
        [usage_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: "Record not found or not deleted",
        });
      }

      res.json({
        success: true,
        message: "Lead restored successfully",
        restored_id: parseInt(usage_id),
      });
    } catch (error) {
      console.error("❌ Error restoring lead:", error);
      res.status(500).json({
        success: false,
        error: "Failed to restore lead",
      });
    }
  }
);

/**
 * DELETE /api/affiliate/permanent-delete/:usage_id
 * PERMANENTLY delete a lead from database (only works on soft-deleted records)
 * ⚠️ WARNING: This action CANNOT be undone! Record will be permanently removed.
 *
 * Security: Only allows deletion of records that are already soft-deleted (deleted_at IS NOT NULL)
 */
router.delete(
  "/permanent-delete/:usage_id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { usage_id } = req.params;

      // First, check if record exists and is soft-deleted
      const [existing] = await db.query(
        "SELECT id, user_name, deleted_at FROM affiliate_usage WHERE id = ?",
        [usage_id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Record not found",
        });
      }

      // Security check: Only allow permanent delete if already soft-deleted
      if (!existing[0].deleted_at) {
        return res.status(400).json({
          success: false,
          error:
            "Cannot permanently delete active records. Please soft-delete first.",
        });
      }

      // Perform PERMANENT deletion
      const [result] = await db.query(
        "DELETE FROM affiliate_usage WHERE id = ? AND deleted_at IS NOT NULL",
        [usage_id]
      );

      if (result.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          error: "Failed to permanently delete record",
        });
      }

      console.log(
        `🗑️ PERMANENT DELETE: Lead ID ${usage_id} (${existing[0].user_name}) permanently removed from database`
      );

      res.json({
        success: true,
        message: "Record permanently deleted from database",
        deleted_id: parseInt(usage_id),
        deleted_user: existing[0].user_name,
      });
    } catch (error) {
      console.error("❌ Error permanently deleting lead:", error);
      res.status(500).json({
        success: false,
        error: "Failed to permanently delete lead",
        details: error.message,
      });
    }
  }
);

export default router;
