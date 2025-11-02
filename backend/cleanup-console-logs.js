/**
 * Cleanup Console Logs Script
 * Removes all console.log and console.error statements from backend route files
 * Run with: node cleanup-console-logs.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.join(__dirname, "routes");

// Files to clean
const filesToClean = [
  "affiliate.js",
  "articles.js",
  "ambassadors.js",
  "auth.js",
  "countdown.js",
  "programs.js",
  "promos.js",
  "settings.js",
  "upload.js",
];

let totalRemoved = 0;

filesToClean.forEach((filename) => {
  const filePath = path.join(routesDir, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");
  const originalLength = content.split("\n").length;

  // Remove console.log statements (with emoji or without)
  content = content.replace(/\s*console\.log\([^)]*\);?\s*\n?/g, "");

  // Remove console.error statements but keep ones in catch blocks that might be needed
  // Only remove debug/info console.error, keep error logging in catch blocks
  content = content.replace(
    /^\s*console\.error\("(?:🔍|🔎|✅|❌|📦|🎯|📝|🗑️)[^"]*"[^;]*\);?\s*\n/gm,
    ""
  );

  const newLength = content.split("\n").length;
  const removed = originalLength - newLength;
  totalRemoved += removed;

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ ${filename}: Removed ${removed} console statements`);
});

console.log(
  `\n🎉 Total: Removed ${totalRemoved} console statements from ${filesToClean.length} files`
);
