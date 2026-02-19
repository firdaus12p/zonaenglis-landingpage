// Express.js Backend API for Zona English
// Production-ready, aman, dan terkontrol (Nginx + PM2)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

// ====== LOGGER ======
import logger, { createLogger } from "./utils/logger.js";
import { requestLogger } from "./middleware/logger.js";

const serverLogger = createLogger("SERVER");

// ====== ENV ======
dotenv.config();

// ====== AUTO MIGRATION ======
import runAutoMigration from "./db/auto-migrate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || "development";

// ====== WAJIB: karena pakai Nginx reverse proxy ======
app.set("trust proxy", 1);

// ====== ENV VALIDATION (WAJIB di production) ======
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];

if (NODE_ENV === "production") {
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    serverLogger.error("Missing required environment variables", {
      missingVars,
    });
    missingVars.forEach((v) => serverLogger.error(`   - ${v}`));
    process.exit(1);
  }
}

// ====== CORS ======
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin(origin, callback) {
      // allow no-origin (Postman, curl, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed from this origin"));
    },
    credentials: true,
  })
);

// ====== SECURITY HEADERS (Helmet) ======
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow images/uploads cross-origin
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://www.youtube.com",
          "https://www.google.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: [
          "'self'",
          "https://zonaenglish.com",
          "https://www.googleapis.com",
        ],
        frameSrc: ["'self'", "https://www.youtube.com", "https://youtube.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: NODE_ENV === "production" ? [] : null,
      },
    },
  })
);

// ====== GLOBAL RATE LIMITER ======
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 300, // 300 request / IP / 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak request, silakan coba lagi nanti.",
  },
});

app.use(globalLimiter);

// ====== Middleware ======
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads with security headers
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year cache
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// ====== REQUEST LOGGING ======
app.use(requestLogger);

// ====== Import routes ======
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import ambassadorsRoutes from "./routes/ambassadors.js";
import programsRoutes from "./routes/programs.js";
import promosRoutes from "./routes/promos.js";
import validateRoutes from "./routes/validate.js";
import affiliateRoutes from "./routes/affiliate.js";
import promoClaimsRoutes from "./routes/promo-claims.js";
import uploadRoutes from "./routes/upload.js";
import countdownRoutes from "./routes/countdown.js";
import articlesRoutes from "./routes/articles.js";
import settingsRoutes from "./routes/settings.js";
import galleryRoutes from "./routes/gallery.js";
import { rateLimiterStatsMiddleware } from "./utils/rate-limiter-monitor.js";
import { authenticateToken } from "./routes/auth.js";
import { formTokenEndpoint } from "./middleware/public-form-protection.js";

// ====== Health Check ======
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    environment: NODE_ENV,
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// ====== Dynamic Sitemap (Core Pages + Articles) ======
app.get("/api/sitemap.xml", async (req, res) => {
  try {
    const db = (await import("./db/connection.js")).default;
    const [articles] = await db.query(
      `SELECT slug, updated_at FROM articles WHERE status = 'published' AND deleted_at IS NULL ORDER BY published_at DESC`
    );

    const baseUrl = "https://zonaenglish.com";
    const today = new Date().toISOString().split("T")[0];

    // Core pages with their SEO properties
    const corePages = [
      { path: "/", changefreq: "weekly", priority: "1.0" },
      { path: "/promo-center", changefreq: "daily", priority: "0.9" },
      { path: "/promo-hub", changefreq: "daily", priority: "0.9" },
      { path: "/articles", changefreq: "daily", priority: "0.8" },
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add core pages
    corePages.forEach((page) => {
      sitemap += `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Add article URLs
    articles.forEach((article) => {
      const lastmod = article.updated_at
        ? new Date(article.updated_at).toISOString().split("T")[0]
        : today;
      sitemap += `  <url>
    <loc>${baseUrl}/articles/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600"); // Cache 1 hour
    res.send(sitemap);
  } catch (error) {
    serverLogger.error("Error generating sitemap", { error: error.message });
    res.status(500).send("Error generating sitemap");
  }
});

// ====== Public Form Token Endpoint ======
app.get("/api/form-token", formTokenEndpoint);

// ====== Rate Limiter Stats (Admin Only) ======
app.get(
  "/api/admin/rate-limiter-stats",
  authenticateToken,
  rateLimiterStatsMiddleware
);

// ====== API Docs (aman di production) ======
app.get("/api/docs", (req, res) => {
  res.json({
    auth: [
      "POST /api/auth/login",
      "GET /api/auth/verify",
      "POST /api/auth/logout",
    ],
    users: "/api/users",
    ambassadors: "/api/ambassadors",
    programs: "/api/programs",
    promos: "/api/promos",
    validate: "/api/validate",
    affiliate: "/api/affiliate",
    upload: "/api/upload",
    articles: "/api/articles",
    settings: "/api/settings",
    gallery: "/api/gallery",
  });
});

// ====== API Routes ======
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/ambassadors", ambassadorsRoutes);
app.use("/api/programs", programsRoutes);
app.use("/api/promos", promosRoutes);
app.use("/api/validate", validateRoutes);
app.use("/api/affiliate", affiliateRoutes);
app.use("/api/promo-claims", promoClaimsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/countdown", countdownRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/gallery", galleryRoutes);

// ====== 404 Handler ======
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint tidak ditemukan",
    path: req.path,
    method: req.method,
  });
});

// ====== Error Handler ======
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({
    error: "Terjadi kesalahan pada server",
    ...(NODE_ENV !== "production" && { detail: err.message }),
  });
});

// ====== START SERVER (AMAN) ======
// Run auto-migration before starting server
const startServer = async () => {
  try {
    // Run auto-migration (creates missing tables)
    await runAutoMigration();

    // Start HTTP server
    const server = app.listen(PORT, "127.0.0.1", () => {
      console.log("");
      console.log("🚀 Zona English Backend API");
      console.log(`🌍 Environment : ${NODE_ENV}`);
      console.log(`📡 Port        : ${PORT} (localhost only)`);
      console.log(`🔐 CORS        : ${allowedOrigins.join(", ")}`);
      serverLogger.info("Backend aktif via Nginx reverse proxy");
      serverLogger.info("");
    });

    // Graceful Shutdown (PM2 / VPS Safe)
    const shutdown = (signal) => {
      serverLogger.warn(`${signal} received. Shutting down gracefully...`);

      server.close(() => {
        serverLogger.info("HTTP server closed");
        process.exit(0);
      });

      setTimeout(() => {
        serverLogger.error("Force shutdown after 10s");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    serverLogger.error("Failed to start server", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();

export default app;
