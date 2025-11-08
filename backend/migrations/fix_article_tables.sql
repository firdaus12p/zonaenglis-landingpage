-- Fix missing article-related tables
-- Backend code expects relational tables but schema only has articles table

USE zona_english_admin;

-- ==============================================
-- TABLE: article_hashtags
-- Stores hashtags/tags for articles
-- ==============================================
CREATE TABLE IF NOT EXISTS `article_hashtags` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `article_id` INT NOT NULL,
  `hashtag` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_article_id` (`article_id`),
  INDEX `idx_hashtag` (`hashtag`),
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==============================================
-- TABLE: article_images
-- Stores additional images for articles (gallery)
-- ==============================================
CREATE TABLE IF NOT EXISTS `article_images` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `article_id` INT NOT NULL,
  `image_url` TEXT NOT NULL,
  `caption` VARCHAR(200),
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_article_id` (`article_id`),
  INDEX `idx_display_order` (`display_order`),
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==============================================
-- TABLE: article_likes
-- Stores reactions (likes/loves) for articles
-- ==============================================
CREATE TABLE IF NOT EXISTS `article_likes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `article_id` INT NOT NULL,
  `reaction_type` ENUM('like', 'love') DEFAULT 'like',
  `user_ip` VARCHAR(45), -- For anonymous reactions
  `user_identifier` VARCHAR(100), -- Cookie/session ID
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_article_id` (`article_id`),
  INDEX `idx_reaction_type` (`reaction_type`),
  INDEX `idx_user_identifier` (`user_identifier`),
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_reaction` (`article_id`, `user_identifier`)
) ENGINE=InnoDB;

-- ==============================================
-- TABLE: article_comments
-- Stores comments on articles
-- ==============================================
CREATE TABLE IF NOT EXISTS `article_comments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `article_id` INT NOT NULL,
  `parent_comment_id` INT DEFAULT NULL, -- For nested replies
  `author_name` VARCHAR(100) NOT NULL,
  `author_email` VARCHAR(100),
  `content` TEXT NOT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected', 'Spam') DEFAULT 'Pending',
  `user_ip` VARCHAR(45),
  `user_agent` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_article_id` (`article_id`),
  INDEX `idx_parent_comment_id` (`parent_comment_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_comment_id`) REFERENCES `article_comments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==============================================
-- TABLE: article_views
-- Track article views with rate limiting (one view per user per day)
-- ==============================================
CREATE TABLE IF NOT EXISTS `article_views` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `article_id` INT NOT NULL,
  `user_identifier` VARCHAR(100) NOT NULL, -- IP address or cookie ID
  `user_agent` VARCHAR(255),
  `viewed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_article_id` (`article_id`),
  INDEX `idx_user_identifier` (`user_identifier`),
  INDEX `idx_viewed_at` (`viewed_at`),
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_daily_view` (`article_id`, `user_identifier`, `viewed_at`)
) ENGINE=InnoDB;

-- ==============================================
-- Add deleted_at column to articles table
-- For soft delete functionality
-- ==============================================
ALTER TABLE `articles` 
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL
  AFTER `updated_at`;

-- Add index for soft delete queries
CREATE INDEX IF NOT EXISTS `idx_deleted_at` ON `articles`(`deleted_at`);

-- Verify the tables were created
SHOW TABLES LIKE 'article%';
