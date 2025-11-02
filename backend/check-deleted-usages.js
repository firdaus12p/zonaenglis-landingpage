import db from "./db/connection.js";

async function checkDeletedUsages() {
  try {
    console.log(
      "🔍 Checking ALL promo usage records (including deleted) for code: TES\n"
    );

    // Get promo code info
    const [promos] = await db.query(
      'SELECT id, code FROM promo_codes WHERE code = "TES"'
    );

    if (promos.length === 0) {
      console.log("❌ Promo code TES not found");
      return;
    }

    const promo = promos[0];

    // Get ALL usage records (including deleted)
    const [allUsages] = await db.query(
      `SELECT id, user_name, user_phone, used_at, deleted_at, deleted_by
       FROM promo_usage 
       WHERE promo_code_id = ?
       ORDER BY used_at ASC`,
      [promo.id]
    );

    console.log(`📊 Total Records (including deleted): ${allUsages.length}\n`);

    if (allUsages.length > 0) {
      allUsages.forEach((usage, index) => {
        console.log(
          `${index + 1}. ID ${usage.id} - ${usage.user_name} (${
            usage.user_phone
          })`
        );
        console.log(`   Used: ${usage.used_at}`);
        if (usage.deleted_at) {
          console.log(
            `   ❌ DELETED: ${usage.deleted_at} by ${
              usage.deleted_by || "unknown"
            }`
          );
        } else {
          console.log(`   ✅ ACTIVE`);
        }
        console.log("");
      });
    }

    // Check if there's a pattern
    const deletedCount = allUsages.filter((u) => u.deleted_at).length;
    const activeCount = allUsages.filter((u) => !u.deleted_at).length;

    console.log(`Summary:`);
    console.log(`  Active: ${activeCount}`);
    console.log(`  Deleted: ${deletedCount}`);
    console.log(`  Total ever created: ${allUsages.length}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await db.end();
  }
}

checkDeletedUsages();
