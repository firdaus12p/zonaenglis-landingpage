import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "",
  database: "zona_english_admin",
});

console.log("🔧 Creating settings table...\n");

try {
  // Create table
  await db.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value TEXT,
      setting_type ENUM('string', 'number', 'boolean', 'json', 'text') DEFAULT 'string',
      category VARCHAR(50) NOT NULL,
      label VARCHAR(200) NOT NULL,
      description TEXT,
      is_public BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      updated_by INT,
      FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
      INDEX idx_category (category),
      INDEX idx_key (setting_key)
    ) ENGINE=InnoDB
  `);

  console.log("✅ Settings table created\n");

  // Insert default settings
  console.log("📝 Inserting default settings...\n");

  const defaultSettings = [
    [
      "admin_name",
      "Administrator",
      "string",
      "profile",
      "Admin Name",
      "Name of the administrator",
      0,
    ],
    [
      "admin_email",
      "admin@zonaenglish.com",
      "string",
      "profile",
      "Admin Email",
      "Email address for admin notifications",
      0,
    ],
    [
      "whatsapp_promo_hub",
      "6282188080688",
      "string",
      "general",
      "WhatsApp Promo Hub",
      "WhatsApp number for Promo Hub contact",
      1,
    ],
    [
      "whatsapp_general",
      "6282188080688",
      "string",
      "general",
      "WhatsApp General",
      "General WhatsApp contact number",
      1,
    ],
    [
      "whatsapp_pettarani",
      "6282188080688",
      "string",
      "general",
      "WhatsApp Pettarani",
      "WhatsApp for Pettarani branch",
      1,
    ],
    [
      "whatsapp_kolaka",
      "6282188080688",
      "string",
      "general",
      "WhatsApp Kolaka",
      "WhatsApp for Kolaka branch",
      1,
    ],
    [
      "whatsapp_kendari",
      "6282188080688",
      "string",
      "general",
      "WhatsApp Kendari",
      "WhatsApp for Kendari branch",
      1,
    ],
    [
      "default_commission_rate",
      "10",
      "number",
      "ambassador",
      "Default Commission Rate",
      "Default commission percentage for new ambassadors",
      0,
    ],
    [
      "article_comments_enabled",
      "true",
      "boolean",
      "content",
      "Enable Comments",
      "Allow comments on articles",
      1,
    ],
    [
      "article_default_status",
      "draft",
      "string",
      "content",
      "Default Article Status",
      "Default status for new articles",
      0,
    ],
    [
      "site_name",
      "Zona English",
      "string",
      "general",
      "Site Name",
      "Website name",
      1,
    ],
    [
      "site_tagline",
      "Belajar Bahasa Inggris dengan Mudah dan Menyenangkan",
      "string",
      "general",
      "Site Tagline",
      "Website tagline",
      1,
    ],
    [
      "contact_phone",
      "082188080688",
      "string",
      "contact",
      "Phone Number",
      "Nomor WhatsApp untuk kontak",
      1,
    ],
    [
      "contact_email",
      "info@zonaenglish.com",
      "string",
      "contact",
      "Contact Email",
      "Email untuk kontak umum",
      1,
    ],
    [
      "office_address",
      "Makassar, Sulawesi Selatan",
      "text",
      "business",
      "Office Address",
      "Alamat kantor utama",
      1,
    ],
    [
      "business_hours",
      "08:00 - 17:00 WITA",
      "string",
      "business",
      "Business Hours",
      "Jam operasional",
      1,
    ],
    [
      "registration_open",
      "true",
      "boolean",
      "business",
      "Registration Open",
      "Status pendaftaran siswa baru",
      1,
    ],
    [
      "timezone",
      "WITA",
      "string",
      "general",
      "Timezone",
      "Zona waktu yang digunakan (WIB/WITA/WIT)",
      1,
    ],
  ];

  for (const [
    key,
    value,
    type,
    category,
    label,
    description,
    isPublic,
  ] of defaultSettings) {
    try {
      await db.query(
        `INSERT INTO settings (setting_key, setting_value, setting_type, category, label, description, is_public, updated_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE 
           setting_value = VALUES(setting_value),
           updated_at = CURRENT_TIMESTAMP`,
        [key, value, type, category, label, description, isPublic]
      );
      console.log(`   ✓ ${key}`);
    } catch (err) {
      console.log(`   ✗ ${key}: ${err.message}`);
    }
  }

  console.log("\n📊 Verification:");
  const [count] = await db.query("SELECT COUNT(*) as total FROM settings");
  const [categories] = await db.query(
    "SELECT DISTINCT category FROM settings ORDER BY category"
  );

  console.log(`   Total settings: ${count[0].total}`);
  console.log(`   Categories: ${categories.map((c) => c.category).join(", ")}`);

  console.log("\n✨ Settings table setup complete!");
} catch (error) {
  console.error("\n❌ Error:", error.message);
  if (error.code) console.error("   Code:", error.code);
  if (error.sqlMessage) console.error("   SQL:", error.sqlMessage);
} finally {
  await db.end();
}
