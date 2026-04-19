import express from 'express';
import db from '../db.js';

// 1. Initialize the router
const router = express.Router();

// GET all expenses — filter by month/year
router.get('/', (req, res) => {
  const { month, year } = req.query;
  let sql = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];
  if (month) { 
    sql += ' AND month = ?'; 
    params.push(month); 
  }
  if (year) { 
    sql += ' AND year = ?';  
    params.push(Number(year)); 
  }
  sql += ' ORDER BY year DESC, month DESC, id DESC';
  res.json(db.prepare(sql).all(...params));
});

// GET monthly summary (total per category for a given month/year)
router.get('/summary', (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({ error: 'Month and Year are required for summary' });
  }
  
  const rows = db.prepare(`
    SELECT category, SUM(amount) as total
    FROM expenses WHERE month = ? AND year = ?
    GROUP BY category ORDER BY total DESC
  `).all(month, Number(year));
  
  const grand = rows.reduce((s, r) => s + r.total, 0);
  res.json({ rows, grand_total: grand });
});

// GET available months (for dropdown)
router.get('/months', (_, res) => {
  const rows = db.prepare(
    'SELECT DISTINCT month, year FROM expenses ORDER BY year DESC, month DESC'
  ).all();
  res.json(rows);
});

// POST create
router.post('/', (req, res) => {
  const { month, year, category, description, amount } = req.body;
  const result = db.prepare(
    'INSERT INTO expenses (month, year, category, description, amount) VALUES (?,?,?,?,?)'
  ).run(month, Number(year), category, description, Number(amount));
  res.status(201).json({ id: result.lastInsertRowid, month, year, category, description, amount });
});

// PUT update
router.put('/:id', (req, res) => {
  const { month, year, category, description, amount } = req.body;
  const result = db.prepare(
    'UPDATE expenses SET month=?, year=?, category=?, description=?, amount=? WHERE id=?'
  ).run(month, Number(year), category, description, Number(amount), req.params.id);
  
  if (!result.changes) return res.status(404).json({ error: 'Expense not found' });
  res.json({ id: Number(req.params.id), ...req.body });
});

// DELETE
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Expense not found' });
  res.json({ success: true });
});

export default router;