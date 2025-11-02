// Program Promo Routes (for PromoHub)
import express from "express";
import db from "../db/connection.js";

const router = express.Router();

// GET /api/programs - Get all active programs
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, branch, type, program, start_date, end_date, quota, price, perks, image_url, wa_link, is_active, created_at 
       FROM promos 
       WHERE is_active = 1 
       ORDER BY start_date DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

// GET /api/programs/:id - Get single program
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, branch, type, program, start_date, end_date, quota, price, perks, image_url, 
              wa_link, is_active, created_at, updated_at 
       FROM promos WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Program not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching program:", error);
    res.status(500).json({ error: "Failed to fetch program" });
  }
});

// POST /api/programs - Create new program
router.post("/", async (req, res) => {
  const {
    title,
    branch,
    type,
    program,
    start_date,
    end_date,
    quota,
    price,
    perks,
    image_url,
    wa_link,
  } = req.body;

  // Validation
  if (
    !title ||
    !branch ||
    !type ||
    !program ||
    !start_date ||
    !end_date ||
    !price
  ) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO promos 
      (title, branch, type, program, start_date, end_date, quota, price, perks, image_url, wa_link, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        title,
        branch,
        type,
        program,
        start_date,
        end_date,
        quota || 100,
        price,
        JSON.stringify(perks || []),
        image_url || null,
        wa_link || null,
      ]
    );

    res.status(201).json({
      message: "Program created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating program:", error);
    res.status(500).json({ error: "Failed to create program" });
  }
});

// PUT /api/programs/:id - Update program
router.put("/:id", async (req, res) => {
  const {
    title,
    branch,
    type,
    program,
    start_date,
    end_date,
    quota,
    price,
    perks,
    image_url,
    wa_link,
    is_active,
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE promos 
       SET title = ?, branch = ?, type = ?, program = ?, start_date = ?, end_date = ?, 
           quota = ?, price = ?, perks = ?, image_url = ?, wa_link = ?, is_active = ?
       WHERE id = ?`,
      [
        title,
        branch,
        type,
        program,
        start_date,
        end_date,
        quota,
        price,
        JSON.stringify(perks || []),
        image_url,
        wa_link,
        is_active,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Program not found" });
    }

    res.json({ message: "Program updated successfully" });
  } catch (error) {
    console.error("Error updating program:", error);
    res.status(500).json({ error: "Failed to update program" });
  }
});

// DELETE /api/programs/:id - Soft delete program
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE promos SET is_active = 0 WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Program not found" });
    }

    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({ error: "Failed to delete program" });
  }
});

export default router;
