import db from "./db/connection.js";

async function checkPromoUsage() {
  try {
    console.log("🔍 Checking promo usage for code: TES\n");

    // Get promo code info
    const [promos] = await db.query(
      'SELECT id, code, name, used_count, usage_limit FROM promo_codes WHERE code = "TES"'
    );

    if (promos.length === 0) {
      console.log("❌ Promo code TES not found");
      return;
    }

    const promo = promos[0];
    console.log("📊 Promo Code Info:");
    console.log(`   ID: ${promo.id}`);
    console.log(`   Code: ${promo.code}`);
    console.log(`   Name: ${promo.name}`);
    console.log(`   Used Count: ${promo.used_count}`);
    console.log(`   Usage Limit: ${promo.usage_limit || "unlimited"}\n`);

    // Get all usage records
    const [usages] = await db.query(
      `SELECT id, user_name, user_phone, user_email, program_name, 
              discount_amount, used_at, deleted_at, follow_up_status
       FROM promo_usage 
       WHERE promo_code_id = ?
       ORDER BY used_at DESC`,
      [promo.id]
    );

    console.log(`📋 Total Usage Records: ${usages.length}\n`);

    if (usages.length > 0) {
      console.log("📝 Usage Details:");
      usages.forEach((usage, index) => {
        console.log(`\n${index + 1}. ID: ${usage.id}`);
        console.log(`   User: ${usage.user_name} (${usage.user_phone})`);
        console.log(`   Email: ${usage.user_email || "N/A"}`);
        console.log(`   Program: ${usage.program_name || "N/A"}`);
        console.log(
          `   Discount: Rp ${
            usage.discount_amount?.toLocaleString("id-ID") || 0
          }`
        );
        console.log(`   Used At: ${usage.used_at}`);
        console.log(`   Deleted: ${usage.deleted_at ? "YES" : "NO"}`);
        console.log(`   Status: ${usage.follow_up_status}`);
      });
    }

    // Count active (non-deleted) usages
    const activeUsages = usages.filter((u) => !u.deleted_at);
    console.log(`\n✅ Active Usages: ${activeUsages.length}`);
    console.log(`🗑️  Deleted Usages: ${usages.length - activeUsages.length}`);

    // Compare with promo used_count
    if (activeUsages.length !== promo.used_count) {
      console.log(`\n⚠️  MISMATCH DETECTED!`);
      console.log(`   Promo used_count: ${promo.used_count}`);
      console.log(`   Actual active usages: ${activeUsages.length}`);
      console.log(`   Difference: ${promo.used_count - activeUsages.length}`);
    } else {
      console.log(`\n✅ Count is correct!`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await db.end();
  }
}

checkPromoUsage();
