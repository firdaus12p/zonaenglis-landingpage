// Database connection configuration
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Database pool - supports both DB_PASS and DB_PASSWORD for flexibility
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "zona_english_admin",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ MySQL Database connected successfully");
    console.log(`📊 Database: ${process.env.DB_NAME || "zona_english_admin"}`);
    console.log(`🔌 Host: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`);
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

export default pool;
