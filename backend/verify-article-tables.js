import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "",
  database: "zona_english_admin",
});

console.log("📋 Article Tables Structure:\n");

const tables = [
  "article_hashtags",
  "article_images",
  "article_likes",
  "article_comments",
];

for (const tableName of tables) {
  const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
  console.log(`✅ ${tableName}:`);
  console.log(`   Columns: ${columns.map((c) => c.Field).join(", ")}`);
  console.log("");
}

// Check if articles has deleted_at
const [articlesCols] = await db.query("DESCRIBE articles");
const hasDeletedAt = articlesCols.some((c) => c.Field === "deleted_at");
console.log(`articles table:`);
console.log(`   Has deleted_at column? ${hasDeletedAt ? "✅ YES" : "❌ NO"}`);

if (!hasDeletedAt) {
  console.log("\n⚠️  Adding deleted_at column to articles table...");
  await db.query(
    "ALTER TABLE articles ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at"
  );
  console.log("✅ Column added successfully");
}

await db.end();
console.log("\n✨ Verification complete!");
