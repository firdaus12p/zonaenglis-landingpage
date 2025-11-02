// Settings Routes - Admin Configuration Management
import express from "express";
import db from "../db/connection.js";

const router = express.Router();

/**
 * GET /api/settings
 * Get all settings or filter by category
 */
router.get("/", async (req, res) => {
  try {
    const { category, public_only } = req.query;

    let query =
      "SELECT id, setting_key, setting_value, setting_type, category, label, description, is_public, updated_at FROM settings";
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }

    if (public_only === "true") {
      conditions.push("is_public = TRUE");
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY category, setting_key";

    const [settings] = await db.query(query, params);

    // Group by category for easier frontend consumption
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.json({
      success: true,
      data: settings,
      grouped: grouped,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch settings",
    });
  }
});

/**
 * GET /api/settings/:key
 * Get single setting by key
 */
router.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const [settings] = await db.query(
      "SELECT id, setting_key, setting_value, setting_type, category, label, description, created_at, updated_at FROM settings WHERE setting_key = ?",
      [key]
    );

    if (settings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

    res.json({
      success: true,
      data: settings[0],
    });
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch setting",
    });
  }
});

/**
 * PUT /api/settings/:key
 * Update single setting value
 */
router.put("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    // Validation
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: "Setting value is required",
      });
    }

    // Check if setting exists
    const [existing] = await db.query(
      "SELECT id, setting_key, setting_value, setting_type, category, label FROM settings WHERE setting_key = ?",
      [key]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

    const setting = existing[0];

    // Type validation
    let validatedValue = value;
    if (setting.setting_type === "number") {
      validatedValue = String(Number(value));
      if (isNaN(Number(value))) {
        return res.status(400).json({
          success: false,
          message: "Value must be a number",
        });
      }
    } else if (setting.setting_type === "boolean") {
      const boolValue = String(value).toLowerCase();
      if (!["true", "false", "1", "0"].includes(boolValue)) {
        return res.status(400).json({
          success: false,
          message: "Value must be a boolean (true/false)",
        });
      }
      validatedValue =
        boolValue === "true" || boolValue === "1" ? "true" : "false";
    }

    // Update setting
    await db.query(
      "UPDATE settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?",
      [validatedValue, key]
    );

    // Fetch updated setting
    const [updated] = await db.query(
      "SELECT id, setting_key, setting_value, setting_type, category, label, description FROM settings WHERE setting_key = ?",
      [key]
    );

    res.json({
      success: true,
      message: "Setting updated successfully",
      data: updated[0],
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update setting",
    });
  }
});

/**
 * PUT /api/settings/bulk
 * Update multiple settings at once
 */
router.put("/", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        message: "Settings array is required",
      });
    }

    await connection.beginTransaction();

    const updatedSettings = [];

    for (const item of settings) {
      const { key, value } = item;

      if (!key || value === undefined) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Each setting must have key and value",
        });
      }

      // Check if setting exists and get type
      const [existing] = await connection.query(
        "SELECT id, setting_key, setting_value, setting_type FROM settings WHERE setting_key = ?",
        [key]
      );

      if (existing.length === 0) {
        continue; // Skip non-existent settings
      }

      const setting = existing[0];
      let validatedValue = value;

      // Type validation
      if (setting.setting_type === "number") {
        validatedValue = String(Number(value));
        if (isNaN(Number(value))) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: `Invalid number value for ${key}`,
          });
        }
      } else if (setting.setting_type === "boolean") {
        const boolValue = String(value).toLowerCase();
        if (!["true", "false", "1", "0"].includes(boolValue)) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: `Invalid boolean value for ${key}`,
          });
        }
        validatedValue =
          boolValue === "true" || boolValue === "1" ? "true" : "false";
      }

      // Update
      await connection.query(
        "UPDATE settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?",
        [validatedValue, key]
      );

      updatedSettings.push({ key, value: validatedValue });
    }

    await connection.commit();

    res.json({
      success: true,
      message: `${updatedSettings.length} settings updated successfully`,
      data: updatedSettings,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error bulk updating settings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update settings",
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/settings/public
 * Get only public settings (for frontend use)
 */
router.get("/public/all", async (req, res) => {
  try {
    const [settings] = await db.query(
      "SELECT setting_key, setting_value, setting_type FROM settings WHERE is_public = TRUE"
    );

    // Convert to key-value object for easy consumption
    const settingsObject = settings.reduce((acc, setting) => {
      let value = setting.setting_value;

      // Parse value based on type
      if (setting.setting_type === "number") {
        value = Number(value);
      } else if (setting.setting_type === "boolean") {
        value = value === "true" || value === "1";
      } else if (setting.setting_type === "json") {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if parse fails
        }
      }

      acc[setting.setting_key] = value;
      return acc;
    }, {});

    res.json({
      success: true,
      data: settingsObject,
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch public settings",
    });
  }
});

export default router;
