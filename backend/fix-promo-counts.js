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

async function fixPromoCounts() {
  try {
    console.log("🔍 Scanning for promo codes with incorrect used_count...\n");

    // Find all mismatches
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
       GROUP BY p.id, p.code, p.name, p.used_count
       HAVING db_count != actual_count
       ORDER BY difference DESC`
    );

    if (mismatches.length === 0) {
      console.log("✅ No mismatches found! All promo counts are accurate.");
      process.exit(0);
    }

    console.log(
      `⚠️  Found ${mismatches.length} promo codes with incorrect counts:\n`
    );

    for (const m of mismatches) {
      console.log(`${m.code} (${m.name})`);
      console.log(`  Current DB count: ${m.db_count}`);
      console.log(`  Actual usage count: ${m.actual_count}`);
      console.log(`  Needs correction: -${m.difference}`);
      console.log("");
    }

    console.log("🔧 Fixing counts...\n");

    // Fix each mismatch
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (const m of mismatches) {
        await connection.query(
          "UPDATE promo_codes SET used_count = ? WHERE id = ?",
          [m.actual_count, m.id]
        );

        console.log(`✅ Fixed ${m.code}: ${m.db_count} → ${m.actual_count}`);
      }

      await connection.commit();
      connection.release();

      console.log(`\n✅ Successfully fixed ${mismatches.length} promo codes!`);
    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      console.error("❌ Transaction failed:", transactionError);
      throw transactionError;
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await db.end();
  }
}

fixPromoCounts();
