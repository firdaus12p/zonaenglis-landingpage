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

async function checkProcedure() {
  try {
    console.log("🔍 Checking stored procedure UpdatePromoUsage...\n");

    const [procedures] = await db.query(
      "SHOW CREATE PROCEDURE UpdatePromoUsage"
    );

    if (procedures.length > 0) {
      console.log("📝 Procedure Definition:\n");
      console.log(procedures[0]["Create Procedure"]);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.end();
  }
}

checkProcedure();
