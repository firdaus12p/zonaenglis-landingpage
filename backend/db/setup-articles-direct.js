/**
 * Setup Articles Database Tables - Direct Execution
 */

import db from "./connection.js";

async function setupArticlesTables() {
  try {
    console.log("📦 Setting up Articles database tables...\n");

    // Drop old tables if they exist (to ensure clean slate)
    console.log("🗑️  Dropping old tables if they exist...");
    try {
      await db.query("DROP TABLE IF EXISTS article_views");
      await db.query("DROP TABLE IF EXISTS article_comments");
      await db.query("DROP TABLE IF EXISTS article_likes");
      await db.query("DROP TABLE IF EXISTS article_hashtags");
      await db.query("DROP TABLE IF EXISTS article_images");
      await db.query("DROP TABLE IF EXISTS articles");
      console.log("✅ Old tables dropped\n");
    } catch (error) {
      console.log("⏭️  No old tables to drop\n");
    }

    // 1. Articles Table
    console.log("Creating articles table...");
    await db.query(`
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
    `);
    console.log("✅ articles table created\n");

    // 2. Article Images Table
    console.log("Creating article_images table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS article_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        caption TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        INDEX idx_article_id (article_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ article_images table created\n");

    // 3. Article Hashtags Table
    console.log("Creating article_hashtags table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS article_hashtags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        hashtag VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_article_hashtag (article_id, hashtag),
        INDEX idx_hashtag (hashtag)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ article_hashtags table created\n");

    // 4. Article Likes Table
    console.log("Creating article_likes table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS article_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        user_identifier VARCHAR(255) NOT NULL,
        reaction_type ENUM('like', 'love') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_article_like (article_id, user_identifier),
        INDEX idx_article_reaction (article_id, reaction_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ article_likes table created\n");

    // 5. Article Comments Table
    console.log("Creating article_comments table...");
    await db.query(`
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
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        INDEX idx_article_status (article_id, status),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ article_comments table created\n");

    // 6. Article Views Table
    console.log("Creating article_views table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS article_views (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        user_identifier VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent VARCHAR(500),
        viewed_at DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_daily_view (article_id, user_identifier, viewed_at),
        INDEX idx_article_date (article_id, viewed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ article_views table created\n");

    // Insert sample data
    console.log("Inserting sample articles...");
    await db.query(`
      INSERT IGNORE INTO articles (
        id, title, slug, excerpt, content, author, category, 
        status, published_at, featured_image, seo_title, seo_description
      ) VALUES
      (1, 'Tips Mudah Belajar Grammar Bahasa Inggris', 'tips-mudah-belajar-grammar-bahasa-inggris', 
       'Pelajari cara efektif menguasai grammar dengan metode yang mudah dipahami.', 
       '<h2>Pengenalan Grammar</h2><p>Grammar adalah fondasi penting dalam mempelajari bahasa Inggris. Dengan memahami grammar, kamu akan lebih percaya diri dalam berbicara dan menulis.</p><h3>Tips Praktis:</h3><ol><li>Mulai dari dasar (Present Tense)</li><li>Praktik setiap hari 15 menit</li><li>Gunakan dalam percakapan nyata</li></ol><p><strong>Ingat:</strong> Konsistensi lebih penting daripada durasi!</p>', 
       'Admin Zona English', 'Grammar', 'Published', NOW(), 
       'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800', 
       'Tips Mudah Belajar Grammar Bahasa Inggris | Zona English', 
       'Pelajari cara efektif menguasai grammar bahasa Inggris dengan metode yang mudah dipahami dan praktis.'),
      (2, '50 Vocabulary Harian yang Wajib Dikuasai', '50-vocabulary-harian-wajib-dikuasai', 
       'Kumpulan 50 kosakata bahasa Inggris yang sering digunakan dalam percakapan sehari-hari.', 
       '<h2>Vocabulary Essentials</h2><p>Berikut adalah 50 kata yang <em>wajib</em> kamu kuasai untuk percakapan sehari-hari:</p><h3>Greetings:</h3><ul><li>Hello - Halo</li><li>Good morning - Selamat pagi</li><li>How are you? - Apa kabar?</li></ul><p>Dengan menguasai vocabulary dasar ini, kamu akan lebih <strong>confident</strong> dalam berbicara bahasa Inggris!</p>', 
       'Sarah Teacher', 'Vocabulary', 'Published', NOW(), 
       'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800', 
       '50 Vocabulary Harian yang Wajib Dikuasai | Zona English', 
       'Kumpulan 50 kosakata bahasa Inggris untuk percakapan sehari-hari beserta contoh penggunaannya.'),
      (3, 'Cara Meningkatkan Speaking Skill dengan Percaya Diri', 'cara-meningkatkan-speaking-skill-percaya-diri', 
       'Strategi praktis untuk meningkatkan kemampuan berbicara bahasa Inggris tanpa takut salah.', 
       '<h2>Speaking with Confidence</h2><p>Banyak orang takut berbicara bahasa Inggris karena <strong>takut salah</strong>. Padahal, salah adalah bagian dari proses belajar!</p><h3>5 Tips Meningkatkan Speaking:</h3><ol><li>Praktik berbicara setiap hari</li><li>Rekam diri sendiri</li><li>Join speaking club</li><li>Tonton film berbahasa Inggris</li><li>Jangan takut salah!</li></ol><p>Remember: <em>Practice makes perfect</em> 💪</p>', 
       'Michael English', 'Speaking', 'Published', NOW(), 
       'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800', 
       'Cara Meningkatkan Speaking Skill dengan Percaya Diri | Zona English', 
       'Pelajari strategi praktis untuk meningkatkan kemampuan berbicara bahasa Inggris dengan percaya diri.')
    `);
    console.log("✅ Sample articles inserted\n");

    // Insert sample hashtags
    console.log("Inserting sample hashtags...");
    await db.query(`
      INSERT IGNORE INTO article_hashtags (article_id, hashtag) VALUES
      (1, 'grammar'), (1, 'tips'), (1, 'belajar'), (1, 'pemula'),
      (2, 'vocabulary'), (2, 'daily'), (2, 'conversation'), (2, 'practice'),
      (3, 'speaking'), (3, 'confidence'), (3, 'fluency'), (3, 'practice')
    `);
    console.log("✅ Sample hashtags inserted\n");

    // Verify
    console.log("=".repeat(60));
    const [tables] = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('articles', 'article_images', 'article_hashtags', 'article_likes', 'article_comments', 'article_views')
      ORDER BY table_name
    `);

    console.log(`\n✅ Found ${tables.length} article tables:`);
    tables.forEach((table) => {
      console.log(`   ✓ ${table.TABLE_NAME || table.table_name}`);
    });

    const [articleCount] = await db.query(
      "SELECT COUNT(*) as count FROM articles WHERE status = 'Published'"
    );
    console.log(`\n📊 Published articles: ${articleCount[0].count}`);

    const [hashtagCount] = await db.query(
      "SELECT COUNT(DISTINCT hashtag) as count FROM article_hashtags"
    );
    console.log(`📊 Unique hashtags: ${hashtagCount[0].count}`);

    console.log("\n✨ Articles database setup complete!");
    console.log("🚀 You can now visit http://localhost:5173/articles\n");
  } catch (error) {
    console.error("\n❌ Fatal error during setup:");
    console.error(error.message);
    if (error.code) console.error(`Error code: ${error.code}`);
    process.exit(1);
  } finally {
    await db.end();
  }
}

setupArticlesTables();
