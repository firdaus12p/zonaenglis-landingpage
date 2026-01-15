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
      success: false,
      message: "Akses ditolak. Hanya admin yang dapat mengakses fitur ini",
    });
  }
  next();
};

/**
 * @route   GET /api/countdown
 * @desc    Get all countdown batches
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const [batches] = await db.query(
      `SELECT 
        id, name, start_date, start_time, end_date, end_time, timezone, description,
        instructor, location_mode, location_address, price, registration_deadline,
        target_students, current_students, status, visibility,
        created_at, updated_at
      FROM countdown_batches
      ORDER BY start_date ASC, start_time ASC`
    );

    res.json({
      success: true,
      data: batches,
      count: batches.length,
    });
  } catch (error) {
    console.error("Error fetching countdown batches:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch countdown batches",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/countdown/stats
 * @desc    Get countdown batches statistics
 * @access  Public
 */
router.get("/stats", async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_batches,
        SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as draft_batches,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_batches,
        SUM(CASE WHEN status = 'Upcoming' THEN 1 ELSE 0 END) as upcoming_batches,
        SUM(CASE WHEN status = 'Paused' THEN 1 ELSE 0 END) as paused_batches,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_batches,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_batches,
        SUM(current_students) as total_students,
        SUM(target_students) as total_target_students
      FROM countdown_batches
    `);

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error("Error fetching countdown stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch countdown statistics",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/countdown/active
 * @desc    Get active countdown batch
 * @access  Public
 */
router.get("/active", async (req, res) => {
  try {
    const [batches] = await db.query(
      `SELECT 
        id, name, start_date, start_time, end_date, end_time, timezone, description,
        instructor, location_mode, location_address, price, registration_deadline,
        target_students, current_students, status, visibility,
        created_at, updated_at
      FROM countdown_batches
      WHERE status = 'Active'
      ORDER BY start_date ASC, start_time ASC
      LIMIT 1`
    );

    if (batches.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: "No active batch found",
      });
    }

    res.json({
      success: true,
      data: batches[0],
    });
  } catch (error) {
    console.error("Error fetching active batch:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active batch",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/countdown/:id
 * @desc    Get countdown batch by ID
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [batches] = await db.query(
      `SELECT 
        id, name, start_date, start_time, end_date, end_time, timezone, description,
        instructor, location_mode, location_address, price, registration_deadline,
        target_students, current_students, status, visibility,
        created_at, updated_at
      FROM countdown_batches
      WHERE id = ?`,
      [id]
    );

    if (batches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Countdown batch not found",
      });
    }

    res.json({
      success: true,
      data: batches[0],
    });
  } catch (error) {
    console.error("Error fetching countdown batch:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch countdown batch",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/countdown
 * @desc    Create new countdown batch
 * @access  Admin (PROTECTED)
 */
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      startDate,
      startTime,
      endDate,
      endTime,
      timezone = "WITA",
      description,
      instructor,
      locationMode = "Online",
      locationAddress,
      price = 0,
      registrationDeadline,
      targetStudents = 0,
      currentStudents = 0,
      status = "Upcoming",
      visibility = "Public",
    } = req.body;

    // Validation
    if (!name || !startDate || !startTime) {
      return res.status(400).json({
        success: false,
        message: "Name, start date, and start time are required",
      });
    }

    // Validate status
    const validStatuses = [
      "Draft",
      "Active",
      "Upcoming",
      "Paused",
      "Completed",
      "Cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Validate visibility
    const validVisibilities = ["Public", "Private"];
    if (!validVisibilities.includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: `Invalid visibility. Must be one of: ${validVisibilities.join(
          ", "
        )}`,
      });
    }

    // Validate location mode
    const validLocationModes = ["Online", "Offline", "Hybrid"];
    if (!validLocationModes.includes(locationMode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid location mode. Must be one of: ${validLocationModes.join(
          ", "
        )}`,
      });
    }

    const [result] = await db.query(
      `INSERT INTO countdown_batches 
        (name, start_date, start_time, end_date, end_time, timezone, description,
         instructor, location_mode, location_address, price, registration_deadline,
         target_students, current_students, status, visibility)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        startDate,
        startTime,
        endDate || null,
        endTime || null,
        timezone,
        description,
        instructor || null,
        locationMode,
        locationAddress || null,
        price,
        registrationDeadline || null,
        targetStudents,
        currentStudents,
        status,
        visibility,
      ]
    );

    // Fetch the created batch
    const [createdBatch] = await db.query(
      `SELECT 
        id, name, start_date, start_time, end_date, end_time, timezone, description,
        instructor, location_mode, location_address, price, registration_deadline,
        target_students, current_students, status, visibility,
        created_at, updated_at
      FROM countdown_batches
      WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Countdown batch created successfully",
      data: createdBatch[0],
    });
  } catch (error) {
    console.error("Error creating countdown batch:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create countdown batch",
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/countdown/:id
 * @desc    Update countdown batch
 * @access  Admin (PROTECTED)
 */
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      startDate,
      startTime,
      endDate,
      endTime,
      timezone,
      description,
      instructor,
      locationMode,
      locationAddress,
      price,
      registrationDeadline,
      targetStudents,
      currentStudents,
      status,
      visibility,
    } = req.body;

    // Check if batch exists
    const [existing] = await db.query(
      "SELECT id FROM countdown_batches WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Countdown batch not found",
      });
    }

    // Validate status if provided
    if (status) {
      const validStatuses = [
        "Draft",
        "Active",
        "Upcoming",
        "Paused",
        "Completed",
        "Cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(
            ", "
          )}`,
        });
      }
    }

    // Validate visibility if provided
    if (visibility) {
      const validVisibilities = ["Public", "Private"];
      if (!validVisibilities.includes(visibility)) {
        return res.status(400).json({
          success: false,
          message: `Invalid visibility. Must be one of: ${validVisibilities.join(
            ", "
          )}`,
        });
      }
    }

    // Validate location mode if provided
    if (locationMode) {
      const validLocationModes = ["Online", "Offline", "Hybrid"];
      if (!validLocationModes.includes(locationMode)) {
        return res.status(400).json({
          success: false,
          message: `Invalid location mode. Must be one of: ${validLocationModes.join(
            ", "
          )}`,
        });
      }
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (startDate !== undefined) {
      updates.push("start_date = ?");
      values.push(startDate);
    }
    if (startTime !== undefined) {
      updates.push("start_time = ?");
      values.push(startTime);
    }
    if (endDate !== undefined) {
      updates.push("end_date = ?");
      values.push(endDate);
    }
    if (endTime !== undefined) {
      updates.push("end_time = ?");
      values.push(endTime);
    }
    if (timezone !== undefined) {
      updates.push("timezone = ?");
      values.push(timezone);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (instructor !== undefined) {
      updates.push("instructor = ?");
      values.push(instructor);
    }
    if (locationMode !== undefined) {
      updates.push("location_mode = ?");
      values.push(locationMode);
    }
    if (locationAddress !== undefined) {
      updates.push("location_address = ?");
      values.push(locationAddress);
    }
    if (price !== undefined) {
      updates.push("price = ?");
      values.push(price);
    }
    if (registrationDeadline !== undefined) {
      updates.push("registration_deadline = ?");
      values.push(registrationDeadline);
    }
    if (targetStudents !== undefined) {
      updates.push("target_students = ?");
      values.push(targetStudents);
    }
    if (currentStudents !== undefined) {
      updates.push("current_students = ?");
      values.push(currentStudents);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }
    if (visibility !== undefined) {
      updates.push("visibility = ?");
      values.push(visibility);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    values.push(id);

    await db.query(
      `UPDATE countdown_batches SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    // Fetch updated batch
    const [updatedBatch] = await db.query(
      `SELECT 
        id, name, start_date, start_time, end_date, end_time, timezone, description,
        instructor, location_mode, location_address, price, registration_deadline,
        target_students, current_students, status, visibility,
        created_at, updated_at
      FROM countdown_batches
      WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: "Countdown batch updated successfully",
      data: updatedBatch[0],
    });
  } catch (error) {
    console.error("Error updating countdown batch:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update countdown batch",
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/countdown/:id/toggle-status
 * @desc    Toggle batch status between Active and Paused
 * @access  Admin (PROTECTED)
 */
router.put(
  "/:id/toggle-status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get current status
      const [batches] = await db.query(
        "SELECT status FROM countdown_batches WHERE id = ?",
        [id]
      );

      if (batches.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Countdown batch not found",
        });
      }

      const currentStatus = batches[0].status;
      const newStatus = currentStatus === "Active" ? "Paused" : "Active";

      // Update status
      await db.query("UPDATE countdown_batches SET status = ? WHERE id = ?", [
        newStatus,
        id,
      ]);

      // Fetch updated batch
      const [updatedBatch] = await db.query(
        `SELECT 
        id, name, start_date, start_time, end_date, end_time, timezone, description,
        instructor, location_mode, location_address, price, registration_deadline,
        target_students, current_students, status, visibility,
        created_at, updated_at
      FROM countdown_batches
      WHERE id = ?`,
        [id]
      );

      res.json({
        success: true,
        message: `Batch status changed from ${currentStatus} to ${newStatus}`,
        data: updatedBatch[0],
      });
    } catch (error) {
      console.error("Error toggling batch status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle batch status",
        error: error.message,
      });
    }
  }
);

/**
 * @route   PUT /api/countdown/:id/students
 * @desc    Update student count (increment/decrement)
 * @access  Admin (PROTECTED)
 */
router.put(
  "/:id/students",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { action, count = 1 } = req.body;

      if (!action || !["increment", "decrement", "set"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Action must be 'increment', 'decrement', or 'set'",
        });
      }

      // Check if batch exists
      const [existing] = await db.query(
        "SELECT current_students FROM countdown_batches WHERE id = ?",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Countdown batch not found",
        });
      }

      let newCount;
      if (action === "increment") {
        newCount = existing[0].current_students + count;
      } else if (action === "decrement") {
        newCount = Math.max(0, existing[0].current_students - count);
      } else {
        newCount = count;
      }

      await db.query(
        "UPDATE countdown_batches SET current_students = ? WHERE id = ?",
        [newCount, id]
      );

      // Fetch updated batch
      const [updatedBatch] = await db.query(
        `SELECT 
        id, name, start_date, start_time, end_date, end_time, timezone, description,
        instructor, location_mode, location_address, price, registration_deadline,
        target_students, current_students, status, visibility,
        created_at, updated_at
      FROM countdown_batches
      WHERE id = ?`,
        [id]
      );

      res.json({
        success: true,
        message: `Student count updated successfully`,
        data: updatedBatch[0],
      });
    } catch (error) {
      console.error("Error updating student count:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update student count",
        error: error.message,
      });
    }
  }
);

/**
 * @route   DELETE /api/countdown/:id
 * @desc    Delete countdown batch
 * @access  Admin (PROTECTED)
 */
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if batch exists
    const [existing] = await db.query(
      "SELECT name FROM countdown_batches WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Countdown batch not found",
      });
    }

    await db.query("DELETE FROM countdown_batches WHERE id = ?", [id]);

    res.json({
      success: true,
      message: `Countdown batch "${existing[0].name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting countdown batch:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete countdown batch",
      error: error.message,
    });
  }
});

export default router;
