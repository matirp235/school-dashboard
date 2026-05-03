import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { month, year, category } = req.query;
    let sql = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];
    if (month && year) { sql += ` AND strftime('%m', expense_date) = ? AND strftime('%Y', expense_date) = ?`; params.push(String(month).padStart(2, '0'), String(year)); }
    else if (year)     { sql += ` AND strftime('%Y', expense_date) = ?`; params.push(String(year)); }
    if (category)      { sql += ' AND category = ?'; params.push(category); }
    sql += ' ORDER BY expense_date DESC';
    res.json(db.prepare(sql).all(...params));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', (req, res) => {
  try {
    const { title, amount, category = 'Supplies', description, expense_date } = req.body;
    if (!title || !amount) return res.status(400).json({ error: 'Title and amount are required' });
    const result = db.prepare('INSERT INTO expenses (title, amount, category, description, expense_date) VALUES (?, ?, ?, ?, ?)').run(title, parseFloat(amount), category, description || null, expense_date || null);
    res.status(201).json(db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });
    const { title, amount, category, description, expense_date } = req.body;
    db.prepare('UPDATE expenses SET title=?, amount=?, category=?, description=?, expense_date=? WHERE id=?').run(title || existing.title, parseFloat(amount) || existing.amount, category || existing.category, description ?? existing.description, expense_date || existing.expense_date, req.params.id);
    res.json(db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
