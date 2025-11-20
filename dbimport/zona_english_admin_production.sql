-- ===================================================
-- ZONA ENGLISH DATABASE - PRODUCTION VERSION
-- ===================================================
-- Database: dbpromoze
-- Compatible with: MySQL 5.7+, MariaDB 10.3+
-- For: Exabytes Hosting (Production)
-- Generated: 20 Nov 2025
-- ===================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ===================================================
-- STORED PROCEDURES (DEFINER removed for shared hosting)
-- ===================================================

DELIMITER $$

-- Procedure: Update Ambassador Statistics
DROP PROCEDURE IF EXISTS `UpdateAmbassadorStats`$$
CREATE PROCEDURE `UpdateAmbassadorStats` (IN `ambassador_id` INT)
BEGIN
    UPDATE ambassadors 
    SET 
        referrals = (SELECT COUNT(*) FROM affiliate_transactions WHERE ambassador_id = ambassadors.id AND status IN ('confirmed', 'paid')),
        total_earnings = (SELECT COALESCE(SUM(commission_amount), 0) FROM affiliate_transactions WHERE ambassador_id = ambassadors.id AND status = 'paid')
    WHERE id = ambassador_id;
END$$

-- Procedure: Update Promo Code Usage Count
DROP PROCEDURE IF EXISTS `UpdatePromoUsage`$$
CREATE PROCEDURE `UpdatePromoUsage` (IN `promo_id` INT)
BEGIN
    UPDATE promo_codes 
    SET used_count = (SELECT COUNT(*) FROM promo_usage WHERE promo_code_id = promo_id)
    WHERE id = promo_id;
END$$

DELIMITER ;

-- ===================================================
-- TABLE: admin_users
-- Purpose: Admin authentication and user management
-- ===================================================

DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'Admin User',
  `password_hash` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','editor') DEFAULT 'admin',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Admin User (username: admin, password: admin123)
INSERT INTO `admin_users` (`id`, `username`, `email`, `name`, `password_hash`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@zonaenglish.com', 'Administrator', '$2b$10$zOw2DjTqGkXNHDG8B5QKY.GTXEoIj.ROwk6laThKH19b0MycvzvjS', 'super_admin', 1, NULL, NOW(), NOW());

-- ===================================================
-- TABLE: affiliate_transactions
-- Purpose: Track ambassador commission transactions
-- ===================================================

DROP TABLE IF EXISTS `affiliate_transactions`;
CREATE TABLE `affiliate_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ambassador_id` int(11) NOT NULL,
  `student_name` varchar(100) NOT NULL,
  `student_email` varchar(100) DEFAULT NULL,
  `student_phone` varchar(20) DEFAULT NULL,
  `program_type` varchar(50) DEFAULT NULL,
  `registration_fee` decimal(10,2) NOT NULL,
  `commission_amount` decimal(10,2) NOT NULL,
  `commission_rate` decimal(5,2) NOT NULL,
  `status` enum('pending','confirmed','paid','cancelled') DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ambassador_id` (`ambassador_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Triggers for affiliate_transactions
DELIMITER $$
DROP TRIGGER IF EXISTS `after_affiliate_transaction_insert`$$
CREATE TRIGGER `after_affiliate_transaction_insert` AFTER INSERT ON `affiliate_transactions` 
FOR EACH ROW 
BEGIN
    CALL UpdateAmbassadorStats(NEW.ambassador_id);
END$$

DROP TRIGGER IF EXISTS `after_affiliate_transaction_update`$$
CREATE TRIGGER `after_affiliate_transaction_update` AFTER UPDATE ON `affiliate_transactions` 
FOR EACH ROW 
BEGIN
    CALL UpdateAmbassadorStats(NEW.ambassador_id);
END$$
DELIMITER ;

-- ===================================================
-- TABLE: affiliate_usage
-- Purpose: Track affiliate code usage and leads
-- ===================================================

DROP TABLE IF EXISTS `affiliate_usage`;
CREATE TABLE `affiliate_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(100) NOT NULL,
  `user_phone` varchar(20) NOT NULL,
  `user_email` varchar(100) DEFAULT NULL,
  `user_city` varchar(100) DEFAULT NULL,
  `affiliate_code` varchar(50) NOT NULL,
  `ambassador_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `program_name` varchar(255) DEFAULT NULL,
  `urgency` varchar(50) DEFAULT '',
  `follow_up_status` enum('pending','contacted','converted','lost') DEFAULT 'pending',
  `follow_up_notes` text DEFAULT NULL,
  `registered` tinyint(1) DEFAULT 0,
  `device_fingerprint` varchar(255) DEFAULT NULL,
  `source` varchar(50) DEFAULT 'promo_hub',
  `notified_to_ambassador` tinyint(1) DEFAULT 0,
  `notified_at` timestamp NULL DEFAULT NULL,
  `notification_method` varchar(50) DEFAULT NULL,
  `discount_applied` decimal(10,2) DEFAULT NULL,
  `first_used_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_affiliate_code` (`affiliate_code`),
  KEY `idx_ambassador_id` (`ambassador_id`),
  KEY `idx_program_id` (`program_id`),
  KEY `idx_follow_up_status` (`follow_up_status`),
  KEY `idx_registered` (`registered`),
  KEY `idx_deleted_at` (`deleted_at`),
  KEY `idx_first_used_at` (`first_used_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample affiliate usage data
INSERT INTO `affiliate_usage` (`id`, `user_name`, `user_phone`, `user_email`, `user_city`, `affiliate_code`, `ambassador_id`, `program_id`, `program_name`, `urgency`, `follow_up_status`, `follow_up_notes`, `registered`, `device_fingerprint`, `source`, `notified_to_ambassador`, `notified_at`, `notification_method`, `discount_applied`, `first_used_at`, `deleted_at`, `deleted_by`) VALUES
(1, 'tes', '081264323812', 'tes@gmail.com', NULL, 'AHMAD2024', 2, 1, 'Tes Program', '', 'pending', NULL, 0, 'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0MS4wLjAuMCBTYWZhcmkvNTM3LjM2LWlkLTo6MQ==', 'promo_hub', 0, NULL, NULL, 50000.00, '2025-11-08 13:41:17', NULL, NULL),
(2, 'tes maya', '081243527834', 'muhammad@gmail.com', NULL, 'MAYA2024', 3, 1, 'Tes Program', '', 'contacted', 'sementara di follow up', 0, 'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0MS4wLjAuMCBTYWZhcmkvNTM3LjM2LWlkLTo6MQ==', 'promo_hub', 1, '2025-11-08 13:42:43', 'click_to_chat', 50000.00, '2025-11-08 13:42:43', NULL, NULL),
(3, 'tescodefirdaus', '08953741232', 'tescodefirdaus@gmail.com', NULL, 'ZE-CAM-FIR786', 5, 1, 'Tes Program', '', 'converted', NULL, 1, 'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0Mi4wLjAuMCBTYWZhcmkvNTM3LjM2LWlkLGVuO3E9MC45LTo6MQ==', 'promo_hub', 1, '2025-11-13 10:26:51', 'click_to_chat', 50000.00, '2025-11-13 10:26:51', NULL, NULL);

-- ===================================================
-- TABLE: ambassadors
-- Purpose: Ambassador/affiliate directory
-- ===================================================

DROP TABLE IF EXISTS `ambassadors`;
CREATE TABLE `ambassadors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role` enum('Senior Ambassador','Campus Ambassador','Community Ambassador','Junior Ambassador') NOT NULL,
  `location` varchar(100) NOT NULL,
  `institution` varchar(255) DEFAULT NULL,
  `achievement` varchar(100) DEFAULT NULL,
  `commission` decimal(12,2) DEFAULT 0.00,
  `referrals` int(11) DEFAULT 0,
  `badge_text` varchar(50) DEFAULT NULL,
  `badge_variant` enum('premium','ambassador','success','info') DEFAULT 'ambassador',
  `image_url` varchar(255) DEFAULT NULL,
  `affiliate_code` varchar(20) NOT NULL,
  `testimonial` text DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT 15.00,
  `is_active` tinyint(1) DEFAULT 1,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `bank_account` varchar(50) DEFAULT NULL,
  `bank_name` varchar(50) DEFAULT NULL,
  `total_earnings` decimal(12,2) DEFAULT 0.00,
  `last_viewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `affiliate_code` (`affiliate_code`),
  KEY `idx_location` (`location`),
  KEY `idx_role` (`role`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample ambassadors data
INSERT INTO `ambassadors` (`id`, `name`, `role`, `location`, `institution`, `achievement`, `commission`, `referrals`, `badge_text`, `badge_variant`, `image_url`, `affiliate_code`, `testimonial`, `commission_rate`, `is_active`, `phone`, `email`, `address`, `bank_account`, `bank_name`, `total_earnings`, `last_viewed_at`, `created_at`, `updated_at`) VALUES
(1, 'Sarah Pratiwi', 'Senior Ambassador', 'Makassar', NULL, 'Top Recruiter', 8500000.00, 47, 'Ambassador Elite', 'premium', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop', 'SARAH2024', NULL, 25.00, 1, '+62821-1234-5678', 'sarah@zonaenglish.id', NULL, NULL, NULL, 0.00, NULL, NOW(), NOW()),
(2, 'Ahmad Rizki', 'Campus Ambassador', 'Kendari', NULL, 'Rising Star', 4200000.00, 23, 'Campus Leader', 'ambassador', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop', 'AHMAD2024', NULL, 20.00, 1, '+62821-2345-6789', 'ahmad@zonaenglish.id', NULL, NULL, NULL, 0.00, NULL, NOW(), NOW()),
(3, 'Maya Sari', 'Community Ambassador', 'Kolaka', NULL, 'Konsisten', 2800000.00, 15, 'Community Star', 'ambassador', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop', 'MAYA2024', NULL, 15.00, 1, '+62821-3456-7890', 'maya@zonaenglish.id', NULL, NULL, NULL, 0.00, NULL, NOW(), NOW());

-- ===================================================
-- TABLE: articles
-- Purpose: Blog/news content management
-- ===================================================

DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `author` varchar(100) DEFAULT 'Admin Zona English',
  `category` varchar(50) DEFAULT 'Grammar',
  `status` enum('Draft','Published','Archived') DEFAULT 'Draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `featured_image` varchar(500) DEFAULT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `likes_count` int(11) DEFAULT 0,
  `loves_count` int(11) DEFAULT 0,
  `comments_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  KEY `idx_published_at` (`published_at`),
  FULLTEXT KEY `idx_fulltext_search` (`title`,`excerpt`,`content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample articles
INSERT INTO `articles` (`id`, `title`, `slug`, `excerpt`, `content`, `author`, `category`, `status`, `published_at`, `featured_image`, `seo_title`, `seo_description`, `views`, `likes_count`, `loves_count`, `comments_count`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '50 Vocabulary Harian yang Wajib Dikuasai', '50-vocabulary-harian-wajib-dikuasai', 'Kumpulan 50 kosakata bahasa Inggris yang sering digunakan dalam percakapan sehari-hari.', '<h2>Vocabulary Essentials</h2><p>Berikut adalah 50 kata yang <em>wajib</em> kamu kuasai untuk percakapan sehari-hari:</p><h3>Greetings:</h3><ul><li>Hello - Halo</li><li>Good morning - Selamat pagi</li><li>How are you? - Apa kabar?</li></ul><p>Dengan menguasai vocabulary dasar ini, kamu akan lebih <strong>confident</strong> dalam berbicara bahasa Inggris!</p>', 'Sarah Teacher', 'Vocabulary', 'Published', NOW(), 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800', '50 Vocabulary Harian yang Wajib Dikuasai | Zona English', 'Kumpulan 50 kosakata bahasa Inggris untuk percakapan sehari-hari beserta contoh penggunaannya.', 0, 0, 0, 0, NOW(), NOW(), NULL),
(2, 'Cara Meningkatkan Speaking Skill dengan Percaya Diri', 'cara-meningkatkan-speaking-skill-percaya-diri', 'Strategi praktis untuk meningkatkan kemampuan berbicara bahasa Inggris tanpa takut salah.', '<h2>Speaking with Confidence</h2><p>Banyak orang takut berbicara bahasa Inggris karena <strong>takut salah</strong>. Padahal, salah adalah bagian dari proses belajar!</p><h3>5 Tips Meningkatkan Speaking:</h3><ol><li>Praktik berbicara setiap hari</li><li>Rekam diri sendiri</li><li>Join speaking club</li><li>Tonton film berbahasa Inggris</li><li>Jangan takut salah!</li></ol><p>Remember: <em>Practice makes perfect</em> 💪</p>', 'Michael English', 'Speaking', 'Published', NOW(), 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800', 'Cara Meningkatkan Speaking Skill dengan Percaya Diri | Zona English', 'Pelajari strategi praktis untuk meningkatkan kemampuan berbicara bahasa Inggris dengan percaya diri.', 0, 0, 0, 0, NOW(), NOW(), NULL);

-- ===================================================
-- TABLE: article_categories
-- Purpose: Article category management
-- ===================================================

DROP TABLE IF EXISTS `article_categories`;
CREATE TABLE `article_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default categories
INSERT INTO `article_categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Grammar', 'grammar', 'Articles about English grammar rules and usage', NOW(), NOW(), NULL),
(2, 'Vocabulary', 'vocabulary', 'Vocabulary building and word learning articles', NOW(), NOW(), NULL),
(3, 'Speaking', 'speaking', 'Tips and guides for improving speaking skills', NOW(), NOW(), NULL),
(4, 'Listening', 'listening', 'Listening comprehension and practice materials', NOW(), NOW(), NULL),
(5, 'Tips', 'tips', 'General English learning tips and strategies', NOW(), NOW(), NULL),
(6, 'News', 'news', 'Latest news and updates from Zona English', NOW(), NOW(), NULL);

-- ===================================================
-- TABLE: article_comments
-- Purpose: Article comment system
-- ===================================================

DROP TABLE IF EXISTS `article_comments`;
CREATE TABLE `article_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `user_email` varchar(100) NOT NULL,
  `comment` text NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- TABLE: article_hashtags
-- Purpose: Article hashtag/tag system
-- ===================================================

DROP TABLE IF EXISTS `article_hashtags`;
CREATE TABLE `article_hashtags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `hashtag` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_hashtag` (`hashtag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample hashtags
INSERT INTO `article_hashtags` (`id`, `article_id`, `hashtag`, `created_at`) VALUES
(1, 1, 'vocabulary', NOW()),
(2, 1, 'daily', NOW()),
(3, 1, 'conversation', NOW()),
(4, 2, 'speaking', NOW()),
(5, 2, 'confidence', NOW()),
(6, 2, 'fluency', NOW());

-- ===================================================
-- TABLE: article_images
-- Purpose: Store inline images for articles
-- ===================================================

DROP TABLE IF EXISTS `article_images`;
CREATE TABLE `article_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_article_id` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- TABLE: article_likes
-- Purpose: Track article likes/reactions
-- ===================================================

DROP TABLE IF EXISTS `article_likes`;
CREATE TABLE `article_likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `user_identifier` varchar(100) NOT NULL,
  `reaction_type` enum('like','love') DEFAULT 'like',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`article_id`,`user_identifier`),
  KEY `idx_article_id` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- TABLE: article_views
-- Purpose: Track article view statistics
-- ===================================================

DROP TABLE IF EXISTS `article_views`;
CREATE TABLE `article_views` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `user_identifier` varchar(100) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `viewed_at` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_view` (`article_id`,`user_identifier`,`viewed_at`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_viewed_at` (`viewed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- TABLE: countdown_batches
-- Purpose: Manage countdown timer batches
-- ===================================================

DROP TABLE IF EXISTS `countdown_batches`;
CREATE TABLE `countdown_batches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `batch_name` varchar(100) DEFAULT '',
  `title` varchar(255) DEFAULT '',
  `description` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `start_time` time DEFAULT '00:00:00',
  `end_date` date NOT NULL,
  `end_time` time DEFAULT '23:59:59',
  `timezone` varchar(50) DEFAULT 'WITA',
  `instructor` varchar(100) DEFAULT NULL,
  `location_mode` enum('Online','Offline','Hybrid') DEFAULT 'Online',
  `location_address` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `registration_deadline` date DEFAULT NULL,
  `target_students` int(11) DEFAULT 0,
  `current_students` int(11) DEFAULT 0,
  `status` enum('Draft','Active','Completed','Cancelled') DEFAULT 'Draft',
  `visibility` enum('Public','Private') DEFAULT 'Public',
  `is_active` tinyint(1) DEFAULT 0,
  `show_on_homepage` tinyint(1) DEFAULT 0,
  `background_color` varchar(7) DEFAULT '#2563eb',
  `text_color` varchar(7) DEFAULT '#ffffff',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_registration_deadline` (`registration_deadline`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- TABLE: gallery
-- Purpose: Media gallery management
-- ===================================================

DROP TABLE IF EXISTS `gallery`;
CREATE TABLE `gallery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `category` enum('Kids','Teens','Intensive') DEFAULT 'Kids',
  `description` text DEFAULT NULL,
  `media_type` enum('image','video') DEFAULT 'image',
  `youtube_url` varchar(500) DEFAULT NULL,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_media_type` (`media_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- TABLE: programs
-- Purpose: Program/course management
-- ===================================================

DROP TABLE IF EXISTS `programs`;
CREATE TABLE `programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `branch` enum('Pettarani','Kolaka','Kendari') NOT NULL,
  `type` varchar(50) NOT NULL,
  `program` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `quota` int(11) DEFAULT 0,
  `price` decimal(10,2) NOT NULL,
  `perks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`perks`)),
  `image_url` varchar(500) DEFAULT NULL,
  `wa_link` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_branch` (`branch`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_start_date` (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- TABLE: promo_claims
-- Purpose: Direct promo claims without codes
-- ===================================================

DROP TABLE IF EXISTS `promo_claims`;
CREATE TABLE `promo_claims` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(100) NOT NULL,
  `user_phone` varchar(20) NOT NULL,
  `user_email` varchar(100) DEFAULT NULL,
  `user_city` varchar(100) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `program_name` varchar(255) DEFAULT NULL,
  `program_branch` varchar(50) DEFAULT NULL,
  `program_type` varchar(50) DEFAULT NULL,
  `program_category` varchar(50) DEFAULT NULL,
  `urgency` enum('browsing','need_info','ready_to_register') DEFAULT 'browsing',
  `source` varchar(50) DEFAULT 'promo_hub',
  `device_fingerprint` varchar(255) DEFAULT NULL,
  `follow_up_status` enum('pending','contacted','converted','lost') DEFAULT 'pending',
  `follow_up_notes` text DEFAULT NULL,
  `follow_up_by` varchar(100) DEFAULT NULL,
  `registered` tinyint(1) DEFAULT 0,
  `registered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_follow_up_status` (`follow_up_status`),
  KEY `idx_urgency` (`urgency`),
  KEY `idx_program_id` (`program_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- TABLE: promo_codes
-- Purpose: Promo code management
-- ===================================================

DROP TABLE IF EXISTS `promo_codes`;
CREATE TABLE `promo_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed_amount') DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `min_purchase` decimal(10,2) DEFAULT 0.00,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `valid_from` timestamp NOT NULL DEFAULT current_timestamp(),
  `valid_until` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_valid_from` (`valid_from`),
  KEY `idx_valid_until` (`valid_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- TABLE: promo_usage
-- Purpose: Track promo code usage
-- ===================================================

DROP TABLE IF EXISTS `promo_usage`;
CREATE TABLE `promo_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `promo_code_id` int(11) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `user_phone` varchar(20) NOT NULL,
  `user_email` varchar(100) DEFAULT NULL,
  `program_name` varchar(255) DEFAULT NULL,
  `original_amount` decimal(10,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `final_amount` decimal(10,2) DEFAULT NULL,
  `follow_up_status` enum('pending','contacted','converted','lost') DEFAULT 'pending',
  `follow_up_notes` text DEFAULT NULL,
  `registered` tinyint(1) DEFAULT 0,
  `device_fingerprint` varchar(255) DEFAULT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_promo_code_id` (`promo_code_id`),
  KEY `idx_follow_up_status` (`follow_up_status`),
  KEY `idx_used_at` (`used_at`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger for promo_usage
DELIMITER $$
DROP TRIGGER IF EXISTS `after_promo_usage_insert`$$
CREATE TRIGGER `after_promo_usage_insert` AFTER INSERT ON `promo_usage` 
FOR EACH ROW 
BEGIN
    CALL UpdatePromoUsage(NEW.promo_code_id);
END$$

DROP TRIGGER IF EXISTS `after_promo_usage_delete`$$
CREATE TRIGGER `after_promo_usage_delete` AFTER DELETE ON `promo_usage` 
FOR EACH ROW 
BEGIN
    CALL UpdatePromoUsage(OLD.promo_code_id);
END$$
DELIMITER ;

-- ===================================================
-- TABLE: settings
-- Purpose: Application settings (key-value store)
-- ===================================================

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('text','number','boolean','json','url') DEFAULT 'text',
  `category` varchar(50) DEFAULT 'general',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_category` (`category`),
  KEY `idx_is_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default settings
INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `category`, `description`, `is_public`, `created_at`, `updated_at`) VALUES
(1, 'homepage_video_url', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'url', 'homepage', 'YouTube video URL for homepage hero section', 1, NOW(), NOW()),
(2, 'contact_wa_main', '+6282399627276', 'text', 'contact', 'Main WhatsApp contact number', 1, NOW(), NOW()),
(3, 'contact_wa_promo', '+6282188080688', 'text', 'contact', 'Promo WhatsApp contact number', 1, NOW(), NOW()),
(4, 'instagram_username', '@zonaenglish.id', 'text', 'social', 'Instagram username', 1, NOW(), NOW());

-- ===================================================
-- VIEWS: Analytics & Reports
-- ===================================================

-- View: Ambassador Performance Dashboard
DROP VIEW IF EXISTS `ambassador_performance`;
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
    COUNT(DISTINCT at.id) as total_transactions,
    COALESCE(SUM(CASE WHEN at.status = 'paid' THEN at.commission_amount ELSE 0 END), 0) as confirmed_earnings,
    COALESCE(SUM(CASE WHEN at.status = 'pending' THEN at.commission_amount ELSE 0 END), 0) as pending_earnings
FROM ambassadors a
LEFT JOIN affiliate_transactions at ON a.id = at.ambassador_id
GROUP BY a.id;

-- View: Promo Code Analytics
DROP VIEW IF EXISTS `promo_analytics`;
CREATE VIEW `promo_analytics` AS
SELECT 
    pc.id,
    pc.code,
    pc.name,
    pc.discount_value,
    pc.usage_limit,
    pc.used_count,
    COUNT(DISTINCT pu.id) as actual_usage,
    COALESCE(SUM(pu.discount_amount), 0) as total_discount_given,
    pc.valid_from,
    pc.valid_until,
    CASE 
        WHEN pc.is_active = 0 THEN 'Inactive'
        WHEN pc.valid_until < NOW() THEN 'Expired'
        WHEN pc.used_count >= pc.usage_limit THEN 'Limit Reached'
        ELSE 'Active'
    END as status
FROM promo_codes pc
LEFT JOIN promo_usage pu ON pc.id = pu.promo_code_id AND pu.deleted_at IS NULL
GROUP BY pc.id;

-- ===================================================
-- AUTO-INCREMENT RESET (Start from safe values)
-- ===================================================

ALTER TABLE `admin_users` AUTO_INCREMENT = 10;
ALTER TABLE `ambassadors` AUTO_INCREMENT = 10;
ALTER TABLE `articles` AUTO_INCREMENT = 10;
ALTER TABLE `article_categories` AUTO_INCREMENT = 10;
ALTER TABLE `programs` AUTO_INCREMENT = 10;
ALTER TABLE `promo_codes` AUTO_INCREMENT = 10;
ALTER TABLE `settings` AUTO_INCREMENT = 10;

-- ===================================================
-- FINAL COMMIT
-- ===================================================

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- ===================================================
-- IMPORT COMPLETE!
-- ===================================================
-- Database: dbpromoze
-- Username: dbpromoze
-- Password: Alanwalker009#
--
-- NEXT STEPS:
-- 1. Update backend/.env file:
--    DB_HOST=localhost
--    DB_PORT=3306
--    DB_USER=dbpromoze
--    DB_PASS=Alanwalker009#
--    DB_NAME=dbpromoze
--
-- 2. Test database connection
-- 3. Login with default admin:
--    Username: admin
--    Password: admin123
--
-- 4. IMPORTANT: Change admin password after first login!
-- ===================================================
