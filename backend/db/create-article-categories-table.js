import db from "./connection.js";

const createArticleCategoriesTable = async () => {
  try {
    console.log("🔄 Creating article_categories table...");

    // Create table
    await db.query(`
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
    `);

    console.log("✅ article_categories table created successfully");

    // Insert default categories
    console.log("🔄 Inserting default categories...");

    const defaultCategories = [
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

    for (const category of defaultCategories) {
      await db.query(
        `INSERT INTO article_categories (name, slug, description) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         description = VALUES(description)`,
        [category.name, category.slug, category.description]
      );
    }

    console.log("✅ Default categories inserted successfully");
    console.log("\n📊 Current categories:");

    const [categories] = await db.query(
      "SELECT id, name, slug, description FROM article_categories WHERE deleted_at IS NULL"
    );
    console.table(categories);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createArticleCategoriesTable();
