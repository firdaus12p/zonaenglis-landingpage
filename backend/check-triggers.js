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

async function checkTriggers() {
  try {
    console.log("🔍 Checking for database triggers...\n");

    // Check triggers on promo_usage table
    const [triggers] = await db.query(
      "SHOW TRIGGERS WHERE `Table` = 'promo_usage'"
    );

    if (triggers.length === 0) {
      console.log("✅ No triggers found on promo_usage table");
    } else {
      console.log(`⚠️  Found ${triggers.length} trigger(s) on promo_usage:\n`);
      for (const t of triggers) {
        console.log(`Trigger: ${t.Trigger}`);
        console.log(`Event: ${t.Event}`);
        console.log(`Timing: ${t.Timing}`);
        console.log(`Statement: ${t.Statement}`);
        console.log("");
      }
    }

    // Also check promo_codes table
    const [promoTriggers] = await db.query(
      "SHOW TRIGGERS WHERE `Table` = 'promo_codes'"
    );

    if (promoTriggers.length === 0) {
      console.log("✅ No triggers found on promo_codes table");
    } else {
      console.log(
        `⚠️  Found ${promoTriggers.length} trigger(s) on promo_codes:\n`
      );
      for (const t of promoTriggers) {
        console.log(`Trigger: ${t.Trigger}`);
        console.log(`Event: ${t.Event}`);
        console.log(`Timing: ${t.Timing}`);
        console.log(`Statement: ${t.Statement}`);
        console.log("");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.end();
  }
}

checkTriggers();
