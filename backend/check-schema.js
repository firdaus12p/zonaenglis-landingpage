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

async function checkTableSchema() {
  try {
    // Get table schema
    const [columns] = await db.query(
      "SHOW COLUMNS FROM promo_codes WHERE Field = 'used_count'"
    );

    console.log("=== PROMO_CODES TABLE - used_count COLUMN ===\n");
    console.log("Field:", columns[0].Field);
    console.log("Type:", columns[0].Type);
    console.log("Null:", columns[0].Null);
    console.log("Key:", columns[0].Key);
    console.log("Default:", columns[0].Default);
    console.log("Extra:", columns[0].Extra);
    console.log("");

    if (columns[0].Default !== null && columns[0].Default !== "0") {
      console.log(`⚠️ DEFAULT VALUE IS NOT 0!`);
      console.log(`   Current default: ${columns[0].Default}`);
      console.log(
        `   This explains why new promos start with used_count = ${columns[0].Default}`
      );
    } else {
      console.log("✅ Default value is correct (0 or NULL)");
    }

    // Check recent promo creations
    console.log("\n=== RECENT PROMO CODES (Last 5) ===\n");
    const [recentPromos] = await db.query(
      `SELECT id, code, name, used_count, created_at, updated_at 
       FROM promo_codes 
       ORDER BY created_at DESC 
       LIMIT 5`
    );

    for (const p of recentPromos) {
      console.log(`${p.code} (${p.name})`);
      console.log(`  ID: ${p.id}`);
      console.log(`  used_count: ${p.used_count}`);
      console.log(
        `  Created: ${new Date(p.created_at).toLocaleString("id-ID")}`
      );
      console.log(
        `  Updated: ${new Date(p.updated_at).toLocaleString("id-ID")}`
      );

      const timeDiff = new Date(p.updated_at) - new Date(p.created_at);
      if (timeDiff === 0) {
        console.log(`  ✅ Never updated (created_at === updated_at)`);
      } else {
        console.log(
          `  ⚠️  Updated ${Math.round(timeDiff / 1000)}s after creation`
        );
      }
      console.log("");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.end();
  }
}

checkTableSchema();
