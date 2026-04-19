import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Configure Multer for photo uploads
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB max

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

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Teacher not found' });
  res.json(row);
});

// POST with photo upload
router.post('/', upload.single('photo'), (req, res) => {
  const d = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  
  try {
    const result = db.prepare(`
      INSERT INTO teachers (
        full_name, dob, gender, employee_id, department, designation,
        subjects, qualification, contact_primary, contact_secondary, 
        address, joining_date, photo_url
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      d.full_name, d.dob || '', d.gender, d.employee_id, d.department,
      d.designation, d.subjects || '', d.qualification || '',
      d.contact_primary, d.contact_secondary || '', d.address || '', 
      d.joining_date || '', photo_url
    );
    res.status(201).json({ id: result.lastInsertRowid, ...d, photo_url });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Employee ID already exists' });
    res.status(500).json({ error: e.message });
  }
});

// PUT with photo upload
router.put('/:id', upload.single('photo'), (req, res) => {
  const d = req.body;
  const existing = db.prepare('SELECT photo_url FROM teachers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Teacher not found' });
  
  const photo_url = req.file ? `/uploads/${req.file.filename}` : existing.photo_url;

  const result = db.prepare(`
    UPDATE teachers SET
      full_name=?, dob=?, gender=?, employee_id=?, department=?, designation=?,
      subjects=?, qualification=?, contact_primary=?, contact_secondary=?,
      address=?, joining_date=?, photo_url=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    d.full_name, d.dob || '', d.gender, d.employee_id, d.department,
    d.designation, d.subjects || '', d.qualification || '',
    d.contact_primary, d.contact_secondary || '', d.address || '', 
    d.joining_date || '', photo_url, req.params.id
  );
  if (!result.changes) return res.status(404).json({ error: 'Teacher not found' });
  res.json({ id: Number(req.params.id), ...d, photo_url });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM teachers WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Teacher not found' });
  res.json({ success: true });
});

export default router;