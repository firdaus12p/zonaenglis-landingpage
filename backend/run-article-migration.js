/**
 * Run Article Tables Fix Migration
 * Creates missing article-related tables
 */

import mysql from "mysql2/promise";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  let connection;

  try {
    console.log("🔌 Connecting to database...");

    connection = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3307,
      user: "root",
      password: "",
      database: "zona_english_admin",
      multipleStatements: true,
    });

    console.log("✅ Connected successfully\n");

    // Read SQL file
    const sqlPath = join(__dirname, "migrations", "fix_article_tables.sql");
    console.log(`📄 Reading SQL file: ${sqlPath}`);
    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    // Split SQL statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter(
        (stmt) =>
          stmt.length > 0 &&
          !stmt.startsWith("--") &&
          stmt !== "USE zona_english_admin"
      );

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];

      if (stmt.includes("CREATE TABLE")) {
        const tableName = stmt.match(/CREATE TABLE.*?`(\w+)`/)?.[1];
        console.log(`🔨 Creating table: ${tableName || "unknown"}...`);
      } else if (stmt.includes("ALTER TABLE")) {
        const tableName = stmt.match(/ALTER TABLE.*?`(\w+)`/)?.[1];
        console.log(`🔧 Altering table: ${tableName || "unknown"}...`);
      } else if (stmt.includes("CREATE INDEX")) {
        console.log(`📊 Creating index...`);
      } else if (stmt.includes("SHOW TABLES")) {
        console.log(`\n📋 Verifying tables...`);
      }

      try {
        await connection.query(stmt);
        console.log(`   ✓ Success\n`);
      } catch (error) {
        if (error.code === "ER_TABLE_EXISTS_CREATE") {
          console.log(`   ⚠️  Table already exists, skipping\n`);
        } else if (error.code === "ER_DUP_KEYNAME") {
          console.log(`   ⚠️  Index already exists, skipping\n`);
        } else if (error.code === "ER_CANT_DROP_FIELD_OR_KEY") {
          console.log(`   ⚠️  Column/index already added, skipping\n`);
        } else {
          throw error;
        }
      }
    }

    // Verify tables were created
    console.log("\n🔍 Checking created tables:");
    const [tables] = await connection.query("SHOW TABLES LIKE 'article%'");

    if (tables.length > 0) {
      console.log("✅ Article tables found:");
      tables.forEach((table) => {
        const tableName = Object.values(table)[0];
        console.log(`   • ${tableName}`);
      });
    } else {
      console.log("⚠️  No article tables found");
    }

    console.log("\n✨ Migration completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Error running migration:");
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    if (error.sql) {
      console.error(`   SQL: ${error.sql.substring(0, 200)}...`);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run migration
runMigration();
