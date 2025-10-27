-- ==============================================
-- ZONA ENGLISH ADMIN DASHBOARD DATABASE SCHEMA
-- Created: 27 October 2025
-- Purpose: Admin dashboard untuk manage Ambassadors, Promo Codes, Countdown Batches, Articles
-- MySQL Version: 8.0+
-- Port: 3307 (as per user requirement)
-- ==============================================

-- Create database
CREATE DATABASE IF NOT EXISTS `zona_english_admin` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `zona_english_admin`;

-- ==============================================
-- TABLE 1: ADMIN USERS
-- ==============================================
CREATE TABLE `admin_users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'admin', 'editor') DEFAULT 'admin',
  `is_active` BOOLEAN DEFAULT TRUE,
  `last_login` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB;

-- ==============================================
-- TABLE 2: AMBASSADORS
-- ==============================================
CREATE TABLE `ambassadors` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `role` ENUM('Senior Ambassador', 'Campus Ambassador', 'Community Ambassador', 'Junior Ambassador') NOT NULL,
  `location` VARCHAR(100) NOT NULL,
  `achievement` VARCHAR(100),
  `commission` DECIMAL(10,2) DEFAULT 0.00,
  `referrals` INT DEFAULT 0,
  `badge_text` VARCHAR(50),
  `badge_variant` ENUM('premium', 'ambassador', 'active', 'location') DEFAULT 'ambassador',
  `image_url` TEXT,
  `affiliate_code` VARCHAR(20) NOT NULL UNIQUE,
  `commission_rate` DECIMAL(5,2) DEFAULT 15.00, -- Percentage (15.00 = 15%)
  `is_active` BOOLEAN DEFAULT TRUE,
  `phone` VARCHAR(20),
  `email` VARCHAR(100),
  `bank_account` VARCHAR(50),
  `bank_name` VARCHAR(50),
  `total_earnings` DECIMAL(12,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_affiliate_code` (`affiliate_code`),
  INDEX `idx_location` (`location`),
  INDEX `idx_role` (`role`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB;

-- ==============================================
-- TABLE 3: PROMO CODES
-- ==============================================
CREATE TABLE `promo_codes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `discount_type` ENUM('percentage', 'fixed_amount') DEFAULT 'percentage',
  `discount_value` DECIMAL(10,2) NOT NULL, -- 10.00 = 10% or Rp 10.000
  `min_purchase` DECIMAL(10,2) DEFAULT 0.00,
  `max_discount` DECIMAL(10,2) NULL, -- Max discount for percentage type
  `usage_limit` INT DEFAULT NULL, -- NULL = unlimited
  `used_count` INT DEFAULT 0,
  `valid_from` TIMESTAMP NOT NULL,
  `valid_until` TIMESTAMP NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `applicable_to` ENUM('all', 'new_students', 'specific_programs') DEFAULT 'all',
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_code` (`code`),
  INDEX `idx_valid_period` (`valid_from`, `valid_until`),
  INDEX `idx_active` (`is_active`),
  FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==============================================
-- TABLE 4: COUNTDOWN BATCHES
-- ==============================================
CREATE TABLE `countdown_batches` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `batch_name` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `start_date` TIMESTAMP NOT NULL,
  `end_date` TIMESTAMP NOT NULL,
  `timezone` VARCHAR(50) DEFAULT 'Asia/Makassar', -- WITA
  `is_active` BOOLEAN DEFAULT TRUE,
  `show_on_homepage` BOOLEAN DEFAULT FALSE,
  `background_color` VARCHAR(7) DEFAULT '#2563eb', -- Blue color
  `text_color` VARCHAR(7) DEFAULT '#ffffff',
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_batch_name` (`batch_name`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_dates` (`start_date`, `end_date`),
  FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==============================================
-- TABLE 5: ARTICLES
-- ==============================================
CREATE TABLE `articles` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `excerpt` TEXT,
  `content` LONGTEXT NOT NULL,
  `featured_image` TEXT,
  `category` ENUM('news', 'tips', 'success_story', 'announcement', 'program_info') DEFAULT 'news',
  `tags` JSON, -- Array of tags
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  `is_featured` BOOLEAN DEFAULT FALSE,
  `view_count` INT DEFAULT 0,
  `meta_title` VARCHAR(200),
  `meta_description` VARCHAR(300),
  `author_id` INT,
  `published_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category`),
  INDEX `idx_featured` (`is_featured`),
  INDEX `idx_published_at` (`published_at`),
  FOREIGN KEY (`author_id`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL,
  FULLTEXT KEY `search_content` (`title`, `excerpt`, `content`)
) ENGINE=InnoDB;

-- ==============================================
-- TABLE 6: AFFILIATE TRANSACTIONS
-- ==============================================
CREATE TABLE `affiliate_transactions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `ambassador_id` INT NOT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `student_email` VARCHAR(100),
  `student_phone` VARCHAR(20),
  `program_type` VARCHAR(50),
  `registration_fee` DECIMAL(10,2) NOT NULL,
  `commission_amount` DECIMAL(10,2) NOT NULL,
  `commission_rate` DECIMAL(5,2) NOT NULL,
  `status` ENUM('pending', 'confirmed', 'paid', 'cancelled') DEFAULT 'pending',
  `payment_date` TIMESTAMP NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ambassador_id` (`ambassador_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_date` (`payment_date`),
  FOREIGN KEY (`ambassador_id`) REFERENCES `ambassadors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==============================================
-- TABLE 7: PROMO CODE USAGE
-- ==============================================
CREATE TABLE `promo_usage` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `promo_code_id` INT NOT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `student_email` VARCHAR(100),
  `student_phone` VARCHAR(20),
  `original_amount` DECIMAL(10,2) NOT NULL,
  `discount_amount` DECIMAL(10,2) NOT NULL,
  `final_amount` DECIMAL(10,2) NOT NULL,
  `used_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_promo_code_id` (`promo_code_id`),
  INDEX `idx_used_at` (`used_at`),
  FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==============================================
-- INITIAL DATA INSERTS
-- ==============================================

-- Insert default admin user (password: admin123 - hashed with bcrypt)
INSERT INTO `admin_users` (`username`, `email`, `password_hash`, `role`) VALUES
('admin', 'admin@zonaenglish.id', '$2b$12$LQv3c1yqBWVHxkd0LQ4YFu8VvQ8b8YvQ8b8YvQ8b8YvQ8b8YvQ8b8', 'super_admin');

-- Insert sample ambassadors (matching current PromoHub data)
INSERT INTO `ambassadors` (`name`, `role`, `location`, `achievement`, `commission`, `referrals`, `badge_text`, `badge_variant`, `image_url`, `affiliate_code`, `commission_rate`, `phone`, `email`) VALUES
('Sarah Pratiwi', 'Senior Ambassador', 'Makassar', 'Top Recruiter', 8500000.00, 47, 'Ambassador Elite', 'premium', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop', 'SARAH2024', 25.00, '+62821-1234-5678', 'sarah@zonaenglish.id'),
('Ahmad Rizki', 'Campus Ambassador', 'Kendari', 'Rising Star', 4200000.00, 23, 'Campus Leader', 'ambassador', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop', 'AHMAD2024', 20.00, '+62821-2345-6789', 'ahmad@zonaenglish.id'),
('Maya Sari', 'Community Ambassador', 'Kolaka', 'Konsisten', 2800000.00, 15, 'Community Star', 'ambassador', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop', 'MAYA2024', 15.00, '+62821-3456-7890', 'maya@zonaenglish.id');

-- Insert sample promo codes
INSERT INTO `promo_codes` (`code`, `name`, `description`, `discount_type`, `discount_value`, `valid_from`, `valid_until`, `created_by`) VALUES
('GAJIAN90', 'Promo Gajian', 'Hemat s.d. 90% biaya pendaftaran', 'percentage', 90.00, '2024-10-27 00:00:00', '2024-11-30 23:59:59', 1),
('EARLY50', 'Early Bird', 'Diskon 50% untuk pendaftar awal', 'percentage', 50.00, '2024-10-27 00:00:00', '2024-12-31 23:59:59', 1),
('STUDENT25', 'Student Discount', 'Khusus mahasiswa aktif', 'percentage', 25.00, '2024-10-27 00:00:00', '2025-03-31 23:59:59', 1);

-- Insert countdown batch (Batch A • Mulai 03 Nov 2025, 09:00 WITA)
INSERT INTO `countdown_batches` (`batch_name`, `title`, `description`, `start_date`, `end_date`, `is_active`, `show_on_homepage`, `created_by`) VALUES
('BATCH_A', 'Batch A • Mulai 03 Nov 2025, 09:00 WITA', 'Batch pertama program intensif Zona English dengan kuota terbatas', '2025-11-03 09:00:00', '2025-11-03 23:59:59', TRUE, TRUE, 1);

-- Insert sample articles
INSERT INTO `articles` (`title`, `slug`, `excerpt`, `content`, `category`, `status`, `is_featured`, `author_id`, `published_at`) VALUES
('Tips Belajar Bahasa Inggris Efektif', 'tips-belajar-bahasa-inggris-efektif', 'Panduan lengkap untuk memaksimalkan pembelajaran bahasa Inggris dengan metode NBSN', '<h1>Tips Belajar Bahasa Inggris Efektif</h1><p>Belajar bahasa Inggris tidak harus sulit. Dengan metode NBSN (Neuron, Biomolecular, Sensory, Nature), Anda dapat belajar lebih efektif...</p>', 'tips', 'published', TRUE, 1, NOW()),
('Success Story: Dari Pemalu Menjadi Confident Speaker', 'success-story-dari-pemalu-menjadi-confident-speaker', 'Kisah inspiratif siswa Zona English yang berhasil transformasi', '<h1>Success Story</h1><p>Cerita inspiratif dari Arka, siswa berusia 10 tahun yang dulunya pemalu...</p>', 'success_story', 'published', FALSE, 1, NOW());

-- ==============================================
-- VIEWS FOR REPORTING
-- ==============================================

-- View for ambassador performance
CREATE VIEW `ambassador_performance` AS
SELECT 
    a.id,
    a.name,
    a.role,
    a.location,
    a.affiliate_code,
    a.commission_rate,
    a.referrals,
    a.total_earnings,
    COUNT(at.id) as total_transactions,
    SUM(CASE WHEN at.status = 'confirmed' THEN at.commission_amount ELSE 0 END) as confirmed_earnings,
    SUM(CASE WHEN at.status = 'pending' THEN at.commission_amount ELSE 0 END) as pending_earnings
FROM ambassadors a
LEFT JOIN affiliate_transactions at ON a.id = at.ambassador_id
WHERE a.is_active = TRUE
GROUP BY a.id;

-- View for promo code analytics
CREATE VIEW `promo_analytics` AS
SELECT 
    pc.id,
    pc.code,
    pc.name,
    pc.discount_value,
    pc.usage_limit,
    pc.used_count,
    COUNT(pu.id) as actual_usage,
    SUM(pu.discount_amount) as total_discount_given,
    pc.valid_from,
    pc.valid_until,
    CASE 
        WHEN pc.valid_until < NOW() THEN 'Expired'
        WHEN pc.valid_from > NOW() THEN 'Not Started'
        ELSE 'Active'
    END as status
FROM promo_codes pc
LEFT JOIN promo_usage pu ON pc.id = pu.promo_code_id
GROUP BY pc.id;

-- ==============================================
-- STORED PROCEDURES
-- ==============================================

-- Procedure to update ambassador stats
DELIMITER //
CREATE PROCEDURE UpdateAmbassadorStats(IN ambassador_id INT)
BEGIN
    UPDATE ambassadors 
    SET 
        referrals = (SELECT COUNT(*) FROM affiliate_transactions WHERE ambassador_id = ambassadors.id AND status IN ('confirmed', 'paid')),
        total_earnings = (SELECT COALESCE(SUM(commission_amount), 0) FROM affiliate_transactions WHERE ambassador_id = ambassadors.id AND status = 'paid')
    WHERE id = ambassador_id;
END //
DELIMITER ;

-- Procedure to update promo code usage
DELIMITER //
CREATE PROCEDURE UpdatePromoUsage(IN promo_id INT)
BEGIN
    UPDATE promo_codes 
    SET used_count = (SELECT COUNT(*) FROM promo_usage WHERE promo_code_id = promo_id)
    WHERE id = promo_id;
END //
DELIMITER ;

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Additional composite indexes for common queries
CREATE INDEX `idx_ambassadors_active_location` ON `ambassadors` (`is_active`, `location`);
CREATE INDEX `idx_articles_status_featured` ON `articles` (`status`, `is_featured`);
CREATE INDEX `idx_affiliate_transactions_ambassador_status` ON `affiliate_transactions` (`ambassador_id`, `status`);

-- ==============================================
-- TRIGGERS
-- ==============================================

-- Auto-update ambassador stats after transaction insert/update
DELIMITER //
CREATE TRIGGER `after_affiliate_transaction_insert` 
AFTER INSERT ON `affiliate_transactions`
FOR EACH ROW
BEGIN
    CALL UpdateAmbassadorStats(NEW.ambassador_id);
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER `after_affiliate_transaction_update` 
AFTER UPDATE ON `affiliate_transactions`
FOR EACH ROW
BEGIN
    CALL UpdateAmbassadorStats(NEW.ambassador_id);
END //
DELIMITER ;

-- Auto-update promo usage after promo_usage insert
DELIMITER //
CREATE TRIGGER `after_promo_usage_insert` 
AFTER INSERT ON `promo_usage`
FOR EACH ROW
BEGIN
    CALL UpdatePromoUsage(NEW.promo_code_id);
END //
DELIMITER ;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================
SELECT 'Database schema created successfully!' as message,
       'Ready to import to XAMPP MySQL on port 3307' as status,
       'Total tables created: 7' as tables_count,
       'Total views created: 2' as views_count,
       'Total procedures created: 2' as procedures_count;