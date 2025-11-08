-- Fix admin_users table
-- Drop and recreate with proper structure

DROP TABLE IF EXISTS admin_users;

CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_email (email),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO admin_users (email, password_hash, name, role, is_active) VALUES
('admin@zonaenglish.com', '$2b$10$rZ5WqFGKOXHnLkzEr.Jy8.QZmXc.c4LZ9VyQp1RnHMN9.YGZJvLFO', 'Administrator', 'super_admin', true);

-- Verify
SELECT id, email, name, role, is_active, created_at FROM admin_users;
