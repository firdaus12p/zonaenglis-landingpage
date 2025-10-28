import mysql from "mysql2/promise";

async function createPromosTable() {
  const pool = mysql.createPool({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "",
    database: "zona_english_admin",
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        branch VARCHAR(50) NOT NULL,
        type VARCHAR(100) NOT NULL,
        program VARCHAR(100) NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        quota INT NOT NULL DEFAULT 100,
        price DECIMAL(12,2) NOT NULL,
        perks JSON,
        image_url TEXT,
        wa_link TEXT,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_branch (branch),
        INDEX idx_active (is_active),
        INDEX idx_dates (start_date, end_date)
      )
    `);

    console.log("✅ Table promos created successfully");
  } catch (error) {
    console.error("❌ Error creating table:", error.message);
  } finally {
    await pool.end();
  }
}

createPromosTable();
