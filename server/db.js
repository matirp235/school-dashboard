import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 1. Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Setup directory for uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 3. Initialize Database
const db = new Database(path.join(__dirname, '..', 'school.db'));

// Enable WAL mode — better performance for concurrent reads
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 4. Schema initialization
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

// 5. Use export default instead of module.exports
export default db;