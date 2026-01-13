/**
 * Migration: Add applicable_to column to promo_codes
 *
 * Adds the missing column 'applicable_to' which caused backend errors.
 *
 * Run: node backend/db/migrations/add-promo-applicable-to.js
 */

import db from "../connection.js";

async function migrate() {
  console.log("🚀 Starting Migration: Add applicable_to to promo_codes...\n");

  try {
    // Step 1: Check if column already exists to avoid errors
    console.log("📊 Step 1: Checking current schema...");
    const [columns] = await db.query(
      'SHOW COLUMNS FROM promo_codes LIKE "applicable_to"'
    );

    if (columns.length > 0) {
      console.log(
        '   ⚠️  Column "applicable_to" already exists. Skipping addition.'
      );
    } else {
      // Step 2: Add the column
      console.log('📝 Step 2: Adding "applicable_to" column...');
      await db.query(`
        ALTER TABLE promo_codes 
        ADD COLUMN applicable_to VARCHAR(50) DEFAULT 'all' AFTER valid_until
      `);
      console.log("   ✅ Column added successfully");
    }

    // Step 3: Verify
    console.log("\n✅ Verification:");
    const [cols] = await db.query("SHOW COLUMNS FROM promo_codes");
    const newCol = cols.find((c) => c.Field === "applicable_to");
    if (newCol) {
      console.log(`   - Found column: ${newCol.Field} (${newCol.Type})`);
    } else {
      throw new Error(
        "Verification failed: Column not found after alter table."
      );
    }

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await db.end();
    process.exit(0);
  }
}

migrate();
