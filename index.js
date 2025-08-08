// stock-api.js
const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;
const DB_FILE = "stock-db.json";

app.use(express.json());

// Helper: Read + Write DB
function readDB() {
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(DB_FILE));
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Add stock
app.post("/stock/add", (req, res) => {
  const { name, quantity, buyPrice, sellPrice } = req.body;
  if (!name || !quantity || !buyPrice || !sellPrice) {
    return res.status(400).json({ error: "Missing stock fields." });
  }
  const db = readDB();
  db.push({ name, quantity, buyPrice, sellPrice });
  writeDB(db);
  res.json({ message: "Stock added successfully." });
});

// Edit stock
app.put("/stock/edit/:name", (req, res) => {
  const { name } = req.params;
  const { quantity, buyPrice, sellPrice } = req.body;
  const db = readDB();
  const index = db.findIndex(s => s.name === name);
  if (index === -1) return res.status(404).json({ error: "Stock not found." });

  if (quantity !== undefined) db[index].quantity = quantity;
  if (buyPrice !== undefined) db[index].buyPrice = buyPrice;
  if (sellPrice !== undefined) db[index].sellPrice = sellPrice;
  writeDB(db);
  res.json({ message: "Stock updated." });
});

// Delete stock
app.delete("/stock/delete/:name", (req, res) => {
  const { name } = req.params;
  const db = readDB();
  const newDB = db.filter(s => s.name !== name);
  if (newDB.length === db.length) return res.status(404).json({ error: "Stock not found." });
  writeDB(newDB);
  res.json({ message: "Stock deleted." });
});

// View all stock
app.get("/stock/all", (req, res) => {
  res.json(readDB());
});

// Stats: Net profit & low stock
app.get("/stock/stats", (req, res) => {
  const db = readDB();
  const netProfit = db.reduce((acc, item) => acc + (item.sellPrice - item.buyPrice) * item.quantity, 0);
  const lowStock = db.filter(s => s.quantity < 5);
  res.json({ netProfit, lowStock });
});

// Start server
app.listen(PORT, () => {
  console.log(`📦 Stock API running at http://localhost:${PORT}`);
});
