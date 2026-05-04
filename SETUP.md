# EduDash — Setup Guide

> Works on macOS (Intel & Apple Silicon) and Windows 10/11

---

## Prerequisites

| Requirement | Version | Check |
|---|---|---|
| Node.js | v18 or v20 LTS | `node -v` |
| npm | v9+ | `npm -v` |

---

## macOS Setup

### Step 1 — Install Node.js

**Option A — Direct download (recommended)**
1. Go to https://nodejs.org
2. Download **Node.js v20 LTS**
3. Open the `.pkg` installer and follow the steps
4. Verify in **Terminal**:
```bash
node -v   # should print v20.x.x
npm -v    # should print 10.x.x
```

**Option B — Homebrew**
```bash
brew install node@20
```

---

### Step 2 — Place the project

Copy the `school-dashboard` folder anywhere:
```
/Users/yourname/Desktop/school-dashboard
```

---

### Step 3 — Install dependencies

```bash
cd ~/Desktop/school-dashboard
npm install
```
> Internet required only for this step. Takes 2–3 minutes.

**Apple Silicon (M1/M2/M3) — if you see a `better-sqlite3` build error:**
```bash
npm install --build-from-source
```

---

### Step 4 — Start the app

```bash
npm start
```

Open your browser: **http://localhost:5173**

**First-time login:**
- Username: `admin`
- Password: `admin123`

> ⚠️ Change your password immediately after first login (sidebar → click your username → Change Password).

The database file `school.db` is created automatically on first run.

---

### Create a one-click launcher (Mac)

1. Open **Automator** → New Document → **Application**
2. Add **Run Shell Script** and paste:
```bash
cd /Users/yourname/Desktop/school-dashboard
/usr/local/bin/npm start
sleep 3
open http://localhost:5173
```
> On Apple Silicon replace `/usr/local/bin/npm` with `/opt/homebrew/bin/npm`
3. Save as **School Dashboard.app** on the Desktop

---

## Windows Setup

### Step 1 — Install Node.js

1. Go to https://nodejs.org
2. Download **Node.js v20 LTS** (Windows Installer `.msi`)
3. Run the installer — keep all defaults
   > ✅ Ensure **"Add to PATH"** is checked
4. Verify in **Command Prompt**:
```
node -v
npm -v
```

---

### Step 2 — Install build tools (required for SQLite)

During Node.js install, on the **"Tools for Native Modules"** screen, check:
> ✅ **Automatically install the necessary tools**

This opens PowerShell and installs Visual Studio Build Tools — let it complete (5–10 min).

**If you skipped that step**, run in Command Prompt as Administrator:
```
npm install --global windows-build-tools
```

---

### Step 3 — Install dependencies

```cmd
cd C:\Users\YourName\Desktop\school-dashboard
npm install
```

---

### Step 4 — Start the app

```cmd
npm start
```

Open your browser: **http://localhost:5173**

**First-time login:** `admin` / `admin123`

---

### Create a one-click launcher (Windows)

1. Right-click Desktop → **New → Text Document**
2. Rename it to `Start EduDash.bat` (confirm changing extension)
3. Right-click → **Edit** and paste:
```bat
@echo off
cd /d "C:\Users\YourName\Desktop\school-dashboard"
start npm start
timeout /t 4
start http://localhost:5173
```
4. Save and double-click to launch

---

## Daily Use

```bash
npm start          # starts both backend (:5000) and frontend (:5173)
```

To stop: press `Ctrl+C` in the terminal.

---

## Backup & Restore

### What to backup

| Item | Location |
|---|---|
| Database | `school-dashboard/school.db` |
| Profile photos | `school-dashboard/server/uploads/` |

### How to backup

**Option 1 — Dashboard button**
Go to Dashboard → click **📥 Weekly Backup**. Downloads `school-backup-YYYY-MM-DD.db` automatically.

**Option 2 — Manual**
```bash
# Mac
cp school.db ~/Desktop/school-backup-$(date +%F).db
cp -r server/uploads ~/Desktop/uploads-backup

# Windows (Command Prompt)
copy school.db C:\Backups\school-backup-%date%.db
xcopy server\uploads C:\Backups\uploads /E /I
```

### How to restore

1. Stop the app (`Ctrl+C`)
2. Replace `school.db` with your backup file
3. Replace `server/uploads/` with your backup folder
4. Run `npm start`

---

## Accessing from other devices on the same network

**Step 1 — Find your machine's local IP**
- **Mac:** `ipconfig getifaddr en0` or System Settings → Wi-Fi → Details
- **Windows:** `ipconfig` → look for **IPv4 Address**

Example: `192.168.1.10`

**Step 2 — Update `server/index.js` CORS**

The default config already allows `*` so any device on the same network can reach the API.

**Step 3 — Open on any device**
```
http://192.168.1.10:5173
```

> The host machine must be running `npm start`.

---

## Environment Variables (`.env`)

The `.env` file in the project root is optional. Defaults work out of the box.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Backend server port |

If port 5000 is taken (common on macOS Monterey+ due to AirPlay):
1. Set `PORT=5001` in `.env`
2. Update `vite.config.js` proxy target to `http://localhost:5001`
3. Restart with `npm start`

---

## Project Dependencies

### Runtime
```
express          — HTTP server
better-sqlite3   — SQLite database
bcryptjs         — Password hashing
multer           — File upload handling
```

### Frontend
```
react / react-dom     — UI framework
react-router-dom      — Client-side routing
zustand               — State management
tailwindcss           — Utility CSS
```

### Dev
```
vite                  — Build tool + dev server
@vitejs/plugin-react  — React HMR support
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `node: command not found` | Restart terminal after installing Node.js |
| `better-sqlite3` build fails on M1/M2/M3 | Run `npm install --build-from-source` |
| `better-sqlite3` fails on Windows | Install Visual Studio Build Tools (see Step 2) |
| Port 5000 in use (Mac AirPlay) | Set `PORT=5001` in `.env`, update vite proxy |
| Login button does nothing | Check Console tab in DevTools for JS errors |
| API calls fail (Network tab red) | Confirm `vite.config.js` has the `/api` proxy block |
| Photos not showing | Check `server/uploads/` folder exists |
| Database locked error | Stop all instances of the app, restart with `npm start` |
| Forgot admin password | Run in terminal: `node -e "import('./server/db.js').then(m => { const db = m.default; const bcrypt = require('bcryptjs'); db.prepare('UPDATE users SET password=? WHERE username=?').run(bcrypt.hashSync('admin123',10),'admin'); console.log('Reset!'); })"` |
| `EACCES` permission error (Mac) | Run `sudo npm install` |
| `EPERM` permission error (Windows) | Run Command Prompt as Administrator |

---

## Upgrading to PostgreSQL (future)

When ready for cloud or multi-user hosting:

1. Install PostgreSQL and create a database
2. Replace `server/db.js` with a `pg` connection
3. Update SQL syntax in `server/routes/` (~95% identical, minor differences for `AUTOINCREMENT` → `SERIAL`, `datetime()` → `NOW()`)
4. Deploy `server/` to any Node.js host (Railway, Render, VPS)
5. Run `npm run build` → deploy `dist/` to Nginx or Vercel

**The React frontend requires zero changes.**

---

## Node.js Version Compatibility

| Version | Status |
|---|---|
| v20 LTS | ✅ Recommended |
| v18 LTS | ✅ Works fine |
| v16 | ⚠️ Not tested |
| v14 or below | ❌ Not supported (ES Modules require v14.13+, but better-sqlite3 needs v18+) |
