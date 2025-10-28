import db from "./db/connection.js";

console.log("🔄 Creating affiliate_usage table directly...\n");

const createTableSQL = `
CREATE TABLE IF NOT EXISTS affiliate_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_name VARCHAR(100) NOT NULL,
  user_phone VARCHAR(20) NOT NULL,
  user_email VARCHAR(100) DEFAULT NULL,
  user_city VARCHAR(50) DEFAULT NULL,
  affiliate_code VARCHAR(20) NOT NULL,
  ambassador_id INT NOT NULL,
  program_id INT DEFAULT NULL,
  program_name VARCHAR(100) DEFAULT NULL,
  discount_applied DECIMAL(10,2) DEFAULT NULL,
  urgency ENUM('urgent', 'this_month', 'browsing') DEFAULT 'browsing',
  source VARCHAR(50) DEFAULT 'promo_hub',
  first_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  notified_to_ambassador BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMP NULL DEFAULT NULL,
  notification_method VARCHAR(50) DEFAULT 'click_to_chat',
  follow_up_status ENUM('pending', 'contacted', 'converted', 'lost') DEFAULT 'pending',
  follow_up_notes TEXT DEFAULT NULL,
  registered BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMP NULL DEFAULT NULL,
  device_fingerprint VARCHAR(255) DEFAULT NULL,
  INDEX idx_phone (user_phone),
  INDEX idx_ambassador_date (ambassador_id, first_used_at),
  INDEX idx_code_date (affiliate_code, first_used_at),
  INDEX idx_follow_up (follow_up_status),
  FOREIGN KEY (ambassador_id) REFERENCES ambassadors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

try {
  await db.query(createTableSQL);
  console.log("✅ Table created successfully!\n");

  // Verify
  const [rows] = await db.query("SHOW TABLES LIKE 'affiliate_usage'");
  if (rows.length > 0) {
    console.log("✅ Verification passed!\n");
    const [structure] = await db.query("DESCRIBE affiliate_usage");
    console.log("📊 Table structure:");
    console.table(structure);
  }

  process.exit(0);
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
