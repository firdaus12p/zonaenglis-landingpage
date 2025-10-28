import db from "../db/connection.js";
import fs from "fs";

console.log("🔄 Creating affiliate_usage table...\n");

try {
  // Read SQL file
  const sql = fs.readFileSync(
    "./migrations/create_affiliate_usage_table.sql",
    "utf8"
  );

  // Split by semicolon and filter empty statements
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  console.log(`📝 Found ${statements.length} SQL statements\n`);

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);

    try {
      await db.query(stmt);
      console.log(`✅ Statement ${i + 1} executed successfully\n`);
    } catch (err) {
      if (err.code === "ER_TABLE_EXISTS_ERR") {
        console.log(`⚠️  Table already exists, skipping...\n`);
      } else {
        console.error(`❌ Error in statement ${i + 1}:`, err.message);
        console.log(`Statement: ${stmt.substring(0, 100)}...\n`);
      }
    }
  }

  // Verify table creation
  const [rows] = await db.query("SHOW TABLES LIKE 'affiliate_usage'");
  if (rows.length > 0) {
    console.log("✅ Table 'affiliate_usage' created successfully!\n");

    // Show table structure
    const [structure] = await db.query("DESCRIBE affiliate_usage");
    console.log("📊 Table structure:");
    console.table(structure);
  } else {
    console.log("❌ Table creation failed\n");
  }

  process.exit(0);
} catch (error) {
  console.error("❌ Migration failed:", error);
  process.exit(1);
}
