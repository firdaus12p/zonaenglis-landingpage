import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "",
  database: "zona_english_admin",
});

console.log("🔧 Creating article_views table...\n");

try {
  await db.query(`
    CREATE TABLE IF NOT EXISTS article_views (
      id INT PRIMARY KEY AUTO_INCREMENT,
      article_id INT NOT NULL,
      user_identifier VARCHAR(100) NOT NULL,
      user_agent VARCHAR(255),
      viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_article_id (article_id),
      INDEX idx_user_identifier (user_identifier),
      INDEX idx_viewed_at (viewed_at),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  console.log("✅ article_views table created successfully\n");

  // Verify
  const [columns] = await db.query("SHOW COLUMNS FROM article_views");
  console.log("📋 Columns:", columns.map((c) => c.Field).join(", "));
} catch (error) {
  console.error("❌ Error:", error.message);
} finally {
  await db.end();
}
