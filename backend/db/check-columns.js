import db from "./connection.js";

async function checkColumns() {
  try {
    console.log("Checking articles table structure...\n");

    const [columns] = await db.query("SHOW COLUMNS FROM articles");

    console.log("Available columns in articles table:");
    console.log("=".repeat(60));
    columns.forEach((col) => {
      console.log(
        `  ${col.Field.padEnd(20)} ${col.Type.padEnd(20)} ${
          col.Null === "YES" ? "NULL" : "NOT NULL"
        }`
      );
    });

    console.log("\n" + "=".repeat(60));
    console.log("\nTesting query from route...\n");

    const slug = "tips-mudah-belajar-grammar-bahasa-inggris";

    try {
      const [articles] = await db.query(
        `
        SELECT 
          a.*,
          GROUP_CONCAT(DISTINCT ah.hashtag) as hashtags
        FROM articles a
        LEFT JOIN article_hashtags ah ON a.id = ah.article_id
        WHERE a.slug = ? 
        AND a.status = 'Published'
        AND a.deleted_at IS NULL
        GROUP BY a.id
      `,
        [slug]
      );

      console.log("✅ Query SUCCESS - Found", articles.length, "article(s)");
      if (articles.length > 0) {
        console.log("\nArticle data:");
        console.log("  ID:", articles[0].id);
        console.log("  Title:", articles[0].title);
        console.log("  Slug:", articles[0].slug);
      }
    } catch (queryError) {
      console.log("❌ Query FAILED");
      console.log("Error:", queryError.message);
      console.log("SQL Message:", queryError.sqlMessage);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkColumns();
