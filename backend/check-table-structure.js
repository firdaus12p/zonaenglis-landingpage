import db from "./db/connection.js";

async function checkStructure() {
  try {
    const [rows] = await db.query("DESCRIBE ambassadors");
    console.log("\n📋 Table Structure: ambassadors\n");
    console.log("Field                 | Type           | Null | Default");
    console.log("-".repeat(70));
    rows.forEach((r) => {
      const field = r.Field.padEnd(20);
      const type = r.Type.padEnd(15);
      const nullVal = r.Null.padEnd(5);
      const def = r.Default || "NULL";
      console.log(`${field} | ${type} | ${nullVal} | ${def}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

checkStructure();
