# 🏫 EduDash — School Management Dashboard

## 📌 Overview

EduDash is a full-stack, locally-hosted school management system built for small to mid-sized institutions. It provides a single, secure interface for managing students, staff, finances, attendance, and academic progress — with no internet or subscription required.

All data is stored in a single SQLite file (`school.db`) making backups as simple as copying one file.

---

## 🛠️ Tech Stack

| Layer      | Technology |
|---|---|
| Frontend   | React 18 (Vite), Tailwind CSS, React Router v6 |
| State      | Zustand (one store per domain) |
| Backend    | Node.js + Express (ES Modules) |
| Database   | SQLite via `better-sqlite3` (WAL mode) |
| Auth       | bcryptjs password hashing, token-based sessions |
| File uploads | Multer (profile photos → `server/uploads/`) |
| Print      | Native browser print via generated HTML windows |

---

## 🗂️ Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| username | TEXT UNIQUE | Default: `admin` |
| password | TEXT | bcrypt hashed |
| role | TEXT | `admin` (only role currently) |
| created_at | TEXT | datetime |

### `students`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT | Required |
| roll_number | TEXT UNIQUE | Optional |
| class | TEXT | Required (1–12) |
| board | TEXT | `CBSE` / `ICSE` / `State Board` |
| guardian_name | TEXT | |
| phone | TEXT | |
| address | TEXT | |
| date_of_birth | TEXT | |
| date_of_joining | TEXT | |
| security_deposit | REAL | Refundable deposit |
| photo | TEXT | Path to uploaded file |
| created_at | TEXT | |

### `fees`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| student_id | INTEGER FK | → students(id) CASCADE |
| month | TEXT | e.g. "April 2025" |
| amount | REAL | |
| payment_mode | TEXT | Cash / UPI / Cheque |
| note | TEXT | Optional |
| paid_on | TEXT | datetime |

### `teachers`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT | Required |
| employee_id | TEXT UNIQUE | |
| department | TEXT | |
| designation | TEXT | |
| qualification | TEXT | |
| subjects | TEXT | Comma-separated |
| phone | TEXT | |
| email | TEXT | |
| date_of_joining | TEXT | |
| photo | TEXT | |

### `expenses`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| title | TEXT | Required |
| amount | REAL | Required |
| category | TEXT | Must match an `expense_categories.name` |
| description | TEXT | Optional |
| expense_date | TEXT | date |

### `expense_categories`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT UNIQUE | |
| color | TEXT | Hex color for UI badge |
| is_default | INTEGER | `1` = protected, cannot delete |

**Default categories (seeded on first run):** Salary, Maintenance, Utilities, Events, Supplies

### `progress_reports`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| student_id | INTEGER FK | → students(id) CASCADE |
| exam_name | TEXT | e.g. "Unit Test 1", "Half Yearly" |
| subject | TEXT | |
| marks | REAL | |
| max_marks | REAL | Default 100 |
| exam_date | TEXT | |
| remarks | TEXT | Optional |

### `attendance`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| student_id | INTEGER FK | → students(id) CASCADE |
| date | TEXT | YYYY-MM-DD |
| status | TEXT | `present` / `absent` / `late` |
| note | TEXT | Optional |
| UNIQUE | (student_id, date) | One record per student per day |

---

## ✨ Features

### 🔐 Authentication
- Secure login with bcrypt-hashed passwords
- Token-based sessions (24-hour expiry)
- Session persists across browser refreshes (localStorage)
- Change password from sidebar user menu
- All routes protected — redirect to `/login` if not authenticated
- **Default credentials:** `admin` / `admin123`

### 📊 Dashboard (Home)
- Personalized greeting based on time of day
- Live stats: Total Students, Active Staff, Monthly Expenses
- Editable announcement banner (stored in localStorage)
- One-click database backup (downloads `school-backup-YYYY-MM-DD.db`)

### 👨‍🎓 Students
- Full CRUD with profile photo upload
- **Board selection:** CBSE / ICSE / State Board
- **Cascading filter:** Board → Class (class list updates based on selected board)
- Search by name or roll number
- Security deposit tracking
- Student profile modal with **4 tabs:**
  - **Overview** — all personal details
  - **Fee Ledger** — add/delete payments (Cash / UPI / Cheque)
  - **Progress Report** — exam marks (see below)
  - **Attendance** — monthly attendance summary
- 🖨️ **Print full student report** — all 4 sections in one document

### 📋 Progress Reports (per student)
- Add an exam with multiple subjects in one form
- Preset exam names: Unit Test 1–3, Half Yearly, Pre-Board, Annual Exam
- Grade calculation: A1 (91%+) → A2 → B1 → B2 → C1 → C2 → D → E (Fail < 33%)
- Accordion view per exam — expand/collapse
- Inline edit of individual marks
- Delete a single mark or an entire exam
- Per-exam summary cards with percentage and colour coding
- Grand total row per exam

### 📅 Attendance
- Daily attendance page — select any past date
- Filter by Board and/or Class
- **Mark All Present / Mark All Absent** in one click
- Per-student toggle buttons: **P** (Present) / **A** (Absent) / **L** (Late)
- Live summary bar: total, present, absent, late, percentage
- Unsaved-changes indicator — changes held in draft until "Save All"
- Bulk upsert — re-marking a day overwrites previous records
- Monthly attendance summary visible in student profile tab

### 👩‍🏫 Teachers / Staff
- Full CRUD with profile photo
- Department, designation, qualification, subjects
- Search by name or employee ID
- Filter by department
- 🖨️ **Print full staff list**

### 💰 Expenses
- Record expenses with title, amount, category, date, description
- **Manage Categories** — add custom categories with colour picker
  - 5 default categories (protected, cannot delete)
  - Custom categories deletable if no expenses use them
- Filter by month, year, and category
- Category breakdown summary cards with colour-coded badges
- Grand total auto-calculated
- 🖨️ **Print expense report** — includes category breakdown + transaction table

### 🖨️ Print System
All print functions open a styled browser print window with no external dependencies:
- **Student Report:** Student Info → Progress Report → Attendance → Fee Ledger
- **Staff List:** Full teacher directory table
- **Expense Report:** Category breakdown + transaction details + grand total

---

## 🔄 Core User Flows

### 1. First Login
1. Open `http://localhost:5173`
2. Enter `admin` / `admin123`
3. Click sidebar avatar → **Change Password**

### 2. Admit a New Student
1. Students → **+ Add Student**
2. Fill name, roll number, board, class, guardian, phone, deposit
3. Upload photo → **Add Student**
4. Click 👁️ View → **Fee Ledger** tab → add first fee payment

### 3. Record Daily Attendance
1. Attendance → select date + board + class
2. Click **✓ All Present** to mark everyone, then toggle individual exceptions
3. Click **💾 Save All**

### 4. Add Exam Marks
1. Students → 👁️ View → **Progress Report** tab
2. Click **+ Add Exam Marks**
3. Select exam name, date → add subjects with marks
4. Click **Save Marks** — grades calculate automatically

### 5. Print a Student Report
1. Students → 👁️ View → **🖨️ Print Report**
2. Browser print dialog opens with full report:
   Student Info → Progress Report → Attendance → Fee Ledger

### 6. Add a Custom Expense Category
1. Expenses → **🏷️ Manage Categories**
2. Type category name, pick a colour → **+ Add**

### 7. Take a Database Backup
1. Dashboard → **📥 Weekly Backup**
2. File downloads as `school-backup-YYYY-MM-DD.db`
3. Also backup `server/uploads/` for photos

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login — returns `{ token, username, role }` |
| POST | `/api/auth/logout` | Invalidate session token |
| GET  | `/api/auth/me` | Validate token, return user info |
| POST | `/api/auth/change-password` | Change password (requires auth) |
| GET  | `/api/students?search=&board=&class=` | List students with filters |
| POST | `/api/students` | Create student (multipart/form-data) |
| PUT  | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student + photo |
| GET  | `/api/students/:id/fees` | List fees for a student |
| POST | `/api/students/:id/fees` | Add fee payment |
| DELETE | `/api/students/fees/:feeId` | Delete a fee record |
| GET  | `/api/teachers?search=&department=` | List teachers |
| POST | `/api/teachers` | Create teacher |
| PUT  | `/api/teachers/:id` | Update teacher |
| DELETE | `/api/teachers/:id` | Delete teacher |
| GET  | `/api/expenses?month=&year=&category=` | List expenses |
| POST | `/api/expenses` | Record expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET  | `/api/categories` | List expense categories |
| POST | `/api/categories` | Add category |
| DELETE | `/api/categories/:id` | Delete custom category |
| GET  | `/api/progress/:studentId` | All marks for a student |
| GET  | `/api/progress/:studentId/summary` | Per-exam totals + percentage |
| POST | `/api/progress` | Add marks (single or array) |
| PUT  | `/api/progress/:id` | Edit a mark |
| DELETE | `/api/progress/:id` | Delete a mark |
| DELETE | `/api/progress/student/:sid/exam/:name` | Delete entire exam |
| GET  | `/api/attendance?date=&class=&board=` | Students + status for a date |
| GET  | `/api/attendance/student/:id/summary` | Monthly summary for student |
| POST | `/api/attendance/bulk` | Save attendance for multiple students |
| GET  | `/api/backup` | Download school.db file |

All protected endpoints require header: `x-auth-token: <token>`

---

## 🚀 Future Enhancements

- 🔐 Role-based access (Teacher / Accountant view)
- 📤 Export to Excel / PDF
- 📲 SMS / WhatsApp fee reminders
- 📈 Analytics dashboard (attendance trends, fee collection graphs)
- 🏫 Multi-branch / multi-school support
- 💳 Online fee payment (Razorpay / Stripe)
- 📆 Timetable / class scheduling
- 🔔 Notification system

---

## 🧱 Architecture Notes

- **ES Modules throughout** — both server and client use `import/export` (package.json has `"type": "module"`)
- **Service layer isolation** — all `fetch()` calls live in `src/services/`. Migrating to PostgreSQL only requires changing `server/db.js` and route SQL — zero frontend changes
- **Draft pattern for attendance** — changes are held in Zustand `draft` state and only written to DB on explicit Save, preventing accidental partial saves
- **Print without libraries** — `printUtils.js` generates self-contained HTML and opens a native browser print window. No PDF libraries, no dependencies
- **Token auth without JWT** — sessions stored in a server-side `Map` (in-memory). Survives normal use; clears on server restart (intentional for a local app)
