import articlesRoutes from "./routes/articles.js";

console.log("✅ Articles routes imported successfully");
console.log("Type:", typeof articlesRoutes);
console.log(
  "Is Router:",
  articlesRoutes && articlesRoutes.stack ? "YES" : "NO"
);

if (articlesRoutes && articlesRoutes.stack) {
  console.log("\nRegistered routes:");
  articlesRoutes.stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(", ").toUpperCase();
      console.log(`  ${methods.padEnd(10)} ${layer.route.path}`);
    }
  });
}

process.exit(0);
