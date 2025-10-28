import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "",
  database: "zona_english_admin",
});

console.log("=== ALL AMBASSADORS (INCLUDING DELETED) ===\n");

const [all] = await conn.query(`
  SELECT id, name, affiliate_code, is_active
  FROM ambassadors
  ORDER BY is_active DESC, id
`);

console.log(`Total: ${all.length}\n`);

const active = all.filter((a) => a.is_active === 1);
const inactive = all.filter((a) => a.is_active === 0);

console.log(`✓ ACTIVE (${active.length}):`);
active.forEach((a) =>
  console.log(`  ID ${a.id}: ${a.name} (${a.affiliate_code})`)
);

console.log(`\n✗ INACTIVE/DELETED (${inactive.length}):`);
if (inactive.length > 0) {
  inactive.forEach((a) =>
    console.log(`  ID ${a.id}: ${a.name} (${a.affiliate_code})`)
  );
} else {
  console.log("  None");
}

await conn.end();
