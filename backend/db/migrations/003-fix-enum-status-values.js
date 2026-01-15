/**
 * Migration: Fix ENUM Status Values
 *
 * This migration aligns database ENUM values with frontend/backend code:
 *
 * 1. countdown_batches.status:
 *    OLD: 'Draft','Active','Completed','Cancelled'
 *    NEW: 'Draft','Active','Upcoming','Paused','Completed','Cancelled'
 *
 * 2. articles.status:
 *    OLD: 'Draft','Published','Archived'
 *    NEW: 'Draft','Published','Scheduled','Archived'
 *
 * Run: node backend/db/migrations/003-fix-enum-status-values.js
 */

import db from "../connection.js";

async function migrate() {
  console.log("🚀 Starting ENUM Status Values Migration...\n");

  try {
    // ============================================
    // STEP 1: Fix countdown_batches.status ENUM
    // ============================================
    console.log("📊 Step 1: Updating countdown_batches.status ENUM...");

    await db.query(`
      ALTER TABLE countdown_batches 
      MODIFY COLUMN status 
      ENUM('Draft','Active','Upcoming','Paused','Completed','Cancelled') 
      DEFAULT 'Draft'
    `);

    console.log("   ✅ countdown_batches.status ENUM updated");
    console.log("      Added: 'Upcoming', 'Paused'");
    console.log(
      "      Values: Draft, Active, Upcoming, Paused, Completed, Cancelled\n"
    );

    // ============================================
    // STEP 2: Fix articles.status ENUM
    // ============================================
    console.log("📝 Step 2: Updating articles.status ENUM...");

    await db.query(`
      ALTER TABLE articles 
      MODIFY COLUMN status 
      ENUM('Draft','Published','Scheduled','Archived') 
      DEFAULT 'Draft'
    `);

    console.log("   ✅ articles.status ENUM updated");
    console.log("      Added: 'Scheduled'");
    console.log("      Values: Draft, Published, Scheduled, Archived\n");

    // ============================================
    // STEP 3: Verify changes
    // ============================================
    console.log("🔍 Step 3: Verifying changes...");

    // Check countdown_batches
    const [countdownColumns] = await db.query(`
      SHOW COLUMNS FROM countdown_batches WHERE Field = 'status'
    `);

    if (countdownColumns.length > 0) {
      console.log(`   countdown_batches.status: ${countdownColumns[0].Type}`);
    }

    // Check articles
    const [articleColumns] = await db.query(`
      SHOW COLUMNS FROM articles WHERE Field = 'status'
    `);

    if (articleColumns.length > 0) {
      console.log(`   articles.status: ${articleColumns[0].Type}`);
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📋 Summary:");
    console.log(
      "   - countdown_batches: Now supports Upcoming & Paused statuses"
    );
    console.log("   - articles: Now supports Scheduled status");
    console.log(
      "\n🎉 All ENUM values are now aligned with frontend/backend code!"
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

migrate();
