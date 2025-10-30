import db from "./connection.js";

/**
 * Creates the users table for authentication
 *
 * Table Structure:
 * - id: Auto-increment primary key
 * - email: Unique email address for login
 * - password_hash: Bcrypt hashed password
 * - name: User's full name
 * - role: 'admin' or 'user' (default: 'user')
 * - is_active: Account status (default: true)
 * - last_login: Timestamp of last successful login
 * - created_at: Account creation timestamp
 * - updated_at: Last update timestamp
 */

async function createUsersTable() {
  try {
    const createTableQuery = `
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await db.query(createTableQuery);
    console.log("✅ Users table created successfully");

    // Create default admin account (password: admin123)
    // Note: In production, this should be changed immediately
    // Using bcryptjs to hash password
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.default.hash("admin123", 10);

    const defaultAdminQuery = `
      INSERT IGNORE INTO users (email, password_hash, name, role)
      VALUES (?, ?, 'Admin Zona English', 'admin');
    `;

    await db.query(defaultAdminQuery, ["admin@zonaenglish.com", passwordHash]);
    console.log("✅ Default admin account created");
    console.log("📧 Email: admin@zonaenglish.com");
    console.log("🔑 Password: admin123");
    console.log("⚠️  CHANGE THIS PASSWORD IN PRODUCTION!");
  } catch (error) {
    console.error("❌ Error creating users table:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createUsersTable();
