// Migration Runner Script
// Usage: node db/run-migration.js db/migrations/002-add-soft-delete-columns.sql

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "./connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    // Get migration file path from command line argument
    const migrationFile = process.argv[2];

    if (!migrationFile) {
      console.error("❌ Error: Please provide migration file path");
      console.log(
        "Usage: node db/run-migration.js db/migrations/002-add-soft-delete-columns.sql"
      );
      process.exit(1);
    }

    // Resolve absolute path
    const absolutePath = path.resolve(process.cwd(), migrationFile);

    console.log("🔄 Running migration...");
    console.log(`📁 File: ${migrationFile}`);
    console.log("");

    // Read SQL file
    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ Migration file not found: ${absolutePath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(absolutePath, "utf8");

    // Split by semicolon to handle multiple statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statement(s) to execute`);
    console.log("");

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);

      try {
        await db.query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        // Check if error is about column already existing
        if (error.code === "ER_DUP_FIELDNAME") {
          console.log(`⚠️  Column already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log("");
    console.log("✅ Migration completed successfully!");
    console.log("");

    // Verify columns were added
    const [columns] = await db.query("SHOW COLUMNS FROM affiliate_usage");
    const hasDeletedAt = columns.some((col) => col.Field === "deleted_at");
    const hasDeletedBy = columns.some((col) => col.Field === "deleted_by");

    console.log("📊 Verification:");
    console.log(
      `   deleted_at column: ${hasDeletedAt ? "✅ EXISTS" : "❌ NOT FOUND"}`
    );
    console.log(
      `   deleted_by column: ${hasDeletedBy ? "✅ EXISTS" : "❌ NOT FOUND"}`
    );
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("❌ Migration failed:");
    console.error(error.message);
    console.error("");
    process.exit(1);
  }
}

runMigration();
