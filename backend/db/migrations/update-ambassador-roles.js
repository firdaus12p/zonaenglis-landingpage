/**
 * Migration: Update Ambassador Roles
 *
 * Changes ENUM from old values to new 6-type system:
 * OLD: 'Senior Ambassador','Campus Ambassador','Community Ambassador','Junior Ambassador'
 * NEW: 'Affiliate Campus','Affiliate SMA','Affiliate SMP','Ambassador Campus','Ambassador SMA','Ambassador SMP'
 *
 * Run: node backend/db/migrations/update-ambassador-roles.js
 */

import db from "../connection.js";

async function migrate() {
  console.log("🚀 Starting Ambassador Role Migration...\n");

  try {
    // Step 1: Check current data
    console.log("📊 Step 1: Checking current ambassador data...");
    const [currentData] = await db.query(
      "SELECT id, name, role FROM ambassadors"
    );
    console.log(`   Found ${currentData.length} ambassadors\n`);

    if (currentData.length > 0) {
      console.log("   Current roles:");
      currentData.forEach((a) => console.log(`   - ${a.name}: ${a.role}`));
      console.log("");
    }

    // Step 2: Map old roles to new roles
    console.log("🔄 Step 2: Mapping old roles to new roles...");
    const roleMapping = {
      "Senior Ambassador": "Ambassador Campus",
      "Campus Ambassador": "Affiliate Campus",
      "Community Ambassador": "Affiliate SMA",
      "Junior Ambassador": "Affiliate SMP",
    };

    // Step 3: Update existing records to use a temporary text field
    console.log("📝 Step 3: Creating temporary column...");
    await db.query("ALTER TABLE ambassadors ADD COLUMN role_temp VARCHAR(50)");

    // Copy current values
    await db.query("UPDATE ambassadors SET role_temp = role");
    console.log("   ✅ Temporary column created and data copied\n");

    // Step 4: Drop the ENUM column
    console.log("🗑️  Step 4: Dropping old ENUM column...");
    await db.query("ALTER TABLE ambassadors DROP COLUMN role");
    console.log("   ✅ Old column dropped\n");

    // Step 5: Create new ENUM column with 6 values
    console.log("✨ Step 5: Creating new ENUM column with 6 types...");
    await db.query(`
      ALTER TABLE ambassadors ADD COLUMN role ENUM(
        'Affiliate Campus',
        'Affiliate SMA',
        'Affiliate SMP',
        'Ambassador Campus',
        'Ambassador SMA',
        'Ambassador SMP'
      ) NOT NULL DEFAULT 'Affiliate Campus' AFTER name
    `);
    console.log("   ✅ New ENUM column created\n");

    // Step 6: Migrate data from temp to new column
    console.log("🔀 Step 6: Migrating data to new roles...");
    for (const [oldRole, newRole] of Object.entries(roleMapping)) {
      const [result] = await db.query(
        "UPDATE ambassadors SET role = ? WHERE role_temp = ?",
        [newRole, oldRole]
      );
      if (result.affectedRows > 0) {
        console.log(
          `   ✅ "${oldRole}" → "${newRole}" (${result.affectedRows} records)`
        );
      }
    }
    console.log("");

    // Step 7: Drop temporary column
    console.log("🧹 Step 7: Cleaning up temporary column...");
    await db.query("ALTER TABLE ambassadors DROP COLUMN role_temp");
    console.log("   ✅ Temporary column removed\n");

    // Step 8: Update ambassador_performance view if exists
    console.log("🔧 Step 8: Updating ambassador_performance view...");
    try {
      await db.query(`
        CREATE OR REPLACE VIEW ambassador_performance AS
        SELECT 
          a.id,
          a.name,
          a.role,
          a.location,
          a.affiliate_code,
          a.commission_rate,
          a.referrals,
          a.total_earnings,
          COUNT(DISTINCT t.id) as total_transactions,
          COALESCE(SUM(CASE WHEN t.status IN ('confirmed', 'paid') THEN t.commission_amount ELSE 0 END), 0) as confirmed_earnings,
          COALESCE(SUM(CASE WHEN t.status = 'pending' THEN t.commission_amount ELSE 0 END), 0) as pending_earnings
        FROM ambassadors a
        LEFT JOIN affiliate_transactions t ON a.id = t.ambassador_id
        WHERE a.is_active = 1
        GROUP BY a.id
      `);
      console.log("   ✅ View updated\n");
    } catch (viewError) {
      console.log("   ⚠️  View update skipped (may not exist)\n");
    }

    // Step 9: Verify migration
    console.log("✅ Step 9: Verifying migration...");
    const [newData] = await db.query("SELECT id, name, role FROM ambassadors");
    console.log(`   Found ${newData.length} ambassadors with new roles:`);
    newData.forEach((a) => console.log(`   - ${a.name}: ${a.role}`));
    console.log("");

    console.log("🎉 Migration completed successfully!");
    console.log("");
    console.log("📋 New available roles:");
    console.log("   - Affiliate Campus");
    console.log("   - Affiliate SMA");
    console.log("   - Affiliate SMP");
    console.log("   - Ambassador Campus");
    console.log("   - Ambassador SMA");
    console.log("   - Ambassador SMP");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("");
    console.error("🔧 If migration partially failed, you may need to:");
    console.error(
      "   1. Check if role_temp column exists and drop it manually"
    );
    console.error("   2. Restore the role column from backup");
    process.exit(1);
  } finally {
    await db.end();
    process.exit(0);
  }
}

migrate();
