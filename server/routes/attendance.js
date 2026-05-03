import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/attendance?date=YYYY-MM-DD&class=&board=
// Returns all students for filters + their attendance status for that date
router.get('/', (req, res) => {
  try {
    const { date, class: cls, board } = req.query;
    if (!date) return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });

    let sql = `
      SELECT s.id, s.name, s.roll_number, s.class, s.board, s.photo,
             a.status, a.note, a.id AS attendance_id
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
      WHERE 1=1
    `;
    const params = [date];
    if (cls)   { sql += ' AND s.class = ?';  params.push(cls); }
    if (board) { sql += ' AND s.board = ?';  params.push(board); }
    sql += ' ORDER BY s.name ASC';

    res.json(db.prepare(sql).all(...params));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/attendance/student/:studentId?month=MM&year=YYYY
// Monthly attendance for one student
router.get('/student/:studentId', (req, res) => {
  try {
    const { month, year } = req.query;
    let sql = 'SELECT * FROM attendance WHERE student_id = ?';
    const params = [req.params.studentId];
    if (month && year) {
      sql += ` AND strftime('%m', date) = ? AND strftime('%Y', date) = ?`;
      params.push(String(month).padStart(2, '0'), String(year));
    }
    sql += ' ORDER BY date ASC';
    res.json(db.prepare(sql).all(...params));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/attendance/student/:studentId/summary
// Monthly summary for a student (all months with data)
router.get('/student/:studentId/summary', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        strftime('%Y-%m', date) AS month,
        COUNT(*)                AS total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN status = 'absent'  THEN 1 ELSE 0 END) AS absent,
        SUM(CASE WHEN status = 'late'    THEN 1 ELSE 0 END) AS late,
        ROUND(
          SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1
        ) AS attendance_pct
      FROM attendance
      WHERE student_id = ?
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC
    `).all(req.params.studentId);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/attendance/bulk
// Body: { date, records: [{ student_id, status, note }] }
router.post('/bulk', (req, res) => {
  try {
    const { date, records } = req.body;
    if (!date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'date and records[] are required' });
    }

    const upsert = db.prepare(`
      INSERT INTO attendance (student_id, date, status, note)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(student_id, date) DO UPDATE SET status = excluded.status, note = excluded.note
    `);

    const saveAll = db.transaction((rows) => {
      for (const r of rows) {
        upsert.run(r.student_id, date, r.status || 'present', r.note || null);
      }
    });

    saveAll(records);
    res.json({ message: `Saved attendance for ${records.length} students on ${date}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/attendance/:id  — update a single record
router.put('/:id', (req, res) => {
  try {
    const { status, note } = req.body;
    db.prepare('UPDATE attendance SET status=?, note=? WHERE id=?').run(status, note || null, req.params.id);
    res.json(db.prepare('SELECT * FROM attendance WHERE id=?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/attendance/:id
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM attendance WHERE id=?').run(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
