import mysql from "mysql2/promise";
import fs from "fs";

const conn = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "",
  database: "zona_english_admin",
  multipleStatements: true,
});

const sql = fs.readFileSync("update_promo_codes.sql", "utf8");
const [results] = await conn.query(sql);

console.log("✅ Database updated!\n");
console.log("=== PROMO CODES ===");

const lastResult = Array.isArray(results)
  ? results[results.length - 1]
  : results;
if (Array.isArray(lastResult)) {
  lastResult.forEach((r) => {
    console.log(
      `✓ ${r.code} - ${r.name} (${r.discount_type} ${r.discount_value}%)`
    );
    console.log(
      `  Valid: ${r.valid_from} to ${r.valid_until} | Active: ${
        r.is_active ? "YES" : "NO"
      }`
    );
  });
}

await conn.end();
