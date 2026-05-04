import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/categories
router.get('/', (_req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM expense_categories ORDER BY is_default DESC, name ASC').all());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/categories
router.post('/', (req, res) => {
  try {
    const { name, color = '#6b7280' } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Category name is required' });
    const result = db.prepare(
      'INSERT INTO expense_categories (name, color, is_default) VALUES (?, ?, 0)'
    ).run(name.trim(), color);
    res.status(201).json(db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Category already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id  (rename / recolor)
router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    const { name = existing.name, color = existing.color } = req.body;
    db.prepare('UPDATE expense_categories SET name = ?, color = ? WHERE id = ?').run(name.trim(), color, req.params.id);
    res.json(db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(req.params.id));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Category name already exists' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', (req, res) => {
  try {
    const cat = db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    if (cat.is_default) return res.status(403).json({ error: 'Default categories cannot be deleted' });

    // Check if any expenses use this category
    const inUse = db.prepare('SELECT COUNT(*) AS c FROM expenses WHERE category = ?').get(cat.name).c;
    if (inUse > 0) return res.status(409).json({ error: `Cannot delete — ${inUse} expense(s) use this category` });

    db.prepare('DELETE FROM expense_categories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
