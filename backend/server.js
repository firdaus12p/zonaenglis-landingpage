// Express.js Backend API for Zona English Landing Page
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import ambassadorsRoutes from "./routes/ambassadors.js";
import promosRoutes from "./routes/promos.js";
import programsRoutes from "./routes/programs.js";
import validateRoutes from "./routes/validate.js";
import uploadRoutes from "./routes/upload.js";
import affiliateRoutes from "./routes/affiliate.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import countdownRoutes from "./routes/countdown.js";
import articlesRoutes from "./routes/articles.js";
import settingsRoutes from "./routes/settings.js";
import galleryRoutes from "./routes/gallery.js";

// Import database connection for cleanup tasks
import db from "./db/connection.js";

// Auto-purge function: Delete records that have been soft-deleted for 3+ days
async function purgeOldDeletedRecords() {
  try {
    // Purge affiliate_usage (existing functionality)
    const [affiliateResult] = await db.query(
      `DELETE FROM affiliate_usage 
       WHERE deleted_at IS NOT NULL 
       AND DATEDIFF(NOW(), deleted_at) >= 3`
    );

    if (affiliateResult.affectedRows > 0) {
      console.log(
        `🗑️  Auto-purge: Permanently deleted ${affiliateResult.affectedRows} affiliate records (>3 days old)`
      );
    }

    // Purge promo_usage with used_count decrement
    // Get records to be purged first (to decrement counters)
    const [promoRecords] = await db.query(
      `SELECT id, promo_code_id FROM promo_usage
       WHERE deleted_at IS NOT NULL 
       AND DATEDIFF(NOW(), deleted_at) >= 3`
    );

    if (promoRecords.length > 0) {
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Delete the records
        await connection.query(
          `DELETE FROM promo_usage 
           WHERE deleted_at IS NOT NULL 
           AND DATEDIFF(NOW(), deleted_at) >= 3`
        );

        // Decrement used_count for each affected promo code
        const promoIds = [...new Set(promoRecords.map((r) => r.promo_code_id))];
        for (const promoId of promoIds) {
          const countToDecrement = promoRecords.filter(
            (r) => r.promo_code_id === promoId
          ).length;
          await connection.query(
            `UPDATE promo_codes 
             SET used_count = GREATEST(used_count - ?, 0) 
             WHERE id = ?`,
            [countToDecrement, promoId]
          );
        }

        await connection.commit();
        connection.release();

        console.log(
          `🗑️  Auto-purge: Permanently deleted ${promoRecords.length} promo usage records (>3 days old) and decremented counters`
        );
      } catch (transactionError) {
        await connection.rollback();
        connection.release();
        throw transactionError;
      }
    }
  } catch (error) {
    console.error("❌ Auto-purge error:", error.message);
  }
}

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Parse CORS_ORIGIN - support comma-separated origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Zona English Backend API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      ambassadors: "/api/ambassadors",
      programs: "/api/programs",
      promos: "/api/promos",
      validate: "/api/validate",
      affiliate: "/api/affiliate",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: "zona_english_admin",
    port: PORT,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/ambassadors", ambassadorsRoutes);
app.use("/api/programs", programsRoutes);
app.use("/api/promos", promosRoutes);
app.use("/api/validate", validateRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/affiliate", affiliateRoutes);
app.use("/api/countdown", countdownRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/gallery", galleryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, async () => {
  console.log("");
  console.log("🚀 ========================================");
  console.log("   Zona English Backend API Server");
  console.log("   ========================================");
  console.log(`   📡 Server running on: http://localhost:${PORT}`);
  console.log(`   🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   🔌 CORS enabled for: ${allowedOrigins.join(", ")}`);
  console.log("   ========================================");
  console.log("");
  console.log("   Available Endpoints:");
  console.log("   GET    /api/health");
  console.log("   POST   /api/auth/login");
  console.log("   GET    /api/auth/verify");
  console.log("   POST   /api/auth/logout");
  console.log("   GET    /api/ambassadors");
  console.log("   GET    /api/ambassadors/:id");
  console.log("   GET    /api/ambassadors/code/:affiliateCode");
  console.log("   POST   /api/ambassadors");
  console.log("   PUT    /api/ambassadors/:id");
  console.log("   DELETE /api/ambassadors/:id");
  console.log("   GET    /api/programs");
  console.log("   GET    /api/programs/:id");
  console.log("   POST   /api/programs");
  console.log("   PUT    /api/programs/:id");
  console.log("   DELETE /api/programs/:id");
  console.log("   GET    /api/promos");
  console.log("   GET    /api/promos/:code");
  console.log("   POST   /api/promos/validate");
  console.log("   POST   /api/promos/use");
  console.log("   POST   /api/validate/code");
  console.log("   POST   /api/validate/affiliate-code");
  console.log("   POST   /api/affiliate/track");
  console.log("   GET    /api/affiliate/stats/:ambassador_id");
  console.log("   GET    /api/affiliate/leads/:ambassador_id");
  console.log("   GET    /api/affiliate/lost-leads/:ambassador_id");
  console.log("   GET    /api/affiliate/deleted-leads/:ambassador_id");
  console.log("   PATCH  /api/affiliate/update-status/:usage_id");
  console.log("   DELETE /api/affiliate/lead/:usage_id (soft delete)");
  console.log("   PUT    /api/affiliate/restore/:usage_id (restore deleted)");
  console.log("   POST   /api/upload");
  console.log("   POST   /api/upload/multiple");
  console.log("   ========================================");
  console.log("");

  // TEMPORARILY DISABLED: Run auto-purge on startup
  // console.log("🔄 Running initial auto-purge of old deleted records...");
  // await purgeOldDeletedRecords();

  // TEMPORARILY DISABLED: Schedule daily auto-purge at midnight
  // const PURGE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  // setInterval(purgeOldDeletedRecords, PURGE_INTERVAL);
  console.log("⏰ Auto-purge temporarily disabled for testing");
  console.log("");
});

export default app;
