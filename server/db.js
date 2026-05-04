import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH   = join(__dirname, '..', 'school.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Students ─────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT    NOT NULL,
    roll_number      TEXT    UNIQUE,
    class            TEXT    NOT NULL,
    board            TEXT    NOT NULL DEFAULT 'CBSE',
    guardian_name    TEXT,
    phone            TEXT,
    address          TEXT,
    date_of_birth    TEXT,
    date_of_joining  TEXT,
    security_deposit REAL    DEFAULT 0,
    photo            TEXT,
    created_at       TEXT    DEFAULT (datetime('now'))
  );
`);
try { db.exec(`ALTER TABLE students ADD COLUMN board TEXT NOT NULL DEFAULT 'CBSE';`); } catch (_) {}

// ─── Fees ─────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS fees (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id   INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    month        TEXT    NOT NULL,
    amount       REAL    NOT NULL,
    payment_mode TEXT    NOT NULL DEFAULT 'Cash',
    note         TEXT,
    paid_on      TEXT    DEFAULT (datetime('now'))
  );
`);

// ─── Teachers ─────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS teachers (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    employee_id     TEXT UNIQUE,
    department      TEXT,
    designation     TEXT,
    qualification   TEXT,
    subjects        TEXT,
    phone           TEXT,
    email           TEXT,
    date_of_joining TEXT,
    photo           TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
  );
`);

// ─── Expenses ─────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT NOT NULL,
    amount       REAL NOT NULL,
    category     TEXT NOT NULL DEFAULT 'Supplies',
    description  TEXT,
    expense_date TEXT DEFAULT (date('now')),
    created_at   TEXT DEFAULT (datetime('now'))
  );
`);

// ─── Expense Categories ───────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS expense_categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    color      TEXT NOT NULL DEFAULT '#6b7280',
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed default categories if table is empty
const catCount = db.prepare('SELECT COUNT(*) AS c FROM expense_categories').get().c;
if (catCount === 0) {
  const defaults = [
    { name: 'Salary',      color: '#3b82f6', is_default: 1 },
    { name: 'Maintenance', color: '#f59e0b', is_default: 1 },
    { name: 'Utilities',   color: '#10b981', is_default: 1 },
    { name: 'Events',      color: '#8b5cf6', is_default: 1 },
    { name: 'Supplies',    color: '#ef4444', is_default: 1 },
  ];
  const ins = db.prepare('INSERT INTO expense_categories (name, color, is_default) VALUES (?, ?, ?)');
  for (const c of defaults) ins.run(c.name, c.color, c.is_default);
}

// ─── Progress Reports ─────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS progress_reports (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_name   TEXT    NOT NULL,
    subject     TEXT    NOT NULL,
    marks       REAL    NOT NULL,
    max_marks   REAL    NOT NULL DEFAULT 100,
    exam_date   TEXT,
    remarks     TEXT,
    created_at  TEXT    DEFAULT (datetime('now'))
  );
`);

// ─── Attendance ───────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS attendance (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date       TEXT    NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'present',
    note       TEXT,
    created_at TEXT    DEFAULT (datetime('now')),
    UNIQUE(student_id, date)
  );
`);

// ─── Users (auth) ─────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    role       TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed admin user if no users exist
const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
if (userCount === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare(`INSERT INTO users (username, password, role) VALUES ('admin', ?, 'admin')`).run(hash);
  console.log('✅ Default admin created — username: admin | password: admin123');
}

export default db;
