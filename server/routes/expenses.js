import express from 'express';
import db from '../db.js';

const router = express.Router();

// 1. GET all expenses (FIXED: Parse year as Number)
router.get('/', (req, res) => {
  const { month, year } = req.query;
  let sql = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];
  
  if (month) { sql += ' AND month = ?'; params.push(month); }
  // Cast year to Number so SQLite matches it correctly
  if (year) { sql += ' AND year = ?'; params.push(Number(year)); }
  
  sql += ' ORDER BY id DESC';
  res.json(db.prepare(sql).all(...params));
});

// 2. GET summary (FIXED: Parse year as Number)
router.get('/summary', (req, res) => {
  const { month, year } = req.query;
  let sql = 'SELECT category, SUM(amount) as total FROM expenses WHERE 1=1';
  const params = [];
  
  if (month) { sql += ' AND month = ?'; params.push(month); }
  // Cast year to Number so SQLite matches it correctly
  if (year) { sql += ' AND year = ?'; params.push(Number(year)); }
  
  sql += ' GROUP BY category';
  
  try {
    const rows = db.prepare(sql).all(...params);
    const grand_total = rows.reduce((acc, curr) => acc + curr.total, 0);
    res.json({ rows, grand_total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// 3. POST new expense (Ensure year and amount are inserted as Numbers)
router.post('/', (req, res) => {
  const d = req.body;
  const stmt = db.prepare('INSERT INTO expenses (month, year, category, description, amount) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(d.month, Number(d.year), d.category, d.description || '', Number(d.amount));
  res.status(201).json({ id: result.lastInsertRowid, ...d });
});

// 4. PUT update expense
router.put('/:id', (req, res) => {
  const d = req.body;
  const stmt = db.prepare('UPDATE expenses SET month=?, year=?, category=?, description=?, amount=? WHERE id=?');
  const result = stmt.run(d.month, Number(d.year), d.category, d.description || '', Number(d.amount), req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Expense not found' });
  res.json({ id: Number(req.params.id), ...d });
});

// 5. DELETE expense
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Expense not found' });
  res.json({ success: true });
});

export default router;