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
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, /jpeg|jpg|png|webp/.test(extname(file.originalname).toLowerCase()));
  },
});

// GET /api/students?search=&class=&board=
router.get('/', (req, res) => {
  try {
    const { search = '', class: cls = '', board = '' } = req.query;
    let sql = 'SELECT * FROM students WHERE 1=1';
    const params = [];
    if (search) { sql += ' AND (name LIKE ? OR roll_number LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (cls)    { sql += ' AND class = ?';  params.push(cls); }
    if (board)  { sql += ' AND board = ?';  params.push(board); }
    sql += ' ORDER BY name ASC';
    res.json(db.prepare(sql).all(...params));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/students/:id
router.get('/:id', (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/students
router.post('/', upload.single('photo'), (req, res) => {
  try {
    const { name, roll_number, class: cls, board = 'CBSE', guardian_name, phone, address, date_of_birth, date_of_joining, security_deposit } = req.body;
    if (!name || !cls) return res.status(400).json({ error: 'Name and class are required' });
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    const result = db.prepare(`
      INSERT INTO students (name, roll_number, class, board, guardian_name, phone, address, date_of_birth, date_of_joining, security_deposit, photo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, roll_number || null, cls, board, guardian_name || null, phone || null, address || null, date_of_birth || null, date_of_joining || null, parseFloat(security_deposit) || 0, photo);
    res.status(201).json(db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Roll number already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/students/:id
router.put('/:id', upload.single('photo'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Student not found' });
    const { name, roll_number, class: cls, board, guardian_name, phone, address, date_of_birth, date_of_joining, security_deposit } = req.body;
    let photo = existing.photo;
    if (req.file) {
      if (existing.photo) { try { unlinkSync(join(__dirname, '..', existing.photo)); } catch (_) {} }
      photo = `/uploads/${req.file.filename}`;
    }
    db.prepare(`
      UPDATE students SET name=?, roll_number=?, class=?, board=?, guardian_name=?, phone=?, address=?, date_of_birth=?, date_of_joining=?, security_deposit=?, photo=?
      WHERE id=?
    `).run(name || existing.name, roll_number ?? existing.roll_number, cls || existing.class, board || existing.board, guardian_name ?? existing.guardian_name, phone ?? existing.phone, address ?? existing.address, date_of_birth ?? existing.date_of_birth, date_of_joining ?? existing.date_of_joining, parseFloat(security_deposit) ?? existing.security_deposit, photo, req.params.id);
    res.json(db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Roll number already exists' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/students/:id
router.delete('/:id', (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (student.photo) { try { unlinkSync(join(__dirname, '..', student.photo)); } catch (_) {} }
    db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/students/:id/fees
router.get('/:id/fees', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM fees WHERE student_id = ? ORDER BY paid_on DESC').all(req.params.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/students/:id/fees
router.post('/:id/fees', (req, res) => {
  try {
    const { month, amount, payment_mode = 'Cash', note } = req.body;
    if (!month || !amount) return res.status(400).json({ error: 'Month and amount are required' });
    const result = db.prepare('INSERT INTO fees (student_id, month, amount, payment_mode, note) VALUES (?, ?, ?, ?, ?)').run(req.params.id, month, parseFloat(amount), payment_mode, note || null);
    res.status(201).json(db.prepare('SELECT * FROM fees WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/students/fees/:feeId
router.delete('/fees/:feeId', (req, res) => {
  try {
    db.prepare('DELETE FROM fees WHERE id = ?').run(req.params.feeId);
    res.json({ message: 'Fee record deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
