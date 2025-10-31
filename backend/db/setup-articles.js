/**
 * Setup Articles Database Tables
 * Executes articles_schema.sql to create all required tables
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "./connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupArticlesTables() {
  try {
    console.log("📦 Setting up Articles database tables...\n");

    // Read SQL file (using simplified version without complex triggers)
    const sqlFile = path.join(__dirname, "articles_schema_simple.sql");
    const sqlContent = fs.readFileSync(sqlFile, "utf8");

    // Execute the entire SQL file as one batch (MySQL supports multiple statements)
    console.log("Executing SQL schema...\n");

    await db.query(sqlContent);

    console.log("✅ SQL schema executed successfully!");

    // Verify tables were created
    console.log("\n🔍 Verifying tables...");
    const [tables] = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('articles', 'article_images', 'article_hashtags', 'article_likes', 'article_comments', 'article_views')
    `);

    console.log(`\nFound ${tables.length} article tables:`);
    tables.forEach((table) => {
      console.log(`  ✓ ${table.TABLE_NAME || table.table_name}`);
    });

    // Check if we have sample data
    const [articleCount] = await db.query(
      "SELECT COUNT(*) as count FROM articles"
    );
    console.log(`\n📊 Sample articles in database: ${articleCount[0].count}`);

    if (articleCount[0].count === 0) {
      console.log("\n💡 Tip: Database tables are ready but empty.");
      console.log("   You can now create articles from the admin panel!");
    }

    console.log("\n✨ Articles database setup complete!\n");
  } catch (error) {
    console.error("\n❌ Fatal error during setup:");
    console.error(error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Run setup
setupArticlesTables();
