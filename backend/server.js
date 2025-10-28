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
app.use("/api/ambassadors", ambassadorsRoutes);
app.use("/api/programs", programsRoutes);
app.use("/api/promos", promosRoutes);
app.use("/api/validate", validateRoutes);
app.use("/api/upload", uploadRoutes);

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
app.listen(PORT, () => {
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
  console.log("   POST   /api/validate/affiliate-code");
  console.log("   POST   /api/upload");
  console.log("   POST   /api/upload/multiple");
  console.log("   ========================================");
  console.log("");
});

export default app;
