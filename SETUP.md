# School Dashboard — Setup Guide

## One-time setup (do this once)

### Step 1 — Install Node.js
Download Node.js v20 LTS from https://nodejs.org and install it.
Verify: open Terminal / Command Prompt and run:
```
node -v
```
You should see `v20.x.x`.

### Step 2 — Copy the project
Place the `school-dashboard` folder anywhere on your machine (Desktop, D: drive, etc.)

### Step 3 — Install dependencies
Open Terminal in the project folder and run:
```
npm install
```
This downloads all required packages. Takes 2–3 minutes. Internet required only this once.

---

## Daily use — start the app

```
npm start
```

This starts both the backend server and the frontend.
Open your browser and go to: **http://localhost:5173**

> The database file `school.db` is created automatically on first run.

---

## Backup your data

The entire database is stored in one file: `school.db` (in the project root folder).
Photos are stored in: `server/uploads/`

**To backup:** Copy both `school.db` and `server/uploads/` to a USB drive or Google Drive.

**To restore:** Paste them back into the same locations and restart the app.

---

## Access from another computer on the same network (optional)

Find your machine's local IP address:
- Windows: run `ipconfig` → look for IPv4 address (e.g. `192.168.1.5`)
- Ubuntu: run `hostname -I`

On the other computer, open a browser and go to:
```
http://192.168.1.5:5173
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm install` fails | Check internet connection. Try again. |
| Port 5000 already in use | Change PORT in `.env` to 5001 |
| Database locked error | Restart the app (`npm start`) |
| Photos not showing | Check `server/uploads/` folder exists |

---

## Future upgrade path

When ready to scale to multiple campuses or cloud hosting:
1. Install PostgreSQL
2. Replace `server/db.js` with a pg connection
3. Update SQL in `server/routes/` (syntax is ~95% identical)
4. Deploy `server/` to any Node.js host (Railway, Render, VPS)
5. Build frontend: `npm run build` → deploy `dist/` to Nginx or Vercel

**The React UI modules require zero changes.**


/*---------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------*/
/*---------------------------------*/                             /*---------------------------------*/
/*------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------*/

# School Dashboard — Setup Guide
> Works on macOS (Intel & Apple Silicon) and Windows 10/11

---

## macOS Setup

### Step 1 — Install Node.js

**Option A — Direct download (recommended for non-developers)**
1. Go to https://nodejs.org
2. Download **Node.js v20 LTS**
3. Open the `.pkg` file and follow the installer
4. Verify installation — open **Terminal** (search "Terminal" in Spotlight) and run:
```
node -v
npm -v
```
You should see `v20.x.x` and `10.x.x`.

**Option B — Using Homebrew (if you already have it)**
```
brew install node@20
```

---

### Step 2 — Place the project folder

Copy the `school-dashboard` folder anywhere you like, for example:
```
/Users/yourname/Desktop/school-dashboard
```

---

### Step 3 — Install dependencies

Open **Terminal** and navigate to the project folder:
```bash
cd ~/Desktop/school-dashboard
npm install
```
> Internet required only for this step. Takes 2–3 minutes.

If you see a `better-sqlite3` build error on Apple Silicon (M1/M2/M3), run:
```bash
npm install --build-from-source
```

---

### Step 4 — Start the app

```bash
npm start
```

Open your browser and visit: **http://localhost:5173**

The database file `school.db` is created automatically on first run.

---

### Create a one-click launcher (Mac)

So staff don't need to use Terminal daily:

1. Open **Automator** (search in Spotlight)
2. Choose **New Document → Application**
3. Search for **"Run Shell Script"** and drag it in
4. Paste this script:
```bash
cd /Users/yourname/Desktop/school-dashboard
/usr/local/bin/npm start
open http://localhost:5173
```
> On Apple Silicon, replace `/usr/local/bin/npm` with `/opt/homebrew/bin/npm`
5. Save as **"School Dashboard.app"** on the Desktop
6. Double-click it to start the app anytime — no Terminal needed

---

### Backup (Mac)

| What to backup | Location |
|---|---|
| Database | `school-dashboard/school.db` |
| Photos | `school-dashboard/server/uploads/` |

Copy both to a USB drive or iCloud Drive weekly.

To restore: paste them back and run `npm start`.

---

### macOS Troubleshooting

| Problem | Fix |
|---|---|
| `node: command not found` | Restart Terminal after installing Node.js |
| Port 5000 in use (AirPlay Receiver conflict) | macOS Monterey+ uses port 5000 for AirPlay. Change `PORT=5001` in `.env` and update `vite.config.js` proxy to `http://localhost:5001` |
| `better-sqlite3` build fails on M1/M2/M3 | Run `npm install --build-from-source` |
| App opens but shows blank page | Wait 5 seconds and refresh — Vite may still be starting |
| `EACCES` permission error on npm install | Run `sudo npm install` and enter your Mac password |

---
---

## Windows Setup

### Step 1 — Install Node.js

1. Go to https://nodejs.org
2. Download **Node.js v20 LTS** (Windows Installer `.msi`)
3. Run the installer — keep all default options checked
   > ✅ Make sure **"Add to PATH"** is checked during install
4. Verify — open **Command Prompt** (search "cmd" in Start Menu) and run:
```
node -v
npm -v
```
You should see `v20.x.x` and `10.x.x`.

---

### Step 2 — Install build tools (required for SQLite on Windows)

`better-sqlite3` needs C++ build tools to compile on Windows.

**Easy way — let Node.js installer do it:**
During the Node.js install, on the "Tools for Native Modules" screen, check:
> ✅ **Automatically install the necessary tools**

This installs Visual Studio Build Tools automatically. It will open a PowerShell window — let it complete (takes 5–10 minutes).

**If you skipped that step**, run this in Command Prompt as Administrator:
```
npm install --global windows-build-tools
```

---

### Step 3 — Place the project folder

Copy the `school-dashboard` folder anywhere, for example:
```
C:\Users\YourName\Desktop\school-dashboard
```

---

### Step 4 — Install dependencies

Open **Command Prompt**, navigate to the project and install:
```cmd
cd C:\Users\YourName\Desktop\school-dashboard
npm install
```

---

### Step 5 — Start the app

```cmd
npm start
```

Open your browser and visit: **http://localhost:5173**

---

### Create a one-click launcher (Windows)

So staff don't need Command Prompt daily:

1. Right-click on Desktop → **New → Text Document**
2. Rename it to `Start School Dashboard.bat`
   > When prompted, confirm changing the extension to `.bat`
3. Right-click the file → **Edit** and paste:
```bat
@echo off
cd /d "C:\Users\YourName\Desktop\school-dashboard"
start npm start
timeout /t 4
start http://localhost:5173
```
4. Save and close
5. Double-click `Start School Dashboard.bat` to launch the app

> To make it look nicer: right-click the .bat → **Send to → Desktop (create shortcut)**, then right-click the shortcut → **Properties → Change Icon**

---

### Backup (Windows)

| What to backup | Location |
|---|---|
| Database | `school-dashboard\school.db` |
| Photos | `school-dashboard\server\uploads\` |

Copy both to a USB drive or OneDrive weekly.

To restore: paste them back and run `Start School Dashboard.bat`.

---

### Windows Troubleshooting

| Problem | Fix |
|---|---|
| `node` is not recognized | Restart Command Prompt after installing Node.js. If still failing, re-install and ensure "Add to PATH" is checked |
| `better-sqlite3` build fails | Install Visual Studio Build Tools (see Step 2 above) |
| Port 5000 already in use | Change `PORT=5001` in `.env` and update proxy in `vite.config.js` |
| `EPERM` or permission denied | Run Command Prompt as Administrator |
| Antivirus blocks npm install | Temporarily disable real-time protection during install, then re-enable |
| App opens but API calls fail | Make sure both frontend (5173) and backend (5000) are running — check two windows appear in Command Prompt |

---
---

## Accessing from other devices on the same network

Works the same on both Mac and Windows:

**Step 1 — Find your machine's local IP**

- **Mac:** System Settings → Wi-Fi → Details → IP Address
  or run in Terminal: `ipconfig getifaddr en0`
- **Windows:** Settings → Network → Properties → IPv4 address
  or run in cmd: `ipconfig` → look for **IPv4 Address**

Example IP: `192.168.1.10`

**Step 2 — Open on any other device**

On any phone, tablet, or PC connected to the same Wi-Fi:
```
http://192.168.1.10:5173
```

> The server machine must be running `npm start` for this to work.

---

## Node.js version compatibility

| Node.js Version | Status |
|---|---|
| v20 LTS | ✅ Recommended |
| v18 LTS | ✅ Works fine |
| v16 | ⚠️ May work but not tested |
| v14 or below | ❌ Not supported |