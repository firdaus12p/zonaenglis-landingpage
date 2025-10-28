import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "",
  database: "zona_english_admin",
});

console.log("=== AMBASSADORS IN DATABASE ===\n");

const [all] = await conn.query(`
  SELECT id, name, affiliate_code, is_active, location, institution
  FROM ambassadors
  ORDER BY id
`);

console.log(`Total records: ${all.length}\n`);

all.forEach((a) => {
  console.log(
    `ID ${a.id}: ${a.name} (${a.affiliate_code}) - Active: ${
      a.is_active ? "YES" : "NO"
    }`
  );
  console.log(
    `       Location: ${a.location || "N/A"} | Institution: ${
      a.institution || "N/A"
    }`
  );
});

await conn.end();
