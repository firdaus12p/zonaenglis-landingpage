import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function checkPromoActivity() {
  try {
    // Get all promo codes to check for similar issues
    const [allPromos] = await db.query(
      `SELECT id, code, name, used_count, usage_limit, created_at, updated_at 
       FROM promo_codes 
       ORDER BY created_at DESC 
       LIMIT 20`
    );

    console.log("=== LAST 20 PROMO CODES ===\n");

    for (const promo of allPromos) {
      // Get actual usage count
      const [usages] = await db.query(
        `SELECT COUNT(*) as count FROM promo_usage 
         WHERE promo_code_id = ? AND deleted_at IS NULL`,
        [promo.id]
      );

      const actualCount = usages[0].count;
      const dbCount = promo.used_count;
      const mismatch = dbCount !== actualCount;

      console.log(`Code: ${promo.code} (${promo.name})`);
      console.log(`  ID: ${promo.id}`);
      console.log(`  DB used_count: ${dbCount}`);
      console.log(`  Actual usages: ${actualCount}`);
      console.log(`  Usage limit: ${promo.usage_limit}`);
      console.log(
        `  Created: ${new Date(promo.created_at).toLocaleString("id-ID")}`
      );
      console.log(
        `  Updated: ${new Date(promo.updated_at).toLocaleString("id-ID")}`
      );

      if (mismatch) {
        console.log(`  ⚠️ MISMATCH! Difference: ${dbCount - actualCount}`);
      } else {
        console.log(`  ✅ Counts match`);
      }

      console.log("");
    }

    // Check for any patterns
    const [mismatches] = await db.query(
      `SELECT 
        p.id,
        p.code,
        p.name,
        p.used_count as db_count,
        COUNT(u.id) as actual_count,
        (p.used_count - COUNT(u.id)) as difference
       FROM promo_codes p
       LEFT JOIN promo_usage u ON p.id = u.promo_code_id AND u.deleted_at IS NULL
       GROUP BY p.id
       HAVING db_count != actual_count
       ORDER BY difference DESC`
    );

    if (mismatches.length > 0) {
      console.log("=== FOUND MISMATCHES ===\n");
      console.log(`Total promo codes with mismatches: ${mismatches.length}\n`);

      for (const m of mismatches) {
        console.log(
          `${m.code}: DB=${m.db_count}, Actual=${m.actual_count}, Diff=+${m.difference}`
        );
      }
    } else {
      console.log("✅ No mismatches found in any promo codes");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.end();
  }
}

checkPromoActivity();
