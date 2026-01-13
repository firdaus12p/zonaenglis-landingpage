import db from "./connection.js";

async function checkSchema() {
  try {
    console.log("Checking promo_codes schema...");
    const [rows] = await db.query("DESCRIBE promo_codes");
    console.table(rows);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkSchema();
