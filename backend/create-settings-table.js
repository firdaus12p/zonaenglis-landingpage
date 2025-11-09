import mysql from "mysql2/promise";
import fs from "fs";

const db = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "",
  database: "zona_english_admin",
  multipleStatements: true,
});

console.log("🔧 Creating settings table...\n");

try {
  const sql = fs.readFileSync("migrations/create_settings_table.sql", "utf8");

  // Split by semicolon and execute each statement
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    if (statement.includes("CREATE TABLE")) {
      console.log("📋 Creating settings table...");
    } else if (statement.includes("INSERT INTO")) {
      console.log("📝 Inserting default settings...");
    }

    try {
      await db.query(statement);
    } catch (err) {
      if (err.code === "ER_TABLE_EXISTS_CREATE") {
        console.log("   ⚠️  Table already exists");
      } else if (err.code === "ER_DUP_ENTRY") {
        console.log("   ⚠️  Some settings already exist, updating...");
      } else {
        throw err;
      }
    }
  }

  console.log("\n✅ Settings table created successfully\n");

  // Verify
  const [settings] = await db.query("SELECT COUNT(*) as count FROM settings");
  const [categories] = await db.query(
    "SELECT DISTINCT category FROM settings ORDER BY category"
  );

  console.log(`📊 Total settings: ${settings[0].count}`);
  console.log(`📂 Categories: ${categories.map((c) => c.category).join(", ")}`);
} catch (error) {
  console.error("❌ Error:", error.message);
  if (error.code) console.error("   Code:", error.code);
} finally {
  await db.end();
}
