// Resets the database to exactly the 5 seed products: npm run seed
const { db, ready, insertSeeds } = require("./db");

(async () => {
  await ready;
  await db.execute("DELETE FROM products");
  await insertSeeds();
  console.log("Database reset to 5 seed products");
})();
