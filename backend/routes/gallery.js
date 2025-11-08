import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db from "../db/connection.js";

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/gallery");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// GET /api/gallery - Get all gallery items (optionally filtered by category)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query = "SELECT * FROM gallery";
    const params = [];

    if (category && ["Kids", "Teens", "Intensive"].includes(category)) {
      query += " WHERE category = ?";
      params.push(category);
    }

    query += " ORDER BY order_index ASC, created_at DESC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    res.status(500).json({ error: "Failed to fetch gallery items" });
  }
});

// GET /api/gallery/:id - Get single gallery item
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM gallery WHERE id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Gallery item not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching gallery item:", error);
    res.status(500).json({ error: "Failed to fetch gallery item" });
  }
});

// POST /api/gallery - Create new gallery item with image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, category, description, order_index } = req.body;

    // Validation
    if (!title || !category) {
      return res.status(400).json({ error: "Title and category are required" });
    }

    if (!["Kids", "Teens", "Intensive"].includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Store relative path from uploads directory
    const imageUrl = `/uploads/gallery/${req.file.filename}`;

    const [result] = await db.query(
      "INSERT INTO gallery (title, image_url, category, description, order_index) VALUES (?, ?, ?, ?, ?)",
      [title, imageUrl, category, description || null, order_index || 0]
    );

    const [newItem] = await db.query("SELECT * FROM gallery WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      success: true,
      message: "Gallery item created successfully",
      data: newItem[0],
    });
  } catch (error) {
    console.error("Error creating gallery item:", error);
    // Delete uploaded file if database insert fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to create gallery item" });
  }
});

// PUT /api/gallery/:id - Update gallery item
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, category, description, order_index } = req.body;

    // Check if item exists
    const [existing] = await db.query("SELECT * FROM gallery WHERE id = ?", [
      req.params.id,
    ]);

    if (existing.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Clean up uploaded file
      }
      return res.status(404).json({ error: "Gallery item not found" });
    }

    // Validation
    if (category && !["Kids", "Teens", "Intensive"].includes(category)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: "Invalid category" });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title);
    }
    if (category !== undefined) {
      updates.push("category = ?");
      values.push(category);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (order_index !== undefined) {
      updates.push("order_index = ?");
      values.push(order_index);
    }

    // If new image uploaded, update image_url and delete old image
    if (req.file) {
      const imageUrl = `/uploads/gallery/${req.file.filename}`;
      updates.push("image_url = ?");
      values.push(imageUrl);

      // Delete old image file
      const oldImagePath = path.join(__dirname, "..", existing[0].image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(req.params.id);

    await db.query(
      `UPDATE gallery SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const [updated] = await db.query("SELECT * FROM gallery WHERE id = ?", [
      req.params.id,
    ]);

    res.json({
      success: true,
      message: "Gallery item updated successfully",
      data: updated[0],
    });
  } catch (error) {
    console.error("Error updating gallery item:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to update gallery item" });
  }
});

// DELETE /api/gallery/:id - Delete gallery item
router.delete("/:id", async (req, res) => {
  try {
    // Get item to find image path
    const [existing] = await db.query("SELECT * FROM gallery WHERE id = ?", [
      req.params.id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({ error: "Gallery item not found" });
    }

    // Delete from database
    await db.query("DELETE FROM gallery WHERE id = ?", [req.params.id]);

    // Delete image file
    const imagePath = path.join(__dirname, "..", existing[0].image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({
      success: true,
      message: "Gallery item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    res.status(500).json({ error: "Failed to delete gallery item" });
  }
});

export default router;
