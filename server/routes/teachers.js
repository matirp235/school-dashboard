import express from 'express';
import db from '../db.js';

// Define the router instance
const router = express.Router();

// GET all — with optional search + filter
router.get('/', (req, res) => {
  const { q, department } = req.query;
  let sql = 'SELECT * FROM teachers WHERE 1=1';
  const params = [];
  if (q) { 
    sql += ' AND (full_name LIKE ? OR employee_id LIKE ?)'; 
    params.push(`%${q}%`, `%${q}%`); 
  }
  if (department) { 
    sql += ' AND department = ?'; 
    params.push(department); 
  }
  sql += ' ORDER BY full_name ASC';
  res.json(db.prepare(sql).all(...params));
});

// GET single
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Teacher not found' });
  res.json(row);
});

// POST create
router.post('/', (req, res) => {
  const d = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO teachers
        (full_name, dob, gender, employee_id, department, designation,
         subjects, qualification, contact_primary, contact_secondary, address, joining_date)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      d.full_name, d.dob, d.gender, d.employee_id, d.department,
      d.designation, d.subjects, d.qualification,
      d.contact_primary, d.contact_secondary, d.address, d.joining_date
    );
    res.status(201).json({ id: result.lastInsertRowid, ...d });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Employee ID already exists' });
    }
    res.status(500).json({ error: e.message });
  }
});

// PUT update
router.put('/:id', (req, res) => {
  const d = req.body;
  const result = db.prepare(`
    UPDATE teachers SET
      full_name=?, dob=?, gender=?, employee_id=?, department=?, designation=?,
      subjects=?, qualification=?, contact_primary=?, contact_secondary=?,
      address=?, joining_date=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    d.full_name, d.dob, d.gender, d.employee_id, d.department,
    d.designation, d.subjects, d.qualification,
    d.contact_primary, d.contact_secondary, d.address, d.joining_date,
    req.params.id
  );
  if (!result.changes) return res.status(404).json({ error: 'Teacher not found' });
  res.json({ id: Number(req.params.id), ...d });
});

// DELETE
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM teachers WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Teacher not found' });
  res.json({ success: true });
});

export default router;