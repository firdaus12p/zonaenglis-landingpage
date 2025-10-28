import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "",
  database: "zona_english_admin",
});

console.log("=== CURRENT AMBASSADORS IN DATABASE ===\n");

const [ambassadors] = await conn.query(`
  SELECT id, name, role, location, institution, affiliate_code, phone, testimonial, is_active
  FROM ambassadors
  ORDER BY location, institution, name
`);

ambassadors.forEach((a, i) => {
  console.log(`${i + 1}. ${a.name}`);
  console.log(`   Code: ${a.affiliate_code || "NO CODE"}`);
  console.log(`   Role: ${a.role}`);
  console.log(`   Location: ${a.location || "N/A"}`);
  console.log(`   Institution: ${a.institution || "N/A"}`);
  console.log(`   Phone: ${a.phone || "N/A"}`);
  console.log(`   Testimonial: ${a.testimonial || "N/A"}`);
  console.log(`   Active: ${a.is_active ? "YES" : "NO"}`);
  console.log("");
});

await conn.end();
