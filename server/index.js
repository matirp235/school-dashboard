import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

import studentsRouter   from './routes/students.js';
import teachersRouter   from './routes/teachers.js';
import expensesRouter   from './routes/expenses.js';
import progressRouter   from './routes/progress.js';
import attendanceRouter from './routes/attendance.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const uploadsDir = join(__dirname, 'uploads');
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.use('/api/students',   studentsRouter);
app.use('/api/teachers',   teachersRouter);
app.use('/api/expenses',   expensesRouter);
app.use('/api/progress',   progressRouter);
app.use('/api/attendance', attendanceRouter);

app.get('/api/backup', (_req, res) => {
  const dbPath = join(__dirname, '..', 'school.db');
  const date   = new Date().toISOString().slice(0, 10);
  res.download(dbPath, `school-backup-${date}.db`);
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`✅  Server running on http://localhost:${PORT}`));
