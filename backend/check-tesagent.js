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

async function checkTESAGENT() {
  try {
    // Get promo info
    const [promo] = await db.query(
      "SELECT * FROM promo_codes WHERE code = 'TESAGENT'"
    );

    if (promo.length === 0) {
      console.log("❌ Promo TESAGENT not found");
      console.log(
        "⚠️  Make sure you have created the promo code and used it first!"
      );
      process.exit(1);
    }

    const p = promo[0];

    console.log("=== PROMO CODE: TESAGENT ===\n");
    console.log(`ID: ${p.id}`);
    console.log(`Code: ${p.code}`);
    console.log(`Name: ${p.name}`);
    console.log(
      `Used Count: ${p.used_count} ${p.used_count === 1 ? "✅" : "⚠️"}`
    );
    console.log(`Usage Limit: ${p.usage_limit}`);
    console.log(
      `Created At: ${new Date(p.created_at).toLocaleString("id-ID")}`
    );
    console.log(
      `Updated At: ${new Date(p.updated_at).toLocaleString("id-ID")}`
    );

    const createdTime = new Date(p.created_at).getTime();
    const updatedTime = new Date(p.updated_at).getTime();
    const timeDiff = Math.round((updatedTime - createdTime) / 1000);

    if (timeDiff === 0) {
      console.log(`Status: Never used (created_at === updated_at)`);
    } else {
      console.log(`Status: Used ${timeDiff}s after creation`);
    }
    console.log("");

    // Get all usage records (including deleted)
    const [allUsages] = await db.query(
      `SELECT * FROM promo_usage 
       WHERE promo_code_id = ?
       ORDER BY used_at ASC`,
      [p.id]
    );

    console.log(`=== USAGE RECORDS ===`);
    console.log(`Total records: ${allUsages.length}\n`);

    if (allUsages.length === 0) {
      console.log("No usage records found");
    } else {
      for (const u of allUsages) {
        console.log(`Record ID: ${u.id}`);
        console.log(`  User: ${u.user_name} (${u.user_phone})`);
        console.log(`  Email: ${u.user_email || "N/A"}`);
        console.log(
          `  Used At: ${new Date(u.used_at).toLocaleString("id-ID")}`
        );
        console.log(
          `  Deleted: ${
            u.deleted_at
              ? "YES (" + new Date(u.deleted_at).toLocaleString("id-ID") + ")"
              : "NO"
          }`
        );
        console.log("");
      }
    }

    // Count active vs deleted
    const activeCount = allUsages.filter((u) => !u.deleted_at).length;
    const deletedCount = allUsages.filter((u) => u.deleted_at).length;

    console.log(`=== VERIFICATION ===`);
    console.log(`DB used_count: ${p.used_count}`);
    console.log(`Active records: ${activeCount}`);
    console.log(`Deleted records: ${deletedCount}`);
    console.log(`Total ever created: ${allUsages.length}`);
    console.log("");

    if (p.used_count !== activeCount) {
      console.log(`❌ MISMATCH DETECTED!`);
      console.log(`  Expected: ${activeCount}`);
      console.log(`  Actual: ${p.used_count}`);
      console.log(
        `  Difference: ${p.used_count - activeCount > 0 ? "+" : ""}${
          p.used_count - activeCount
        }`
      );
      console.log("\n⚠️  BUG STILL EXISTS - used_count is incorrect!");
    } else {
      console.log(`✅ SUCCESS! Count is correct!`);
      console.log(`   The fix is working properly.`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.end();
  }
}

checkTESAGENT();
