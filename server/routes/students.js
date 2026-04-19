import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url'; // Added for __dirname
import db from '../db.js';

// 1. Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Initialize the router (This was missing)
const router = express.Router();

// 3. Configure Multer
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB max

// GET all — with optional search + filter
router.get('/', (req, res) => {
  const { q, class: cls } = req.query;
  let sql = 'SELECT * FROM students WHERE 1=1';
  const params = [];
  if (q) { 
    sql += ' AND (full_name LIKE ? OR roll_no LIKE ?)'; 
    params.push(`%${q}%`, `%${q}%`); 
  }
  if (cls) { 
    sql += ' AND class = ?'; 
    params.push(cls); 
  }
  sql += ' ORDER BY full_name ASC';
  res.json(db.prepare(sql).all(...params));
});

// GET single
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Student not found' });
  res.json(row);
});

// POST create
router.post('/', upload.single('photo'), (req, res) => {
  const d = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  const stmt = db.prepare(`
    INSERT INTO students
      (full_name, dob, gender, class, section, roll_no, address,
       guardian_name, guardian_rel, contact_primary, contact_secondary, photo_url)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  const result = stmt.run(
    d.full_name, d.dob, d.gender, d.class, d.section, d.roll_no,
    d.address, d.guardian_name, d.guardian_rel,
    d.contact_primary, d.contact_secondary, photo_url
  );
  res.status(201).json({ id: result.lastInsertRowid, ...d, photo_url });
});

// PUT update
router.put('/:id', upload.single('photo'), (req, res) => {
  const d = req.body;
  const existing = db.prepare('SELECT photo_url FROM students WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Student not found' });
  
  const photo_url = req.file ? `/uploads/${req.file.filename}` : existing.photo_url;
  
  db.prepare(`
    UPDATE students SET
      full_name=?, dob=?, gender=?, class=?, section=?, roll_no=?,
      address=?, guardian_name=?, guardian_rel=?,
      contact_primary=?, contact_secondary=?, photo_url=?,
      updated_at=datetime('now')
    WHERE id=?
  `).run(
    d.full_name, d.dob, d.gender, d.class, d.section, d.roll_no,
    d.address, d.guardian_name, d.guardian_rel,
    d.contact_primary, d.contact_secondary, photo_url, req.params.id
  );
  res.json({ id: Number(req.params.id), ...d, photo_url });
});

// DELETE
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Student not found' });
  res.json({ success: true });
});

export default router;