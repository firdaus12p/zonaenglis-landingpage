import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "",
  database: "zona_english_admin",
});

console.log("=== AMBASSADOR CODES ===\n");

const [ambassadors] = await conn.query(`
  SELECT id, name, role, affiliate_code, is_active, location, phone
  FROM ambassadors
  ORDER BY name
`);

ambassadors.forEach((a) => {
  console.log(
    `${a.is_active ? "✓" : "✗"} ${a.affiliate_code || "NO CODE"} - ${a.name} (${
      a.role
    })`
  );
  console.log(
    `  Location: ${a.location || "N/A"} | Phone: ${
      a.phone || "N/A"
    } | Active: ${a.is_active ? "YES" : "NO"}`
  );
});

console.log("\n=== SEARCHING FOR: ZE-SNR-MUH375 ===");
const [search] = await conn.query(
  `
  SELECT * FROM ambassadors WHERE affiliate_code LIKE ?
`,
  ["%MUH%"]
);

if (search.length > 0) {
  console.log("Found similar codes:");
  search.forEach((s) => console.log(`  - ${s.affiliate_code} (${s.name})`));
} else {
  console.log("No similar codes found");
}

await conn.end();
