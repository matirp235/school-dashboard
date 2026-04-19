import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new Database(path.join(__dirname, '..', 'school.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name   TEXT NOT NULL,
    dob         TEXT NOT NULL,
    gender      TEXT NOT NULL,
    class       TEXT NOT NULL,
    section     TEXT,
    roll_no     TEXT,
    address     TEXT,
    guardian_name  TEXT NOT NULL,
    guardian_rel   TEXT NOT NULL,
    contact_primary TEXT NOT NULL,
    contact_secondary TEXT,
    security_deposit REAL DEFAULT 0,
    photo_url   TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS student_fees (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id    INTEGER NOT NULL,
    month_year    TEXT NOT NULL,
    amount        REAL NOT NULL,
    payment_mode  TEXT NOT NULL,
    comment       TEXT,
    created_at    TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name    TEXT NOT NULL,
    dob          TEXT NOT NULL,
    gender       TEXT NOT NULL,
    employee_id  TEXT UNIQUE NOT NULL,
    department   TEXT NOT NULL,
    designation  TEXT NOT NULL,
    subjects     TEXT,
    qualification TEXT,
    contact_primary  TEXT NOT NULL,
    contact_secondary TEXT,
    address      TEXT,
    joining_date TEXT,
    photo_url    TEXT,
    created_at   TEXT DEFAULT (datetime('now')),
    updated_at   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    month       TEXT NOT NULL,
    year        INTEGER NOT NULL,
    category    TEXT NOT NULL,
    description TEXT,
    amount      REAL NOT NULL,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
  CREATE INDEX IF NOT EXISTS idx_students_name  ON students(full_name);
  CREATE INDEX IF NOT EXISTS idx_teachers_dept  ON teachers(department);
  CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses(year, month);
  CREATE INDEX IF NOT EXISTS idx_fees_student ON student_fees(student_id);
`);

// Safe Migration for Students
try {
  const tableInfo = db.pragma("table_info(students)");
  if (!tableInfo.some(col => col.name === 'security_deposit')) {
    db.exec('ALTER TABLE students ADD COLUMN security_deposit REAL DEFAULT 0');
  }
} catch (error) { console.error("Student Migration failed:", error); }

// Safe Migration for Teachers Photo
try {
  const teacherTableInfo = db.pragma("table_info(teachers)");
  if (!teacherTableInfo.some(col => col.name === 'photo_url')) {
    db.exec('ALTER TABLE teachers ADD COLUMN photo_url TEXT');
    console.log('Migration: Added photo_url to teachers table');
  }
} catch (error) { console.error("Teacher Migration failed:", error); }

export default db;