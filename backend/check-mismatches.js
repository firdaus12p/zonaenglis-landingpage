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

async function checkAllMismatches() {
  try {
    const [mismatches] = await db.query(
      `SELECT 
        p.id,
        p.code,
        p.name,
        p.used_count as db_count,
        COUNT(u.id) as actual_count,
        (p.used_count - COUNT(u.id)) as difference,
        p.created_at,
        p.updated_at
       FROM promo_codes p
       LEFT JOIN promo_usage u ON p.id = u.promo_code_id AND u.deleted_at IS NULL
       GROUP BY p.id, p.code, p.name, p.used_count, p.created_at, p.updated_at
       HAVING db_count != actual_count
       ORDER BY difference DESC`
    );

    if (mismatches.length === 0) {
      console.log("✅ No mismatches found!");
      process.exit(0);
    }

    console.log(
      `⚠️ Found ${mismatches.length} promo codes with count mismatches:\n`
    );

    for (const m of mismatches) {
      console.log(`Code: ${m.code} (${m.name})`);
      console.log(`  ID: ${m.id}`);
      console.log(`  DB Count: ${m.db_count}`);
      console.log(`  Actual Count: ${m.actual_count}`);
      console.log(`  Difference: +${m.difference}`);
      console.log(
        `  Created: ${new Date(m.created_at).toLocaleString("id-ID")}`
      );
      console.log(
        `  Updated: ${new Date(m.updated_at).toLocaleString("id-ID")}`
      );
      console.log("");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.end();
  }
}

checkAllMismatches();
