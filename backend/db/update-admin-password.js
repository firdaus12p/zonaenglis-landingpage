import db from "./connection.js";
import bcrypt from "bcryptjs";

async function updateAdminPassword() {
  try {
    // Generate correct hash for admin123
    const passwordHash = await bcrypt.hash("admin123", 10);

    // Update admin password
    const [result] = await db.query(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [passwordHash, "admin@zonaenglish.com"]
    );

    console.log("✅ Admin password updated successfully");
    console.log("📧 Email: admin@zonaenglish.com");
    console.log("🔑 Password: admin123");
    console.log("🔒 Hash:", passwordHash);

    // Verify the password works
    const testMatch = await bcrypt.compare("admin123", passwordHash);
    console.log("✅ Password verification test:", testMatch ? "PASS" : "FAIL");
  } catch (error) {
    console.error("❌ Error updating password:", error);
  } finally {
    process.exit(0);
  }
}

updateAdminPassword();
