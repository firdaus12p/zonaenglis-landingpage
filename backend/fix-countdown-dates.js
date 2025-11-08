import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "",
  database: "zona_english_admin",
});

console.log("🔧 Fixing countdown_batches date columns...\n");

try {
  // Step 1: Fix start_date
  console.log("1️⃣  Modifying start_date to DATE type...");
  await db.query(
    "ALTER TABLE countdown_batches MODIFY COLUMN start_date DATE NOT NULL"
  );
  console.log("   ✅ start_date changed to DATE\n");

  // Step 2: Fix end_date
  console.log("2️⃣  Modifying end_date to DATE type...");
  await db.query(
    "ALTER TABLE countdown_batches MODIFY COLUMN end_date DATE DEFAULT NULL"
  );
  console.log("   ✅ end_date changed to DATE\n");

  // Step 3: Fix registration_deadline
  console.log("3️⃣  Modifying registration_deadline to DATE type...");
  await db.query(
    "ALTER TABLE countdown_batches MODIFY COLUMN registration_deadline DATE DEFAULT NULL"
  );
  console.log("   ✅ registration_deadline changed to DATE\n");

  // Verify changes
  console.log("🔍 Verifying column types...");
  const [columns] = await db.query(`
    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'zona_english_admin' 
      AND TABLE_NAME = 'countdown_batches'
      AND COLUMN_NAME IN ('start_date', 'end_date', 'registration_deadline', 'start_time', 'end_time')
    ORDER BY COLUMN_NAME
  `);

  console.log("\n📊 Column Types:");
  columns.forEach((col) => {
    console.log(
      `   ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${
        col.IS_NULLABLE === "YES" ? "(NULL)" : "(NOT NULL)"
      }`
    );
  });

  console.log("\n✨ Countdown batch date columns fixed successfully!");
  console.log(
    "\n💡 Next: Delete old batches and create new ones with correct dates"
  );
} catch (error) {
  console.error("\n❌ Error:", error.message);
  if (error.code) console.error("   Code:", error.code);
} finally {
  await db.end();
}
