require("dotenv").config({ quiet: true });
const { createClient } = require("@libsql/client");
const { randomUUID } = require("crypto");

// Locally: a file called products.db (survives restarts).
// On Vercel: a Turso database (set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN).
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:products.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const SEED_PRODUCTS = [
  { name: "Abyssinia Coffee Beans 1kg", category: "Food & Beverage", price: 850, quantity: 120, description: "Roasted highland coffee beans" },
  { name: "Lalibela Leather Backpack", category: "Fashion", price: 3200, quantity: 25, description: "Handmade genuine leather backpack" },
  { name: "Tana Bluetooth Speaker", category: "Electronics", price: 2750, quantity: 40, description: "Portable speaker with 12-hour battery" },
  { name: "Simien Cotton Netela", category: "Clothing", price: 1100, quantity: 60, description: "Traditional handwoven cotton shawl" },
  { name: "Blue Nile Desk Lamp", category: "Home", price: 1450, quantity: 35, description: "LED desk lamp with adjustable brightness" },
];

async function insertSeeds() {
  for (const p of SEED_PRODUCTS) {
    await db.execute({
      sql: "INSERT INTO products (id, name, category, price, quantity, description) VALUES (?, ?, ?, ?, ?, ?)",
      args: [randomUUID(), p.name, p.category, p.price, p.quantity, p.description],
    });
  }
}

// Create the table, and seed the 5 products only if the table is empty.
async function init() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      category    TEXT NOT NULL,
      price       REAL NOT NULL,
      quantity    INTEGER NOT NULL,
      description TEXT NOT NULL DEFAULT ''
    )
  `);
  const { rows } = await db.execute("SELECT COUNT(*) AS count FROM products");
  if (Number(rows[0].count) === 0) await insertSeeds();
}

const ready = init();

module.exports = { db, ready, insertSeeds };
