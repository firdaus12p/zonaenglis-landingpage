-- =====================================================
-- FIX MISSING TABLES AND COLUMNS
-- Jalankan di phpMyAdmin untuk melengkapi database
-- =====================================================

USE `zona_english_admin`;

-- 1. CREATE AFFILIATE_USAGE TABLE (if not exists)
CREATE TABLE IF NOT EXISTS `affiliate_usage` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_name` VARCHAR(255) NOT NULL,
  `user_phone` VARCHAR(20) NOT NULL,
  `user_email` VARCHAR(255),
  `affiliate_code` VARCHAR(50) NOT NULL,
  `program_id` VARCHAR(50),
  `program_name` VARCHAR(255),
  `discount_applied` DECIMAL(10,2) DEFAULT 0,
  `first_used_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_phone` (`user_phone`),
  INDEX `idx_code` (`affiliate_code`),
  INDEX `idx_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CREATE PROGRAMS TABLE (if not exists)
CREATE TABLE IF NOT EXISTS `programs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `branch` ENUM('Pettarani', 'Kolaka', 'Kendari') NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  `program` VARCHAR(100) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `quota` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `perks` JSON NOT NULL,
  `image_url` TEXT,
  `wa_link` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_branch` (`branch`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CREATE GALLERY TABLE (if not exists)
CREATE TABLE IF NOT EXISTS `gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL COMMENT 'Judul/caption foto',
  `image_url` TEXT NOT NULL COMMENT 'URL atau path foto',
  `category` ENUM('Kids', 'Teens', 'Intensive') NOT NULL COMMENT 'Kategori program',
  `description` TEXT COMMENT 'Deskripsi tambahan (opsional)',
  `order_index` INT DEFAULT 0 COMMENT 'Urutan tampil (semakin kecil semakin di depan)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ADD MISSING COLUMNS TO AMBASSADORS (if not exists)
ALTER TABLE `ambassadors` 
ADD COLUMN IF NOT EXISTS `institution` VARCHAR(255) AFTER `location`,
ADD COLUMN IF NOT EXISTS `testimonial` TEXT AFTER `email`,
ADD COLUMN IF NOT EXISTS `address` VARCHAR(255) AFTER `location`;

-- 5. VERIFY ALL TABLES
SELECT 'All tables fixed!' as status;

-- Check tables exist
SELECT 
  CASE WHEN COUNT(*) > 0 THEN '✅ affiliate_usage' ELSE '❌ affiliate_usage' END as table_check
FROM information_schema.tables 
WHERE table_schema = 'zona_english_admin' AND table_name = 'affiliate_usage'
UNION ALL
SELECT 
  CASE WHEN COUNT(*) > 0 THEN '✅ programs' ELSE '❌ programs' END
FROM information_schema.tables 
WHERE table_schema = 'zona_english_admin' AND table_name = 'programs'
UNION ALL
SELECT 
  CASE WHEN COUNT(*) > 0 THEN '✅ gallery' ELSE '❌ gallery' END
FROM information_schema.tables 
WHERE table_schema = 'zona_english_admin' AND table_name = 'gallery';
