/**
 * Auto Migration System
 * Automatically creates tables if they don't exist when server starts.
 * Safe to run multiple times - uses CREATE TABLE IF NOT EXISTS.
 */

import db from "./connection.js";
import bcrypt from "bcryptjs";

// ====== TABLE DEFINITIONS ======

const tables = {
  // 1. Users table (for authentication)
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') DEFAULT 'user',
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 2. Admin users table
  admin_users: `
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL DEFAULT 'Admin User',
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('super_admin', 'admin', 'editor') DEFAULT 'admin',
      is_active TINYINT(1) DEFAULT 1,
      must_change_password TINYINT(1) DEFAULT 0,
      last_login TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 3. Ambassadors table
  ambassadors: `
    CREATE TABLE IF NOT EXISTS ambassadors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      role ENUM('Affiliate Campus','Affiliate SMA','Affiliate SMP','Ambassador Campus','Ambassador SMA','Ambassador SMP') NOT NULL,
      location VARCHAR(100) NOT NULL,
      institution VARCHAR(200) DEFAULT NULL,
      achievement VARCHAR(100) DEFAULT NULL,
      commission DECIMAL(10,2) DEFAULT 0.00,
      referrals INT DEFAULT 0,
      badge_text VARCHAR(50) DEFAULT NULL,
      badge_variant ENUM('premium','ambassador','active','location') DEFAULT 'ambassador',
      image_url TEXT DEFAULT NULL,
      affiliate_code VARCHAR(20) NOT NULL UNIQUE,
      testimonial TEXT DEFAULT NULL,
      commission_rate DECIMAL(5,2) DEFAULT 15.00,
      is_active TINYINT(1) DEFAULT 1,
      phone VARCHAR(20) DEFAULT NULL,
      email VARCHAR(100) DEFAULT NULL,
      address TEXT DEFAULT NULL,
      bank_account VARCHAR(50) DEFAULT NULL,
      bank_name VARCHAR(50) DEFAULT NULL,
      total_earnings DECIMAL(12,2) DEFAULT 0.00,
      last_viewed_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_affiliate_code (affiliate_code),
      INDEX idx_role (role),
      INDEX idx_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 4. Programs table
  programs: `
    CREATE TABLE IF NOT EXISTS programs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      branch VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL,
      program VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      quota INT NOT NULL,
      price DECIMAL(12,2) NOT NULL,
      perks LONGTEXT DEFAULT NULL,
      image_url TEXT DEFAULT NULL,
      wa_link TEXT DEFAULT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 5. Promo codes table
  promo_codes: `
    CREATE TABLE IF NOT EXISTS promo_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      description TEXT DEFAULT NULL,
      discount_type ENUM('percentage','fixed_amount') DEFAULT 'percentage',
      discount_value DECIMAL(10,2) NOT NULL,
      min_purchase DECIMAL(10,2) DEFAULT 0.00,
      max_discount DECIMAL(10,2) DEFAULT NULL,
      usage_limit INT DEFAULT NULL,
      used_count INT DEFAULT 0,
      valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      valid_until TIMESTAMP NULL,
      applicable_to VARCHAR(50) DEFAULT 'all',
      is_active TINYINT(1) DEFAULT 1,
      created_by INT DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_code (code),
      INDEX idx_is_active (is_active),
      INDEX idx_valid_from (valid_from),
      INDEX idx_valid_until (valid_until)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 6. Promo usage table
  promo_usage: `
    CREATE TABLE IF NOT EXISTS promo_usage (
      id INT AUTO_INCREMENT PRIMARY KEY,
      promo_code_id INT NOT NULL,
      user_name VARCHAR(255) NOT NULL DEFAULT 'Unknown',
      user_phone VARCHAR(20) DEFAULT NULL,
      user_email VARCHAR(255) DEFAULT NULL,
      program_name VARCHAR(255) DEFAULT NULL,
      student_name VARCHAR(100) NOT NULL DEFAULT '',
      student_email VARCHAR(100) DEFAULT NULL,
      student_phone VARCHAR(20) DEFAULT NULL,
      original_amount DECIMAL(10,2) NOT NULL,
      discount_amount DECIMAL(10,2) NOT NULL,
      final_amount DECIMAL(10,2) NOT NULL,
      follow_up_status ENUM('pending','contacted','converted','lost') DEFAULT 'pending',
      follow_up_notes TEXT DEFAULT NULL,
      registered TINYINT(1) DEFAULT 0,
      deleted_at TIMESTAMP NULL DEFAULT NULL,
      deleted_by INT DEFAULT NULL,
      used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_promo_code_id (promo_code_id),
      INDEX idx_follow_up_status (follow_up_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 7. Affiliate usage table
  affiliate_usage: `
    CREATE TABLE IF NOT EXISTS affiliate_usage (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_name VARCHAR(255) NOT NULL,
      user_phone VARCHAR(20) NOT NULL,
      user_email VARCHAR(255) DEFAULT NULL,
      user_city VARCHAR(100) DEFAULT NULL,
      affiliate_code VARCHAR(50) NOT NULL,
      ambassador_id INT DEFAULT NULL,
      program_id INT DEFAULT NULL,
      program_name VARCHAR(255) DEFAULT NULL,
      urgency ENUM('low','medium','high') DEFAULT 'medium',
      follow_up_status ENUM('pending','contacted','converted','lost') DEFAULT 'pending',
      follow_up_notes TEXT DEFAULT NULL,
      registered TINYINT(1) DEFAULT 0,
      device_fingerprint VARCHAR(255) DEFAULT NULL,
      source VARCHAR(50) DEFAULT 'promo_hub',
      notified_to_ambassador TINYINT(1) DEFAULT 0,
      notified_at TIMESTAMP NULL DEFAULT NULL,
      notification_method VARCHAR(50) DEFAULT NULL,
      discount_applied DECIMAL(10,2) DEFAULT 0.00,
      first_used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL DEFAULT NULL,
      deleted_by INT DEFAULT NULL,
      INDEX idx_affiliate_code (affiliate_code),
      INDEX idx_ambassador_id (ambassador_id),
      INDEX idx_follow_up_status (follow_up_status),
      INDEX idx_deleted_at (deleted_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 8. Promo claims table
  promo_claims: `
    CREATE TABLE IF NOT EXISTS promo_claims (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_name VARCHAR(255) NOT NULL,
      user_phone VARCHAR(20) NOT NULL,
      user_email VARCHAR(255) DEFAULT NULL,
      user_city VARCHAR(100) DEFAULT NULL,
      program_id INT DEFAULT NULL,
      program_name VARCHAR(255) NOT NULL,
      program_branch VARCHAR(50) DEFAULT NULL,
      program_type VARCHAR(50) DEFAULT NULL,
      program_category VARCHAR(50) DEFAULT NULL,
      urgency ENUM('urgent','this_month','browsing') DEFAULT 'browsing',
      source VARCHAR(50) DEFAULT 'promo_hub',
      device_fingerprint VARCHAR(255) DEFAULT NULL,
      follow_up_status ENUM('pending','contacted','converted','lost') DEFAULT 'pending',
      follow_up_notes TEXT DEFAULT NULL,
      follow_up_by INT DEFAULT NULL,
      registered TINYINT(1) DEFAULT 0,
      registered_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL DEFAULT NULL,
      deleted_by VARCHAR(100) DEFAULT NULL,
      INDEX idx_follow_up_status (follow_up_status),
      INDEX idx_deleted_at (deleted_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 9. Affiliate transactions table
  affiliate_transactions: `
    CREATE TABLE IF NOT EXISTS affiliate_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ambassador_id INT NOT NULL,
      student_name VARCHAR(100) NOT NULL,
      student_email VARCHAR(100) DEFAULT NULL,
      student_phone VARCHAR(20) DEFAULT NULL,
      program_type VARCHAR(50) DEFAULT NULL,
      registration_fee DECIMAL(10,2) NOT NULL,
      commission_amount DECIMAL(10,2) NOT NULL,
      commission_rate DECIMAL(5,2) NOT NULL,
      status ENUM('pending','confirmed','paid','cancelled') DEFAULT 'pending',
      payment_date TIMESTAMP NULL DEFAULT NULL,
      notes TEXT DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_ambassador_id (ambassador_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 10. Countdown batches table
  countdown_batches: `
    CREATE TABLE IF NOT EXISTS countdown_batches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) DEFAULT NULL,
      batch_name VARCHAR(50) NOT NULL DEFAULT '',
      title VARCHAR(200) NOT NULL DEFAULT '',
      description TEXT DEFAULT NULL,
      start_date DATE NOT NULL,
      start_time TIME DEFAULT NULL,
      end_date DATE DEFAULT NULL,
      end_time TIME DEFAULT NULL,
      timezone VARCHAR(50) DEFAULT 'Asia/Makassar',
      instructor VARCHAR(255) DEFAULT NULL,
      location_mode ENUM('Online','Offline','Hybrid') DEFAULT 'Online',
      location_address TEXT DEFAULT NULL,
      price DECIMAL(10,2) DEFAULT 0.00,
      registration_deadline DATE DEFAULT NULL,
      target_students INT DEFAULT 0,
      current_students INT DEFAULT 0,
      status ENUM('Active','Upcoming','Completed','Paused') DEFAULT 'Upcoming',
      visibility ENUM('Public','Private') DEFAULT 'Public',
      is_active TINYINT(1) DEFAULT 1,
      show_on_homepage TINYINT(1) DEFAULT 0,
      background_color VARCHAR(7) DEFAULT '#2563eb',
      text_color VARCHAR(7) DEFAULT '#ffffff',
      created_by INT DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_start_date (start_date),
      INDEX idx_visibility (visibility)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 11. Gallery table
  gallery: `
    CREATE TABLE IF NOT EXISTS gallery (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      image_url TEXT DEFAULT NULL,
      category ENUM('Kids','Teens','Intensive') NOT NULL,
      description TEXT DEFAULT NULL,
      media_type ENUM('image','video') NOT NULL DEFAULT 'image',
      youtube_url VARCHAR(500) DEFAULT NULL,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_media_type (media_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 12. Settings table
  settings: `
    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT DEFAULT NULL,
      setting_type ENUM('string','number','boolean','json','text') DEFAULT 'string',
      category VARCHAR(50) NOT NULL,
      label VARCHAR(200) NOT NULL,
      description TEXT DEFAULT NULL,
      is_public TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      updated_by INT DEFAULT NULL,
      INDEX idx_setting_key (setting_key),
      INDEX idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 13. Articles table
  articles: `
    CREATE TABLE IF NOT EXISTS articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      excerpt TEXT,
      content LONGTEXT NOT NULL,
      author VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      status ENUM('Published', 'Draft', 'Scheduled', 'Archived') DEFAULT 'Draft',
      published_at DATETIME,
      featured_image VARCHAR(500),
      seo_title VARCHAR(255),
      seo_description TEXT,
      views INT DEFAULT 0,
      likes_count INT DEFAULT 0,
      loves_count INT DEFAULT 0,
      comments_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL,
      INDEX idx_slug (slug),
      INDEX idx_status (status),
      INDEX idx_category (category),
      INDEX idx_published_at (published_at),
      INDEX idx_deleted_at (deleted_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 14. Article categories table
  article_categories: `
    CREATE TABLE IF NOT EXISTS article_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL DEFAULT NULL,
      INDEX idx_deleted_at (deleted_at),
      INDEX idx_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 15. Article images table
  article_images: `
    CREATE TABLE IF NOT EXISTS article_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      article_id INT NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      caption TEXT,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_article_id (article_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 16. Article hashtags table
  article_hashtags: `
    CREATE TABLE IF NOT EXISTS article_hashtags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      article_id INT NOT NULL,
      hashtag VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_article_id (article_id),
      INDEX idx_hashtag (hashtag)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 17. Article likes table
  article_likes: `
    CREATE TABLE IF NOT EXISTS article_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      article_id INT NOT NULL,
      user_identifier VARCHAR(255) NOT NULL,
      reaction_type ENUM('like', 'love') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_article_like (article_id, user_identifier),
      INDEX idx_article_reaction (article_id, reaction_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 18. Article comments table
  article_comments: `
    CREATE TABLE IF NOT EXISTS article_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      article_id INT NOT NULL,
      user_name VARCHAR(100) NOT NULL,
      user_email VARCHAR(255) NOT NULL,
      comment TEXT NOT NULL,
      status ENUM('Pending', 'Approved', 'Spam', 'Deleted') DEFAULT 'Pending',
      ip_address VARCHAR(45),
      user_agent VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_article_status (article_id, status),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // 19. Article views table
  article_views: `
    CREATE TABLE IF NOT EXISTS article_views (
      id INT AUTO_INCREMENT PRIMARY KEY,
      article_id INT NOT NULL,
      user_identifier VARCHAR(255) NOT NULL,
      ip_address VARCHAR(45),
      user_agent VARCHAR(500),
      viewed_at DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_daily_view (article_id, user_identifier, viewed_at),
      INDEX idx_article_date (article_id, viewed_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,
};

// ====== DEFAULT DATA ======

const defaultData = {
  // Default admin user - REQUIRES PASSWORD CHANGE ON FIRST LOGIN
  admin_users: async () => {
    const [existing] = await db.query(
      "SELECT id FROM admin_users WHERE email = ?",
      ["admin@zonaenglish.com"]
    );
    if (existing.length === 0) {
      // Generate a temporary password - MUST be changed on first login
      const tempPassword = "admin123";
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      await db.query(
        `INSERT INTO admin_users (username, email, name, password_hash, role, must_change_password) 
         VALUES (?, ?, ?, ?, ?, 1)`,
        [
          "admin",
          "admin@zonaenglish.com",
          "Administrator",
          passwordHash,
          "super_admin",
        ]
      );
      console.log(
        "   ✅ Default admin created (admin@zonaenglish.com / admin123)"
      );
      console.log(
        "   ⚠️  WARNING: Default admin MUST change password on first login!"
      );
    }
  },

  // Default settings
  settings: async () => {
    // Check if settings table has 'label' column (production may have different schema)
    try {
      const [columns] = await db.query(
        "SHOW COLUMNS FROM settings LIKE 'label'"
      );
      const hasLabelColumn = columns.length > 0;

      const defaultSettings = [
        {
          key: "site_name",
          value: "Zona English",
          type: "string",
          category: "general",
          label: "Site Name",
          public: 1,
        },
        {
          key: "site_tagline",
          value: "Belajar Bahasa Inggris dengan Mudah dan Menyenangkan",
          type: "string",
          category: "general",
          label: "Site Tagline",
          public: 1,
        },
        {
          key: "whatsapp_general",
          value: "6282188080688",
          type: "string",
          category: "general",
          label: "WhatsApp General",
          public: 1,
        },
        {
          key: "whatsapp_promo_hub",
          value: "6282188080688",
          type: "string",
          category: "general",
          label: "WhatsApp Promo Hub",
          public: 1,
        },
        {
          key: "default_commission_rate",
          value: "10",
          type: "number",
          category: "ambassador",
          label: "Default Commission Rate",
          public: 0,
        },
        {
          key: "article_comments_enabled",
          value: "true",
          type: "boolean",
          category: "content",
          label: "Enable Comments",
          public: 1,
        },
      ];

      for (const setting of defaultSettings) {
        if (hasLabelColumn) {
          await db.query(
            `INSERT IGNORE INTO settings (setting_key, setting_value, setting_type, category, label, is_public) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              setting.key,
              setting.value,
              setting.type,
              setting.category,
              setting.label,
              setting.public,
            ]
          );
        } else {
          // Fallback for tables without label column
          await db.query(
            `INSERT IGNORE INTO settings (setting_key, setting_value, setting_type, category, is_public) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              setting.key,
              setting.value,
              setting.type,
              setting.category,
              setting.public,
            ]
          );
        }
      }
      console.log("   ✅ Default settings ensured");
    } catch (error) {
      // If settings table doesn't exist or has issues, skip gracefully
      console.log("   ⚠️  Settings defaults skipped:", error.message);
    }
  },

  // Default article categories
  article_categories: async () => {
    const categories = [
      {
        name: "Grammar",
        slug: "grammar",
        description: "Articles about English grammar rules and usage",
      },
      {
        name: "Vocabulary",
        slug: "vocabulary",
        description: "Vocabulary building and word learning articles",
      },
      {
        name: "Speaking",
        slug: "speaking",
        description: "Tips and guides for improving speaking skills",
      },
      {
        name: "Listening",
        slug: "listening",
        description: "Listening comprehension and practice materials",
      },
      {
        name: "Tips",
        slug: "tips",
        description: "General English learning tips and strategies",
      },
      {
        name: "News",
        slug: "news",
        description: "Latest news and updates from Zona English",
      },
    ];

    for (const cat of categories) {
      await db.query(
        `INSERT IGNORE INTO article_categories (name, slug, description) VALUES (?, ?, ?)`,
        [cat.name, cat.slug, cat.description]
      );
    }
    console.log("   ✅ Default article categories ensured");
  },
};

// ====== COLUMN MIGRATIONS (for updating existing tables) ======
const columnMigrations = [
  {
    table: "admin_users",
    column: "must_change_password",
    addSQL:
      "ALTER TABLE admin_users ADD COLUMN must_change_password TINYINT(1) DEFAULT 0 AFTER is_active",
  },
  {
    table: "settings",
    column: "label",
    addSQL:
      "ALTER TABLE settings ADD COLUMN label VARCHAR(200) NOT NULL DEFAULT '' AFTER category",
  },
];

async function runColumnMigrations() {
  console.log("");
  console.log("📦 Checking column migrations...");

  for (const migration of columnMigrations) {
    try {
      // Check if column exists
      const [columns] = await db.query(
        `SHOW COLUMNS FROM ${migration.table} LIKE '${migration.column}'`
      );

      if (columns.length === 0) {
        // Column doesn't exist, add it
        await db.query(migration.addSQL);
        console.log(
          `   ✅ Added column ${migration.column} to ${migration.table}`
        );
      }
    } catch (error) {
      // Table might not exist yet, skip
      if (!error.message.includes("doesn't exist")) {
        console.error(
          `   ⚠️  Column migration ${migration.table}.${migration.column}:`,
          error.message
        );
      }
    }
  }
}

// ====== MIGRATION RUNNER ======

async function runAutoMigration() {
  console.log("");
  console.log("🔄 ═══════════════════════════════════════════════════════");
  console.log("🔄 AUTO-MIGRATION: Checking database tables...");
  console.log("🔄 ═══════════════════════════════════════════════════════");

  try {
    // Get list of existing tables
    const [existingTables] = await db.query(
      `SELECT TABLE_NAME FROM information_schema.tables 
       WHERE table_schema = DATABASE()`
    );
    const existingTableNames = existingTables.map(
      (t) => t.TABLE_NAME || t.table_name
    );

    let createdCount = 0;
    let existingCount = 0;

    // Create tables
    for (const [tableName, createSQL] of Object.entries(tables)) {
      const exists = existingTableNames.includes(tableName);

      if (exists) {
        existingCount++;
        console.log(`   ⏭️  ${tableName} (already exists)`);
      } else {
        try {
          await db.query(createSQL);
          createdCount++;
          console.log(`   ✅ ${tableName} (CREATED)`);
        } catch (error) {
          console.error(`   ❌ ${tableName} FAILED:`, error.message);
        }
      }
    }

    console.log("");
    console.log(
      `📊 Summary: ${createdCount} created, ${existingCount} already exist`
    );

    // Run column migrations for existing tables
    await runColumnMigrations();

    // Run default data insertions
    console.log("");
    console.log("📦 Ensuring default data...");
    for (const [tableName, insertFn] of Object.entries(defaultData)) {
      try {
        await insertFn();
      } catch (error) {
        console.error(`   ⚠️  Default data for ${tableName}:`, error.message);
      }
    }

    console.log("");
    console.log("🔄 ═══════════════════════════════════════════════════════");
    console.log("✅ AUTO-MIGRATION: Complete!");
    console.log("🔄 ═══════════════════════════════════════════════════════");
    console.log("");

    return true;
  } catch (error) {
    console.error("❌ AUTO-MIGRATION FAILED:", error.message);
    throw error;
  }
}

export default runAutoMigration;
