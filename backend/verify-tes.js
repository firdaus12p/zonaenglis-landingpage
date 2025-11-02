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

async function verifyTES() {
  try {
    const [promo] = await db.query(
      "SELECT * FROM promo_codes WHERE code = 'TES'"
    );

    const [usage] = await db.query(
      `SELECT * FROM promo_usage 
       WHERE promo_code_id = ? AND deleted_at IS NULL`,
      [promo[0].id]
    );

    console.log("=== PROMO CODE TES ===");
    console.log(`ID: ${promo[0].id}`);
    console.log(`Code: ${promo[0].code}`);
    console.log(`Name: ${promo[0].name}`);
    console.log(`Used Count: ${promo[0].used_count} ✅`);
    console.log(`Usage Limit: ${promo[0].usage_limit}`);
    console.log(``);
    console.log(`Active Usage Records: ${usage.length} ✅`);
    console.log(``);

    if (promo[0].used_count === usage.length) {
      console.log("✅ COUNT CORRECT! Used count matches actual usage records.");
    } else {
      console.log(
        `⚠️  MISMATCH: DB count (${promo[0].used_count}) != Actual (${usage.length})`
      );
    }

    if (usage.length > 0) {
      console.log(``);
      console.log("Usage Details:");
      for (const u of usage) {
        console.log(
          `  - ${u.user_name} (${u.user_phone}) at ${new Date(
            u.used_at
          ).toLocaleString("id-ID")}`
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.end();
  }
}

verifyTES();
