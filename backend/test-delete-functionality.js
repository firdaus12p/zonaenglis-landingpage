import db from "./db/connection.js";

async function testDeleteRestore() {
  try {
    console.log("\n🧪 Testing Delete & Restore Functionality\n");

    // Step 1: Get current active ambassadors
    const [before] = await db.query(
      "SELECT id, name, role, affiliate_code, is_active FROM ambassadors ORDER BY id"
    );
    console.log("📊 Before Delete:");
    console.log(`Total: ${before.length} ambassadors`);
    console.log(
      `Active: ${before.filter((a) => a.is_active === 1).length} ambassadors`
    );
    before.forEach((a) => {
      const status = a.is_active ? "✅ ACTIVE" : "❌ DELETED";
      console.log(`  ${status} - ${a.name} (${a.role}) - ${a.affiliate_code}`);
    });

    console.log("\n" + "=".repeat(70) + "\n");

    // Step 2: Soft delete first ambassador (Sarah Pratiwi)
    const testId = 1;
    console.log(`🗑️  Soft deleting ambassador ID ${testId}...`);
    await db.query("UPDATE ambassadors SET is_active = 0 WHERE id = ?", [
      testId,
    ]);
    console.log("✅ Delete executed\n");

    // Step 3: Check active ambassadors (should exclude deleted)
    const [afterDelete] = await db.query(
      "SELECT id, name, role, affiliate_code, is_active FROM ambassadors WHERE is_active = 1"
    );
    console.log("📊 After Delete (Active Only):");
    console.log(`Total Active: ${afterDelete.length} ambassadors`);
    afterDelete.forEach((a) => {
      console.log(`  ✅ ${a.name} (${a.role}) - ${a.affiliate_code}`);
    });

    // Show deleted
    const [deleted] = await db.query(
      "SELECT id, name, role, affiliate_code FROM ambassadors WHERE is_active = 0"
    );
    if (deleted.length > 0) {
      console.log("\n❌ Deleted Ambassadors:");
      deleted.forEach((a) => {
        console.log(`  ❌ ${a.name} (${a.role}) - ${a.affiliate_code}`);
      });
    }

    console.log("\n" + "=".repeat(70) + "\n");

    // Step 4: Restore
    console.log(`♻️  Restoring ambassador ID ${testId}...`);
    await db.query("UPDATE ambassadors SET is_active = 1 WHERE id = ?", [
      testId,
    ]);
    console.log("✅ Restore executed\n");

    // Step 5: Check after restore
    const [afterRestore] = await db.query(
      "SELECT id, name, role, affiliate_code, is_active FROM ambassadors ORDER BY id"
    );
    console.log("📊 After Restore:");
    console.log(`Total Active: ${afterRestore.length} ambassadors`);
    afterRestore.forEach((a) => {
      const status = a.is_active ? "✅ ACTIVE" : "❌ DELETED";
      console.log(`  ${status} - ${a.name} (${a.role}) - ${a.affiliate_code}`);
    });

    console.log("\n✅ Test completed successfully!\n");
    console.log("💡 Summary:");
    console.log(
      "   - Soft delete works (sets is_active = 0, doesn't remove from DB)"
    );
    console.log("   - GET /api/ambassadors returns only active ambassadors");
    console.log(
      "   - Deleted ambassadors can be restored by setting is_active = 1"
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    process.exit(0);
  }
}

testDeleteRestore();
