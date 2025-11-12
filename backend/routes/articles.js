/**
 * ZONA ENGLISH - ARTICLES API ROUTES
 * Complete CRUD operations + Engagement tracking
 * Created: October 31, 2025
 */

import express from "express";
import db from "../db/connection.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// MULTER CONFIGURATION FOR IMAGE UPLOADS
// =====================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/articles");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "article-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Get user identifier (IP address or session)
function getUserIdentifier(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

// =====================================================
// PUBLIC ROUTES (No authentication required)
// =====================================================

/**
 * GET /api/articles/public
 * Get all published articles for public view
 */
router.get("/public", async (req, res) => {
  try {
    const { category, hashtag, featured, limit = 10, offset = 0 } = req.query;

    let query = `
      SELECT 
        a.*,
        GROUP_CONCAT(DISTINCT ah.hashtag) as hashtags,
        COUNT(DISTINCT ai.id) as image_count,
        COUNT(DISTINCT CASE WHEN al.reaction_type = 'like' THEN al.id END) as likes_count,
        COUNT(DISTINCT CASE WHEN al.reaction_type = 'love' THEN al.id END) as loves_count,
        COUNT(DISTINCT CASE WHEN ac.status = 'Approved' THEN ac.id END) as comments_count
      FROM articles a
      LEFT JOIN article_hashtags ah ON a.id = ah.article_id
      LEFT JOIN article_images ai ON a.id = ai.article_id
      LEFT JOIN article_likes al ON a.id = al.article_id
      LEFT JOIN article_comments ac ON a.id = ac.article_id
      WHERE a.status = 'Published' 
      AND a.deleted_at IS NULL
      AND (a.published_at IS NULL OR a.published_at <= NOW())
    `;

    const params = [];

    if (category) {
      query += " AND a.category = ?";
      params.push(category);
    }

    if (hashtag) {
      query +=
        " AND a.id IN (SELECT article_id FROM article_hashtags WHERE hashtag = ?)";
      params.push(hashtag);
    }

    // Note: 'featured' column doesn't exist in current schema
    // if (featured === "true") {
    //   query += " AND a.featured = TRUE";
    // }

    query += " GROUP BY a.id ORDER BY a.published_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [articles] = await db.query(query, params);

    // Convert hashtags string to array
    const formattedArticles = articles.map((article) => ({
      ...article,
      hashtags: article.hashtags ? article.hashtags.split(",") : [],
    }));

    res.json({
      success: true,
      data: formattedArticles,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: articles.length,
      },
    });
  } catch (error) {
    console.error("Error fetching public articles:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });
    res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Server error",
    });
  }
});

/**
 * GET /api/articles/public/:slug
 * Get single article by slug (public view)
 */
router.get("/public/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    console.log("Fetching article with slug:", slug);

    const [articles] = await db.query(
      `
      SELECT 
        a.*,
        GROUP_CONCAT(DISTINCT ah.hashtag) as hashtags,
        COUNT(DISTINCT CASE WHEN al.reaction_type = 'like' THEN al.id END) as likes_count,
        COUNT(DISTINCT CASE WHEN al.reaction_type = 'love' THEN al.id END) as loves_count
      FROM articles a
      LEFT JOIN article_hashtags ah ON a.id = ah.article_id
      LEFT JOIN article_likes al ON a.id = al.article_id
      WHERE a.slug = ? 
      AND a.status = 'Published'
      AND a.deleted_at IS NULL
      GROUP BY a.id
    `,
      [slug]
    );

    console.log("Found articles:", articles.length);

    if (articles.length === 0) {
      console.log("Article not found for slug:", slug);
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    const article = articles[0];

    // Get article images
    const [images] = await db.query(
      `SELECT id, article_id, image_url, caption, display_order, created_at 
       FROM article_images WHERE article_id = ? ORDER BY display_order`,
      [article.id]
    );

    // Get approved comments
    const [comments] = await db.query(
      `
      SELECT id, user_name, comment, created_at
      FROM article_comments
      WHERE article_id = ? AND status = 'Approved'
      ORDER BY created_at DESC
    `,
      [article.id]
    );

    res.json({
      success: true,
      data: {
        ...article,
        hashtags: article.hashtags ? article.hashtags.split(",") : [],
        images,
        approved_comments: comments, // Match frontend interface
      },
    });
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });
    res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Server error",
    });
  }
});

/**
 * POST /api/articles/:id/view
 * Track article view
 */
router.post("/:id/view", async (req, res) => {
  try {
    const { id } = req.params;
    const userIdentifier = getUserIdentifier(req);
    const userAgent = req.headers["user-agent"] || "unknown";

    // Check if user already viewed this article today
    const [existingViews] = await db.query(
      `
      SELECT id FROM article_views 
      WHERE article_id = ? 
      AND user_identifier = ? 
      AND DATE(viewed_at) = CURDATE()
    `,
      [id, userIdentifier]
    );

    // Only count unique views per day per user
    if (existingViews.length === 0) {
      await db.query(
        "INSERT INTO article_views (article_id, user_identifier, user_agent, viewed_at) VALUES (?, ?, ?, CURDATE())",
        [id, userIdentifier, userAgent]
      );
    }

    res.json({ success: true, message: "View tracked" });
  } catch (error) {
    console.error("Error tracking view:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });
    res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Server error",
    });
  }
});

/**
 * POST /api/articles/:id/like
 * Toggle like/love on article
 */
router.post("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { reactionType = "like" } = req.body; // 'like' or 'love'
    const userIdentifier = getUserIdentifier(req);

    // Check if user already liked/loved
    const [existing] = await db.query(
      "SELECT id, reaction_type FROM article_likes WHERE article_id = ? AND user_identifier = ?",
      [id, userIdentifier]
    );

    let action;
    if (existing.length > 0) {
      // User already reacted
      if (existing[0].reaction_type === reactionType) {
        // Same reaction - remove it (toggle off)
        await db.query("DELETE FROM article_likes WHERE id = ?", [
          existing[0].id,
        ]);
        action = "removed";
      } else {
        // Different reaction - update it
        await db.query(
          "UPDATE article_likes SET reaction_type = ? WHERE id = ?",
          [reactionType, existing[0].id]
        );
        action = "updated";
      }
    } else {
      // New reaction
      await db.query(
        "INSERT INTO article_likes (article_id, user_identifier, reaction_type) VALUES (?, ?, ?)",
        [id, userIdentifier, reactionType]
      );
      action = "added";
    }

    // Get updated counts and user reaction
    const [likeCounts] = await db.query(
      "SELECT COUNT(*) as count FROM article_likes WHERE article_id = ? AND reaction_type = 'like'",
      [id]
    );
    const [loveCounts] = await db.query(
      "SELECT COUNT(*) as count FROM article_likes WHERE article_id = ? AND reaction_type = 'love'",
      [id]
    );
    const [userReaction] = await db.query(
      "SELECT reaction_type FROM article_likes WHERE article_id = ? AND user_identifier = ?",
      [id, userIdentifier]
    );

    res.json({
      success: true,
      message:
        action === "removed"
          ? "Reaction removed"
          : action === "updated"
          ? "Reaction updated"
          : "Reaction added",
      action,
      likes_count: likeCounts[0].count,
      loves_count: loveCounts[0].count,
      user_reaction:
        userReaction.length > 0 ? userReaction[0].reaction_type : null,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });
    res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Server error",
    });
  }
});

/**
 * POST /api/articles/:id/comment
 * Add comment to article
 */
router.post("/:id/comment", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, user_email, comment } = req.body;
    const userIdentifier = getUserIdentifier(req);

    if (!user_name || !comment) {
      return res.status(400).json({
        success: false,
        message: "Name and comment are required",
      });
    }

    // Insert comment with 'Pending' status
    const [result] = await db.query(
      `
      INSERT INTO article_comments (article_id, user_name, user_email, comment, status, ip_address, user_agent)
      VALUES (?, ?, ?, ?, 'Pending', ?, ?)
    `,
      [
        id,
        user_name,
        user_email || null,
        comment,
        req.ip || req.connection.remoteAddress,
        req.headers["user-agent"] || "unknown",
      ]
    );

    res.json({
      success: true,
      message:
        "Comment submitted successfully. It will be visible after approval.",
      commentId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });
    res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Server error",
    });
  }
});

/**
 * GET /api/articles/:id/user-reaction
 * Check if user has liked/loved this article
 */
router.get("/:id/user-reaction", async (req, res) => {
  try {
    const { id } = req.params;
    const userIdentifier = getUserIdentifier(req);

    const [reactions] = await db.query(
      "SELECT reaction_type FROM article_likes WHERE article_id = ? AND user_identifier = ?",
      [id, userIdentifier]
    );

    res.json({
      success: true,
      data: {
        hasReaction: reactions.length > 0,
        reactionType: reactions.length > 0 ? reactions[0].reaction_type : null,
      },
    });
  } catch (error) {
    console.error("Error checking reaction:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================================================
// ADMIN ROUTES (Authentication should be added in production)
// =====================================================

/**
 * GET /api/articles/admin/all
 * Get all articles (admin view - includes drafts, archived, etc.)
 */
router.get("/admin/all", async (req, res) => {
  try {
    const [articles] = await db.query(
      `
      SELECT 
        a.*,
        GROUP_CONCAT(DISTINCT ah.hashtag) as hashtags,
        COUNT(DISTINCT ai.id) as image_count,
        COUNT(DISTINCT CASE WHEN al.reaction_type = 'like' THEN al.id END) as likes_count,
        COUNT(DISTINCT CASE WHEN al.reaction_type = 'love' THEN al.id END) as loves_count,
        COUNT(DISTINCT CASE WHEN ac.status = 'Approved' THEN ac.id END) as comments_count
      FROM articles a
      LEFT JOIN article_hashtags ah ON a.id = ah.article_id
      LEFT JOIN article_images ai ON a.id = ai.article_id
      LEFT JOIN article_likes al ON a.id = al.article_id
      LEFT JOIN article_comments ac ON a.id = ac.article_id
      WHERE a.deleted_at IS NULL
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `
    );

    const formattedArticles = articles.map((article) => ({
      ...article,
      hashtags: article.hashtags ? article.hashtags.split(",") : [],
    }));

    res.json({ success: true, data: formattedArticles });
  } catch (error) {
    console.error("Error fetching admin articles:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/articles/admin/comments
 * Get all comments (admin view)
 */
router.get("/admin/comments", async (req, res) => {
  try {
    const { status, articleId } = req.query;

    let query = `
      SELECT 
        c.*,
        a.title as article_title,
        a.slug as article_slug
      FROM article_comments c
      JOIN articles a ON c.article_id = a.id
      WHERE c.status != 'Deleted'
    `;

    const params = [];

    if (status) {
      query += " AND c.status = ?";
      params.push(status);
    }

    if (articleId) {
      query += " AND c.article_id = ?";
      params.push(articleId);
    }

    query += " ORDER BY c.created_at DESC";

    const [comments] = await db.query(query, params);

    res.json({ success: true, data: comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PUT /api/articles/admin/comments/:id/approve
 * Approve comment
 */
router.put("/admin/comments/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE article_comments SET status = 'Approved' WHERE id = ?",
      [id]
    );

    res.json({ success: true, message: "Comment approved" });
  } catch (error) {
    console.error("Error approving comment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * DELETE /api/articles/admin/comments/:id
 * Delete comment
 */
router.delete("/admin/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE article_comments SET status = 'Deleted' WHERE id = ?",
      [id]
    );

    res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/articles/admin/:id
 * Get single article (admin view)
 */
router.get("/admin/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [articles] = await db.query(
      `
      SELECT 
        a.*,
        GROUP_CONCAT(DISTINCT ah.hashtag) as hashtags
      FROM articles a
      LEFT JOIN article_hashtags ah ON a.id = ah.article_id
      WHERE a.id = ? AND a.deleted_at IS NULL
      GROUP BY a.id
    `,
      [id]
    );

    if (articles.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    const article = articles[0];

    // Get images
    const [images] = await db.query(
      `SELECT id, article_id, image_url, caption, display_order, created_at 
       FROM article_images WHERE article_id = ? ORDER BY display_order`,
      [article.id]
    );

    res.json({
      success: true,
      data: {
        ...article,
        hashtags: article.hashtags ? article.hashtags.split(",") : [],
        images,
      },
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/articles
 * Create new article
 */
router.post("/", upload.single("featuredImage"), async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      title,
      excerpt,
      content,
      author = "Admin",
      category,
      status = "Draft",
      seo_title,
      seo_description,
      published_at,
      hashtags, // JSON string array
    } = req.body;

    // Generate slug
    let slug = generateSlug(title);

    // Check if slug exists and generate unique slug
    const [existingSlugs] = await connection.query(
      "SELECT slug FROM articles WHERE slug LIKE ?",
      [`${slug}%`]
    );

    if (existingSlugs.length > 0) {
      // Find the highest number suffix
      const slugNumbers = existingSlugs
        .map((row) => {
          const match = row.slug.match(new RegExp(`^${slug}-(\\d+)$`));
          return match ? parseInt(match[1]) : 0;
        })
        .filter((num) => num > 0);

      const maxNumber = slugNumbers.length > 0 ? Math.max(...slugNumbers) : 0;

      // Check if base slug exists
      const baseSlugExists = existingSlugs.some((row) => row.slug === slug);

      if (baseSlugExists) {
        slug = `${slug}-${maxNumber + 1}`;
        console.log(
          `Slug already exists, using: ${slug} (original: ${generateSlug(
            title
          )})`
        );
      }
    }

    // Handle featured image
    const featuredImage = req.file
      ? `/uploads/articles/${req.file.filename}`
      : null;

    // Insert article
    const [result] = await connection.query(
      `
      INSERT INTO articles (
        title, slug, excerpt, content, author, category, status,
        seo_title, seo_description, featured_image, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        title,
        slug,
        excerpt,
        content,
        author,
        category,
        status,
        seo_title || title,
        seo_description || excerpt,
        featuredImage,
        status === "Published" ? published_at || new Date() : null,
      ]
    );

    const articleId = result.insertId;

    // Insert hashtags
    if (hashtags) {
      const hashtagArray = JSON.parse(hashtags);
      for (const tag of hashtagArray) {
        await connection.query(
          "INSERT INTO article_hashtags (article_id, hashtag) VALUES (?, ?)",
          [articleId, tag.toLowerCase().trim()]
        );
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Article created successfully",
      data: { id: articleId, slug },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating article:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });

    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Server error",
    });
  } finally {
    connection.release();
  }
});

/**
 * PUT /api/articles/:id
 * Update article
 */
router.put("/:id", upload.single("featuredImage"), async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      title,
      excerpt,
      content,
      author,
      category,
      status,
      seo_title,
      seo_description,
      published_at,
      hashtags,
    } = req.body;

    // Get existing article
    const [existing] = await connection.query(
      `SELECT id, slug, title, featured_image, status 
       FROM articles WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    const oldArticle = existing[0];

    // Generate new slug if title changed
    const slug = title ? generateSlug(title) : oldArticle.slug;

    // Handle featured image
    let featuredImage = oldArticle.featured_image;

    if (req.file) {
      // Delete old image if exists
      if (featuredImage) {
        const imagePath = path.join(__dirname, "..", featuredImage);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      featuredImage = `/uploads/articles/${req.file.filename}`;
    }

    // Update article
    await connection.query(
      `
      UPDATE articles SET
        title = COALESCE(?, title),
        slug = ?,
        excerpt = COALESCE(?, excerpt),
        content = COALESCE(?, content),
        author = COALESCE(?, author),
        category = COALESCE(?, category),
        status = COALESCE(?, status),
        seo_title = COALESCE(?, seo_title),
        seo_description = COALESCE(?, seo_description),
        featured_image = ?,
        published_at = CASE 
          WHEN ? = 'Published' AND published_at IS NULL THEN COALESCE(?, NOW())
          ELSE published_at
        END
      WHERE id = ?
    `,
      [
        title,
        slug,
        excerpt,
        content,
        author,
        category,
        status,
        seo_title,
        seo_description,
        featuredImage,
        status,
        published_at,
        id,
      ]
    );

    // Update hashtags
    if (hashtags) {
      await connection.query(
        "DELETE FROM article_hashtags WHERE article_id = ?",
        [id]
      );

      const hashtagArray = JSON.parse(hashtags);
      for (const tag of hashtagArray) {
        await connection.query(
          "INSERT INTO article_hashtags (article_id, hashtag) VALUES (?, ?)",
          [id, tag.toLowerCase().trim()]
        );
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Article updated successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating article:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });

    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Server error",
    });
  } finally {
    connection.release();
  }
});

/**
 * DELETE /api/articles/:id
 * Soft delete article
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE articles SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
      [id]
    );

    res.json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/articles/:id/upload-images
 * Upload additional article images
 */
router.post(
  "/:id/upload-images",
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { captions } = req.body; // JSON array of captions

      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No files uploaded" });
      }

      const captionsArray = captions ? JSON.parse(captions) : [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/articles/${file.filename}`;
        const caption = captionsArray[i] || null;

        await db.query(
          "INSERT INTO article_images (article_id, image_url, caption, display_order) VALUES (?, ?, ?, ?)",
          [id, imageUrl, caption, i]
        );
      }

      res.json({
        success: true,
        message: "Images uploaded successfully",
        count: req.files.length,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/**
 * GET /api/articles/categories
 * Get all categories with article count
 */
router.get("/categories", async (req, res) => {
  try {
    const [categories] = await db.query(
      `
      SELECT 
        category,
        COUNT(*) as count
      FROM articles
      WHERE status = 'Published' AND deleted_at IS NULL
      GROUP BY category
      ORDER BY count DESC
    `
    );

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/articles/hashtags
 * Get popular hashtags
 */
router.get("/hashtags", async (req, res) => {
  try {
    const [hashtags] = await db.query(
      `
      SELECT 
        ah.hashtag,
        COUNT(*) as count
      FROM article_hashtags ah
      JOIN articles a ON ah.article_id = a.id
      WHERE a.status = 'Published' AND a.deleted_at IS NULL
      GROUP BY ah.hashtag
      ORDER BY count DESC
      LIMIT 20
    `
    );

    res.json({ success: true, data: hashtags });
  } catch (error) {
    console.error("Error fetching hashtags:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
