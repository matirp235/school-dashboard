import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH   = join(__dirname, '..', 'school.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

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

export default db;
