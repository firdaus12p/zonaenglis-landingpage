// Express.js Backend API for Zona English
// Production-ready, aman, dan terkontrol (Nginx + PM2)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

// ====== ENV ======
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || "development";

// ====== WAJIB: karena pakai Nginx reverse proxy ======
app.set("trust proxy", 1);

// ====== ENV VALIDATION (WAJIB di production) ======
const requiredEnvVars = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

if (NODE_ENV === "production") {
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    missingVars.forEach((v) => console.error(`   - ${v}`));
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
    crossOriginResourcePolicy: false, // allow images/uploads
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

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logging ringan (hindari noisy log di production)
if (NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

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

// ====== Health Check ======
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    environment: NODE_ENV,
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

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
const server = app.listen(PORT, "127.0.0.1", () => {
  console.log("");
  console.log("🚀 Zona English Backend API");
  console.log(`🌍 Environment : ${NODE_ENV}`);
  console.log(`📡 Port        : ${PORT} (localhost only)`);
  console.log(`🔐 CORS        : ${allowedOrigins.join(", ")}`);
  console.log("✅ Backend aktif via Nginx reverse proxy");
  console.log("");
});

export default app;

// ====== Graceful Shutdown (PM2 / VPS Safe) ======
const shutdown = (signal) => {
  console.log(`🛑 ${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("⏰ Force shutdown after 10s");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
