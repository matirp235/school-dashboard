import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/progress/:studentId
router.get('/:studentId', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM progress_reports
      WHERE student_id = ?
      ORDER BY exam_date DESC, exam_name ASC, subject ASC
    `).all(req.params.studentId);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/progress/:studentId/summary
router.get('/:studentId/summary', (req, res) => {
  try {
    const summary = db.prepare(`
      SELECT
        exam_name, exam_date,
        COUNT(*)   AS total_subjects,
        SUM(marks) AS total_marks,
        SUM(max_marks) AS total_max_marks,
        ROUND(SUM(marks) * 100.0 / NULLIF(SUM(max_marks), 0), 2) AS percentage
      FROM progress_reports
      WHERE student_id = ?
      GROUP BY exam_name, exam_date
      ORDER BY exam_date DESC
    `).all(req.params.studentId);
    res.json(summary);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/progress  (single object OR array)
router.post('/', (req, res) => {
  try {
    const entries = Array.isArray(req.body) ? req.body : [req.body];
    const stmt = db.prepare(`
      INSERT INTO progress_reports (student_id, exam_name, subject, marks, max_marks, exam_date, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((items) => {
      return items.map(item => {
        const { student_id, exam_name, subject, marks, max_marks = 100, exam_date, remarks } = item;
        if (!student_id || !exam_name || !subject || marks == null) throw new Error('student_id, exam_name, subject, and marks are required');
        const result = stmt.run(student_id, exam_name, subject, parseFloat(marks), parseFloat(max_marks), exam_date || null, remarks || null);
        return db.prepare('SELECT * FROM progress_reports WHERE id = ?').get(result.lastInsertRowid);
      });
    });
    const inserted = insertMany(entries);
    res.status(201).json(Array.isArray(req.body) ? inserted : inserted[0]);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/progress/:id
router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM progress_reports WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    const { exam_name = existing.exam_name, subject = existing.subject, marks = existing.marks, max_marks = existing.max_marks, exam_date = existing.exam_date, remarks = existing.remarks } = req.body;
    db.prepare('UPDATE progress_reports SET exam_name=?, subject=?, marks=?, max_marks=?, exam_date=?, remarks=? WHERE id=?').run(exam_name, subject, parseFloat(marks), parseFloat(max_marks), exam_date, remarks, req.params.id);
    res.json(db.prepare('SELECT * FROM progress_reports WHERE id = ?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/progress/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM progress_reports WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    db.prepare('DELETE FROM progress_reports WHERE id = ?').run(req.params.id);
    res.json({ message: 'Mark deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/progress/student/:studentId/exam/:examName
router.delete('/student/:studentId/exam/:examName', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM progress_reports WHERE student_id = ? AND exam_name = ?').run(req.params.studentId, req.params.examName);
    res.json({ message: `Deleted ${info.changes} mark(s)` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
