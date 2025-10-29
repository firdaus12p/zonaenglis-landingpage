/**
 * Auto Migration Script
 * Runs database migrations automatically using existing DB connection
 */

import db from "./db/connection.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATION_FILE = path.join(
  __dirname,
  "migrations",
  "add_last_viewed_to_ambassadors.sql"
);

console.log("\n================================================");
console.log("  DATABASE MIGRATION - Badge Feature");
console.log("================================================\n");

async function runMigration() {
  try {
    // Read migration file
    console.log("📄 Reading migration file...");
    const migrationSQL = fs.readFileSync(MIGRATION_FILE, "utf8");

    // Split by semicolon and clean up statements
    // Remove comments and empty lines
    const statements = migrationSQL
      .split(";")
      .map((s) => {
        // Remove single-line comments
        return s
          .split("\n")
          .filter((line) => !line.trim().startsWith("--"))
          .join("\n")
          .trim();
      })
      .filter((s) => s.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);

      try {
        await db.query(statement);
        console.log(`✅ Statement ${i + 1} completed`);
      } catch (error) {
        if (error.code === "ER_DUP_FIELDNAME") {
          console.log(`⚠️  Column already exists (skipping)`);
        } else if (error.code === "ER_DUP_KEYNAME") {
          console.log(`⚠️  Index already exists (skipping)`);
        } else {
          throw error;
        }
      }
    }

    console.log("\n✅ Migration completed successfully!\n");

    // Verify migration
    console.log("🔍 Verifying migration...");
    const [columns] = await db.query(
      "SHOW COLUMNS FROM ambassadors LIKE 'last_viewed_at'"
    );

    if (columns.length > 0) {
      console.log('✅ Column "last_viewed_at" verified!');
      console.log("📊 Column details:", columns[0]);

      // Check index
      const [indexes] = await db.query(
        "SHOW INDEX FROM ambassadors WHERE Column_name = 'last_viewed_at'"
      );

      if (indexes.length > 0) {
        console.log('✅ Index "idx_last_viewed" verified!');
      } else {
        console.log("⚠️  Index not found (might need manual creation)");
      }

      console.log("\n================================================");
      console.log("  ✅ MIGRATION SUCCESSFUL!");
      console.log("================================================\n");
      console.log("Next steps:");
      console.log("1. Restart backend server");
      console.log("2. Test badge feature in admin dashboard");
      console.log("3. Badge should appear for new leads\n");
    } else {
      console.log("❌ Verification failed - column not found");
    }
  } catch (error) {
    console.error("\n❌ Migration failed!");
    console.error("Error:", error.message);
    console.error("\nIf column already exists, this is normal.");
    console.error("Otherwise, try manual migration via phpMyAdmin.\n");
    console.error("SQL to run manually:");
    console.log(fs.readFileSync(MIGRATION_FILE, "utf8"));
    process.exit(1);
  } finally {
    // Close database connection
    await db.end();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

// Run migration
runMigration();
