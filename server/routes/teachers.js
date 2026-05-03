import { Router } from 'express';
import multer from 'multer';
import { join, extname, dirname } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router    = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = join(__dirname, '..', 'uploads');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', (req, res) => {
  try {
    const { search = '', department = '' } = req.query;
    let sql = 'SELECT * FROM teachers WHERE 1=1';
    const params = [];
    if (search)     { sql += ' AND (name LIKE ? OR employee_id LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (department) { sql += ' AND department = ?'; params.push(department); }
    sql += ' ORDER BY name ASC';
    res.json(db.prepare(sql).all(...params));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', (req, res) => {
  try {
    const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', upload.single('photo'), (req, res) => {
  try {
    const { name, employee_id, department, designation, qualification, subjects, phone, email, date_of_joining } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    const result = db.prepare(`INSERT INTO teachers (name, employee_id, department, designation, qualification, subjects, phone, email, date_of_joining, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(name, employee_id || null, department || null, designation || null, qualification || null, subjects || null, phone || null, email || null, date_of_joining || null, photo);
    res.status(201).json(db.prepare('SELECT * FROM teachers WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', upload.single('photo'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Teacher not found' });
    const { name, employee_id, department, designation, qualification, subjects, phone, email, date_of_joining } = req.body;
    let photo = existing.photo;
    if (req.file) {
      if (existing.photo) { try { unlinkSync(join(__dirname, '..', existing.photo)); } catch (_) {} }
      photo = `/uploads/${req.file.filename}`;
    }
    db.prepare(`UPDATE teachers SET name=?, employee_id=?, department=?, designation=?, qualification=?, subjects=?, phone=?, email=?, date_of_joining=?, photo=? WHERE id=?`).run(name || existing.name, employee_id ?? existing.employee_id, department ?? existing.department, designation ?? existing.designation, qualification ?? existing.qualification, subjects ?? existing.subjects, phone ?? existing.phone, email ?? existing.email, date_of_joining ?? existing.date_of_joining, photo, req.params.id);
    res.json(db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    if (teacher.photo) { try { unlinkSync(join(__dirname, '..', teacher.photo)); } catch (_) {} }
    db.prepare('DELETE FROM teachers WHERE id = ?').run(req.params.id);
    res.json({ message: 'Teacher deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
