import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "",
  database: "zona_english_admin",
});

console.log("🗑️  Cleaning up old countdown batches...\n");

const [result] = await db.query("DELETE FROM countdown_batches");
console.log(`✅ Deleted ${result.affectedRows} batch(es)`);

console.log("\n✨ Database is ready for fresh testing!");
console.log("\n📝 Next steps:");
console.log("   1. Go to Admin → Countdown Batches");
console.log("   2. Create a new batch with tomorrow's date");
console.log("   3. Check PromoCenter - countdown should be accurate");

await db.end();
