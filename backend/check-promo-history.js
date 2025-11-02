import db from "./db/connection.js";

async function checkPromoHistory() {
  try {
    console.log("🔍 Checking promo code TES creation and update history\n");

    // Get full promo code details
    const [promos] = await db.query(
      `SELECT id, code, name, discount_type, discount_value, usage_limit, 
              used_count, is_active, created_at, updated_at
       FROM promo_codes WHERE code = "TES"`
    );

    if (promos.length === 0) {
      console.log("❌ Promo code TES not found");
      return;
    }

    const promo = promos[0];

    console.log("📊 Promo Code Full Details:");
    console.log(`   ID: ${promo.id}`);
    console.log(`   Code: ${promo.code}`);
    console.log(`   Name: ${promo.name}`);
    console.log(
      `   Discount: ${promo.discount_value}${
        promo.discount_type === "percentage" ? "%" : ""
      }`
    );
    console.log(`   Usage Limit: ${promo.usage_limit || "unlimited"}`);
    console.log(`   Used Count: ${promo.used_count} ⚠️`);
    console.log(`   Is Active: ${promo.is_active}`);
    console.log(`   Created: ${promo.created_at}`);
    console.log(`   Updated: ${promo.updated_at}`);

    console.log("\n🔍 Timeline Analysis:");

    // Check if updated_at is different from created_at
    if (promo.updated_at && promo.created_at !== promo.updated_at) {
      console.log("⚠️  Promo code HAS BEEN UPDATED after creation!");
      console.log(
        `   Created: ${new Date(promo.created_at).toLocaleString("id-ID")}`
      );
      console.log(
        `   Updated: ${new Date(promo.updated_at).toLocaleString("id-ID")}`
      );

      const createdTime = new Date(promo.created_at).getTime();
      const updatedTime = new Date(promo.updated_at).getTime();
      const diffMinutes = Math.round((updatedTime - createdTime) / 1000 / 60);

      console.log(`   Time difference: ${diffMinutes} minutes`);
    } else {
      console.log(
        "✅ Promo code has NOT been updated (created_at === updated_at)"
      );
    }

    // Get first usage record time
    const [firstUsage] = await db.query(
      "SELECT used_at FROM promo_usage WHERE promo_code_id = ? ORDER BY used_at ASC LIMIT 1",
      [promo.id]
    );

    if (firstUsage.length > 0) {
      console.log(`\n📝 First Usage:`);
      console.log(
        `   Time: ${new Date(firstUsage[0].used_at).toLocaleString("id-ID")}`
      );

      const usageTime = new Date(firstUsage[0].used_at).getTime();
      const createdTime = new Date(promo.created_at).getTime();
      const diffMinutes = Math.round((usageTime - createdTime) / 1000 / 60);

      console.log(`   ${diffMinutes} minutes after promo creation`);
    }

    console.log("\n💡 Possible Causes:");
    console.log("   1. Promo was created with used_count = 1 (instead of 0)");
    console.log("   2. Promo was manually updated in database");
    console.log(
      "   3. There was a previous usage that got deleted without decrement"
    );
    console.log(
      "   4. Code was tested/validated before actual usage (validation increments count)"
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await db.end();
  }
}

checkPromoHistory();
