const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const db = new Database(path.join(__dirname, '..', 'school.db'));

// Enable WAL mode — better performance for concurrent reads
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
    photo_url   TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
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
`);

module.exports = db;
