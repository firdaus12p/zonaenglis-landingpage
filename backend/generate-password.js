import bcrypt from "bcryptjs";

const password = "admin123";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error generating hash:", err);
    return;
  }
  console.log("\n===========================================");
  console.log("Password Hash Generator");
  console.log("===========================================");
  console.log("Password:", password);
  console.log("Hash:", hash);
  console.log("===========================================\n");
  console.log("SQL Query to update admin user:");
  console.log(
    `UPDATE admin_users SET password_hash = '${hash}' WHERE email = 'admin@zonaenglish.com';`
  );
  console.log("===========================================\n");
  process.exit(0);
});
