import db from "./connection.js";

async function checkArticle() {
  try {
    const slug = "tips-mudah-belajar-grammar-bahasa-inggris";

    console.log("Checking article with slug:", slug);
    console.log("=".repeat(50));

    // Check if article exists
    const [articles] = await db.query(
      "SELECT id, title, slug, status, deleted_at, published_at FROM articles WHERE slug = ?",
      [slug]
    );

    if (articles.length === 0) {
      console.log("❌ Article NOT FOUND");
    } else {
      console.log("✅ Article FOUND:");
      articles.forEach((a) => {
        console.log("  ID:", a.id);
        console.log("  Title:", a.title);
        console.log("  Slug:", a.slug);
        console.log("  Status:", a.status);
        console.log("  Published At:", a.published_at);
        console.log("  Deleted At:", a.deleted_at);
        console.log("");
      });
    }

    // Check with WHERE conditions from API
    console.log("\nChecking with API WHERE conditions:");
    console.log("(status = 'Published' AND deleted_at IS NULL)");
    console.log("-".repeat(50));

    const [publishedArticles] = await db.query(
      `SELECT id, title, slug, status, deleted_at, published_at 
       FROM articles 
       WHERE slug = ? 
       AND status = 'Published' 
       AND deleted_at IS NULL`,
      [slug]
    );

    if (publishedArticles.length === 0) {
      console.log("❌ Article NOT FOUND with API conditions");
      console.log("\nPossible reasons:");
      if (articles.length > 0) {
        const article = articles[0];
        if (article.status !== "Published") {
          console.log(
            "  - Status is '" + article.status + "' (should be 'Published')"
          );
        }
        if (article.deleted_at !== null) {
          console.log(
            "  - Article is deleted (deleted_at:",
            article.deleted_at + ")"
          );
        }
      }
    } else {
      console.log("✅ Article FOUND with API conditions");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkArticle();
