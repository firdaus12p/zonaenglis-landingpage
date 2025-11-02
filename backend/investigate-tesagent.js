import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

async function investigateTESAGENT() {
  try {
    const [promo] = await db.query(
      "SELECT * FROM promo_codes WHERE code = 'TESAGENT'"
    );

    if (promo.length === 0) {
      console.log("❌ Promo not found");
      process.exit(1);
    }

    const p = promo[0];

    console.log("=== INVESTIGATION: TESAGENT ===\n");

    // Timeline
    const createdAt = new Date(p.created_at);
    const updatedAt = new Date(p.updated_at);
    const diffSeconds = Math.round((updatedAt - createdAt) / 1000);

    console.log("📅 TIMELINE:");
    console.log(`  Created: ${createdAt.toLocaleString("id-ID")}`);
    console.log(`  Updated: ${updatedAt.toLocaleString("id-ID")}`);
    console.log(`  Time diff: ${diffSeconds} seconds`);
    console.log("");

    // Current state
    console.log("💾 DATABASE STATE:");
    console.log(`  used_count: ${p.used_count}`);
    console.log(`  usage_limit: ${p.usage_limit}`);
    console.log("");

    // Get usages
    const [usages] = await db.query(
      `SELECT id, user_name, user_phone, used_at, deleted_at
       FROM promo_usage 
       WHERE promo_code_id = ?
       ORDER BY used_at ASC`,
      [p.id]
    );

    console.log("📊 USAGE RECORDS:");
    console.log(`  Total: ${usages.length}`);
    console.log(`  Active: ${usages.filter((u) => !u.deleted_at).length}`);
    console.log(`  Deleted: ${usages.filter((u) => u.deleted_at).length}`);
    console.log("");

    if (usages.length > 0) {
      console.log("📝 USAGE DETAILS:");
      for (let i = 0; i < usages.length; i++) {
        const u = usages[i];
        const usedAt = new Date(u.used_at);
        const timeSinceCreated = Math.round((usedAt - createdAt) / 1000);

        console.log(`  ${i + 1}. ID: ${u.id}`);
        console.log(`     User: ${u.user_name} (${u.user_phone})`);
        console.log(`     Time: ${usedAt.toLocaleString("id-ID")}`);
        console.log(`     Delay: ${timeSinceCreated}s after promo created`);
        console.log(`     Status: ${u.deleted_at ? "DELETED" : "ACTIVE"}`);
        console.log("");
      }
    }

    // Analysis
    console.log("🔍 ANALYSIS:");

    if (diffSeconds === 0) {
      console.log("  ⚠️  Promo NEVER UPDATED after creation");
      console.log("  ⚠️  But used_count = " + p.used_count);
      if (p.used_count > 0) {
        console.log("  ❌ BUG: used_count should be 0 if never updated!");
      }
    } else {
      console.log(`  ✅ Promo was updated ${diffSeconds}s after creation`);
    }

    const activeCount = usages.filter((u) => !u.deleted_at).length;
    if (p.used_count !== activeCount) {
      console.log(
        `  ❌ MISMATCH: DB count (${p.used_count}) ≠ Active records (${activeCount})`
      );
      console.log(`  ❌ Difference: +${p.used_count - activeCount}`);

      if (usages.length === 1 && p.used_count === 2) {
        console.log("\n🐛 ROOT CAUSE IDENTIFIED:");
        console.log("   First usage incremented counter TWICE!");
        console.log("   Possible causes:");
        console.log(
          "   1. Validation endpoint also increments (unlikely - already checked)"
        );
        console.log("   2. /track endpoint called TWICE for first user");
        console.log("   3. Another hidden endpoint increments counter");
        console.log("   4. Database trigger auto-increments on first use");
      }
    } else {
      console.log(`  ✅ Count matches! (${p.used_count} = ${activeCount})`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.end();
  }
}

investigateTESAGENT();
