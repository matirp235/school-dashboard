🏫 School Management Dashboard
📌 Overview

The School Management Dashboard is a lightweight, full-stack web application designed to help school administrators manage students, staff, financial records (expenses and fees), and day-to-day school operations from a centralized interface.

It focuses on simplicity, performance, and scalability—making it suitable for small to mid-sized institutions.

🛠 Tech Stack
Frontend
React.js (Vite) – Fast and modern UI development
Tailwind CSS – Utility-first styling
Zustand – Lightweight state management
React Router – Client-side navigation
Backend
Node.js – Runtime environment
Express.js – API framework
Database
SQLite (via better-sqlite3)
WAL mode enabled for high-performance concurrent reads
File Handling
Multer – Handles file uploads (e.g., profile photos)
✨ Key Modules & Features
1. 📊 Dashboard (Home Page)
Dynamic Greeting
Displays a personalized greeting based on time of day
Live Metrics
Total Students
Active Staff
Today’s Attendance
Monthly Expenses
Custom Announcement Banner
Editable banner for alerts, admissions, holidays
Stored in localStorage
1-Click System Backup
Download live SQLite DB (school.db)
File saved as: school-backup-[DATE].db
2. 👨‍🎓 Students Directory
Student Management (CRUD)
Add, edit, delete student records
Profile Photos
Upload and display student images
Search & Filter
Search by Name / Roll Number
Filter by Class
Security Deposit Tracking
Capture refundable deposit during admission
Fee Management Ledger
Track payments inside student profile
Payment modes:
Cash
UPI / Online
Cheque
3. 👩‍🏫 Teachers / Staff Directory
Staff Management (CRUD)
Add, edit, delete staff
Profile Photos
Upload/display staff images
Academic Profiles
Department
Designation
Qualification
Subjects taught
Search & Filter
Search by Name / Employee ID
Filter by Department
4. 💰 School Expenses
Expense Tracking
Categories:
Salary
Maintenance
Utilities
Events
Supplies
Dynamic Filtering
Filter by Month & Year
Category Breakdown
Automatic grouping of expenses
Grand Total Calculation
Real-time expense aggregation
5. 📩 Contact & Support
School Details
Address
Phone number
Working hours
Contact Form
Send internal messages to admin
🔄 Core User Flows
1. 🧾 Admitting a New Student & Collecting Fees
Navigate to Students
Click + Add Student
Enter:
Name
Class
Guardian details
Phone number
Security Deposit
Profile photo
Click Save Student

➡️ To add fees:

Click 👁️ View on the student
Scroll to Fee Management
Enter:
Month
Amount
Payment mode
Click + Add Fee

✅ Fee ledger updates instantly (no page reload)

2. 📢 Updating Dashboard Announcement
Go to Dashboard
Click Update Banner
Edit:
Tag
Headline
Subtitle
Click Save Changes

✅ Changes reflect instantly across the app

3. 📊 Generating Financial Summary
Go to Expenses
Click + Record Expense
Enter expense details
Use filters:
Month
Year

✅ System automatically:

Calculates Grand Total
Displays Category Breakdown
4. 💾 Taking a Database Backup
Navigate to Dashboard
Click 📥 Weekly Backup
File downloads automatically:
school-backup-[DATE].db
🧱 Architecture Highlights
Modular structure (Students, Fees, Attendance, Expenses)
SQLite with WAL mode for performance
Clean separation of frontend and backend
Scalable for future enhancements (payments, notifications, reports)
🚀 Future Enhancements (Recommended)
🔐 Role-Based Access (Admin / Teacher / Accountant)
💳 Online Fee Payment Integration (Razorpay, Stripe)
📈 Analytics Dashboard (graphs & trends)
📤 Export Reports (Excel / PDF)
📲 SMS / WhatsApp Notifications
🏫 Multi-school Support
📌 Summary

This application evolves from a basic CRUD system into a mini school ERP, providing:

Student lifecycle management
Financial tracking
Operational visibility
Scalable architecture

🧱 Database ER Diagram
erDiagram

    STUDENTS {
        int id PK
        string name
        string class
        string roll_number
        string father_name
        string mother_name
        string guardian_name
        string phone
        decimal security_deposit
        string photo_url
        datetime created_at
    }

    FEES {
        int id PK
        int student_id FK
        decimal amount
        string month_year
        string payment_mode
        string comment
        string receipt_number
        string status
        datetime created_at
    }

    ATTENDANCE {
        int id PK
        int student_id FK
        date attendance_date
        string status
    }

    STAFF {
        int id PK
        string name
        string employee_id
        string department
        string designation
        string qualification
        string subjects
        string phone
        string photo_url
        datetime created_at
    }

    EXPENSES {
        int id PK
        string category
        decimal amount
        string description
        int month
        int year
        datetime created_at
    }

    STUDENTS ||--o{ FEES : "has"
    STUDENTS ||--o{ ATTENDANCE : "has"