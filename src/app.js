const express = require("express");
const { randomUUID } = require("crypto");
const { db, ready } = require("./db");
const { validateProduct, FIELDS } = require("./validate");
const testPage = require("./testPage");

const app = express();
app.use(express.json());

// Make sure the table exists before any request touches the database
app.use(async (req, res, next) => {
  try {
    await ready;
    next();
  } catch (err) {
    next(err);
  }
});

// Turn database rows into clean JSON objects
const toProduct = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  price: Number(row.price),
  quantity: Number(row.quantity),
  description: row.description,
});

async function findById(id) {
  const { rows } = await db.execute({ sql: "SELECT * FROM products WHERE id = ?", args: [id] });
  return rows[0] ? toProduct(rows[0]) : null;
}

const notFound = (res, id) => res.status(404).json({ error: `Product with id '${id}' not found` });

// Simple test page
app.get("/", (req, res) => res.type("html").send(testPage));

// CREATE
app.post("/api/products", async (req, res, next) => {
  try {
    const errors = validateProduct(req.body);
    if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

    const product = {
      id: randomUUID(), // generated on the server, never taken from the client
      name: req.body.name.trim(),
      category: req.body.category.trim(),
      price: req.body.price,
      quantity: req.body.quantity,
      description: (req.body.description || "").trim(),
    };
    await db.execute({
      sql: "INSERT INTO products (id, name, category, price, quantity, description) VALUES (?, ?, ?, ?, ?, ?)",
      args: [product.id, product.name, product.category, product.price, product.quantity, product.description],
    });
    res.status(201).json(await findById(product.id));
  } catch (err) {
    next(err);
  }
});

// READ all
app.get("/api/products", async (req, res, next) => {
  try {
    const { rows } = await db.execute("SELECT * FROM products ORDER BY rowid");
    res.json(rows.map(toProduct));
  } catch (err) {
    next(err);
  }
});

// READ one
app.get("/api/products/:id", async (req, res, next) => {
  try {
    const product = await findById(req.params.id);
    if (!product) return notFound(res, req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// UPDATE (send only the fields you want to change)
app.put("/api/products/:id", async (req, res, next) => {
  try {
    const existing = await findById(req.params.id);
    if (!existing) return notFound(res, req.params.id);

    const errors = validateProduct(req.body, true);
    if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

    const updated = { ...existing };
    for (const f of FIELDS) {
      if (req.body[f] !== undefined) updated[f] = typeof req.body[f] === "string" ? req.body[f].trim() : req.body[f];
    }
    await db.execute({
      sql: "UPDATE products SET name = ?, category = ?, price = ?, quantity = ?, description = ? WHERE id = ?",
      args: [updated.name, updated.category, updated.price, updated.quantity, updated.description, existing.id],
    });
    res.json(await findById(existing.id));
  } catch (err) {
    next(err);
  }
});

// DELETE
app.delete("/api/products/:id", async (req, res, next) => {
  try {
    const result = await db.execute({ sql: "DELETE FROM products WHERE id = ?", args: [req.params.id] });
    if (result.rowsAffected === 0) return notFound(res, req.params.id);
    res.json({ message: "Product deleted", id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// Unknown routes
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// Error handler: broken JSON -> 400, anything else -> 500
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
