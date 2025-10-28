// Script to run affiliate_usage table migration
import db from "../db/connection.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log("\n🔄 Running affiliate_usage table migration...\n");

    // Read SQL file
    const sqlFile = path.join(__dirname, "create_affiliate_usage_table.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    // Split by semicolon and filter out empty statements
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    // Execute each statement
    for (const statement of statements) {
      if (statement) {
        await db.query(statement);
        console.log("✅ Executed:", statement.substring(0, 50) + "...");
      }
    }

    console.log("\n✅ Migration completed successfully!\n");

    // Verify table was created
    const [tables] = await db.query("SHOW TABLES LIKE 'affiliate_usage'");
    if (tables.length > 0) {
      console.log("✅ Table 'affiliate_usage' verified");

      // Show table structure
      const [structure] = await db.query("DESCRIBE affiliate_usage");
      console.log("\n📋 Table Structure:");
      console.log("Field                 | Type");
      console.log("-".repeat(50));
      structure.forEach((field) => {
        console.log(`${field.Field.padEnd(20)} | ${field.Type}`);
      });
    }

    // Show views
    console.log("\n📊 Created Views:");
    const [views] = await db.query(
      "SHOW FULL TABLES WHERE Table_type = 'VIEW'"
    );
    views.forEach((view) => {
      const viewName = Object.values(view)[0];
      if (viewName.startsWith("v_ambassador_")) {
        console.log(`  ✅ ${viewName}`);
      }
    });

    console.log("\n🎉 Ready to track affiliate usage!\n");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

runMigration();
