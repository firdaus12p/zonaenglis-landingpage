-- =====================================================
-- ZONA ENGLISH - ARTICLES SYSTEM DATABASE SCHEMA
-- =====================================================
-- Created: October 31, 2025
-- Purpose: Complete article management with engagement tracking
-- =====================================================

USE zona_english_admin;

-- =====================================================
-- TABLE 1: articles (Main article content)
-- =====================================================
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  author VARCHAR(100) NOT NULL DEFAULT 'Admin',
  category ENUM('Grammar', 'Vocabulary', 'Speaking', 'Listening', 'Tips', 'News', 'Culture', 'Technology') NOT NULL,
  status ENUM('Published', 'Draft', 'Scheduled', 'Archived') NOT NULL DEFAULT 'Draft',
  featured BOOLEAN DEFAULT FALSE,
  
  -- SEO Fields
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT,
  
  -- Featured Image
  featured_image VARCHAR(255),
  
  -- Publishing
  published_at DATETIME,
  scheduled_at DATETIME,
  
  -- Tracking
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  loves INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  -- Indexes
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_published_at (published_at),
  INDEX idx_featured (featured),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 2: article_images (Additional article images)
-- =====================================================
CREATE TABLE IF NOT EXISTS article_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  caption TEXT,
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_article_id (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 3: article_hashtags (Article tags/hashtags)
-- =====================================================
CREATE TABLE IF NOT EXISTS article_hashtags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  hashtag VARCHAR(100) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_article_id (article_id),
  INDEX idx_hashtag (hashtag),
  UNIQUE KEY unique_article_hashtag (article_id, hashtag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 4: article_likes (Track likes from users)
-- =====================================================
CREATE TABLE IF NOT EXISTS article_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_identifier VARCHAR(255) NOT NULL COMMENT 'IP address, user ID, or session ID',
  reaction_type ENUM('like', 'love') NOT NULL DEFAULT 'like',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_article_id (article_id),
  INDEX idx_user_identifier (user_identifier),
  UNIQUE KEY unique_user_article_like (article_id, user_identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 5: article_comments (User comments on articles)
-- =====================================================
CREATE TABLE IF NOT EXISTS article_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(255),
  user_identifier VARCHAR(255) NOT NULL COMMENT 'IP address or session ID',
  comment TEXT NOT NULL,
  
  status ENUM('Approved', 'Pending', 'Spam', 'Deleted') NOT NULL DEFAULT 'Pending',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_article_id (article_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 6: article_views (Track article views)
-- =====================================================
CREATE TABLE IF NOT EXISTS article_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_identifier VARCHAR(255) NOT NULL COMMENT 'IP address or session ID',
  user_agent TEXT,
  
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_article_id (article_id),
  INDEX idx_viewed_at (viewed_at),
  INDEX idx_user_identifier (user_identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TRIGGERS: Auto-update article engagement counts
-- =====================================================

-- Trigger: Update likes count when like added
DELIMITER $$
CREATE TRIGGER after_article_like_insert
AFTER INSERT ON article_likes
FOR EACH ROW
BEGIN
  IF NEW.reaction_type = 'like' THEN
    UPDATE articles SET likes = likes + 1 WHERE id = NEW.article_id;
  ELSEIF NEW.reaction_type = 'love' THEN
    UPDATE articles SET loves = loves + 1 WHERE id = NEW.article_id;
  END IF;
END$$
DELIMITER ;

-- Trigger: Update likes count when like removed
DELIMITER $$
CREATE TRIGGER after_article_like_delete
AFTER DELETE ON article_likes
FOR EACH ROW
BEGIN
  IF OLD.reaction_type = 'like' THEN
    UPDATE articles SET likes = GREATEST(0, likes - 1) WHERE id = OLD.article_id;
  ELSEIF OLD.reaction_type = 'love' THEN
    UPDATE articles SET loves = GREATEST(0, loves - 1) WHERE id = OLD.article_id;
  END IF;
END$$
DELIMITER ;

-- Trigger: Update comments count when comment added
DELIMITER $$
CREATE TRIGGER after_comment_insert
AFTER INSERT ON article_comments
FOR EACH ROW
BEGIN
  IF NEW.status = 'Approved' THEN
    UPDATE articles SET comments_count = comments_count + 1 WHERE id = NEW.article_id;
  END IF;
END$$
DELIMITER ;

-- Trigger: Update comments count when comment status changes
DELIMITER $$
CREATE TRIGGER after_comment_update
AFTER UPDATE ON article_comments
FOR EACH ROW
BEGIN
  IF OLD.status != 'Approved' AND NEW.status = 'Approved' THEN
    UPDATE articles SET comments_count = comments_count + 1 WHERE id = NEW.article_id;
  ELSEIF OLD.status = 'Approved' AND NEW.status != 'Approved' THEN
    UPDATE articles SET comments_count = GREATEST(0, comments_count - 1) WHERE id = NEW.article_id;
  END IF;
END$$
DELIMITER ;

-- Trigger: Update views count when view tracked
DELIMITER $$
CREATE TRIGGER after_article_view_insert
AFTER INSERT ON article_views
FOR EACH ROW
BEGIN
  UPDATE articles SET views = views + 1 WHERE id = NEW.article_id;
END$$
DELIMITER ;

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

INSERT INTO articles (title, slug, excerpt, content, author, category, status, featured, seo_title, seo_description, featured_image, published_at) VALUES
('Tips Mudah Belajar Grammar Bahasa Inggris untuk Pemula', 'tips-mudah-belajar-grammar-bahasa-inggris-pemula', 
 'Pelajari cara efektif menguasai grammar bahasa Inggris dengan metode yang mudah dipahami dan praktis untuk diterapkan.',
 '<h2>Pengenalan Grammar Bahasa Inggris</h2><p>Grammar adalah fondasi penting dalam belajar bahasa Inggris...</p>',
 'Admin', 'Grammar', 'Published', TRUE,
 'Tips Mudah Belajar Grammar Bahasa Inggris untuk Pemula | Zona English',
 'Pelajari cara efektif menguasai grammar bahasa Inggris dengan metode yang mudah dipahami. Cocok untuk pemula yang ingin belajar bahasa Inggris.',
 '/uploads/articles/grammar-tips.jpg',
 NOW()),

('50 Vocabulary Harian yang Wajib Dikuasai', '50-vocabulary-harian-wajib-dikuasai',
 'Kumpulan 50 kosakata bahasa Inggris yang sering digunakan dalam percakapan sehari-hari beserta contoh penggunaannya.',
 '<h2>Vocabulary Dasar</h2><p>Berikut adalah 50 vocabulary yang sering digunakan...</p>',
 'Sarah Teacher', 'Vocabulary', 'Published', FALSE,
 '50 Vocabulary Harian yang Wajib Dikuasai | Zona English',
 'Kumpulan 50 kosakata bahasa Inggris yang sering digunakan dalam percakapan sehari-hari.',
 '/uploads/articles/vocabulary-daily.jpg',
 NOW()),

('Cara Meningkatkan Kemampuan Speaking dengan Mudah', 'cara-meningkatkan-kemampuan-speaking',
 'Praktik speaking yang efektif untuk meningkatkan kemampuan berbicara bahasa Inggris dengan percaya diri.',
 '<h2>Teknik Speaking</h2><p>Speaking adalah skill yang paling penting...</p>',
 'John Doe', 'Speaking', 'Draft', FALSE,
 'Cara Meningkatkan Kemampuan Speaking | Zona English',
 'Praktik speaking yang efektif untuk meningkatkan kemampuan berbicara bahasa Inggris.',
 NULL,
 NULL);

-- Add hashtags
INSERT INTO article_hashtags (article_id, hashtag) VALUES
(1, 'grammar'), (1, 'tips'), (1, 'pemula'), (1, 'belajar'),
(2, 'vocabulary'), (2, 'daily'), (2, 'conversation'), (2, 'practice'),
(3, 'speaking'), (3, 'confidence'), (3, 'fluency');

-- =====================================================
-- VIEWS: Useful query views
-- =====================================================

CREATE OR REPLACE VIEW article_stats AS
SELECT 
  a.id,
  a.title,
  a.slug,
  a.category,
  a.status,
  a.views,
  a.likes,
  a.loves,
  a.comments_count,
  COUNT(DISTINCT ah.hashtag) as hashtag_count,
  COUNT(DISTINCT ai.id) as image_count,
  a.published_at,
  a.created_at
FROM articles a
LEFT JOIN article_hashtags ah ON a.id = ah.article_id
LEFT JOIN article_images ai ON a.id = ai.article_id
WHERE a.deleted_at IS NULL
GROUP BY a.id;

-- =====================================================
-- INDEXES for performance
-- =====================================================

-- Additional composite indexes
CREATE INDEX idx_status_published ON articles(status, published_at);
CREATE INDEX idx_category_status ON articles(category, status);
CREATE INDEX idx_featured_status ON articles(featured, status);

-- =====================================================
-- CLEANUP: Auto-purge old soft-deleted records (optional)
-- =====================================================

-- Delete comments soft-deleted >30 days ago
DELETE FROM article_comments 
WHERE deleted_at IS NOT NULL 
AND deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'Articles system tables created successfully!' as Status;
SELECT COUNT(*) as ArticlesCount FROM articles;
SELECT COUNT(*) as HashtagsCount FROM article_hashtags;
