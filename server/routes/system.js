// server/routes/system.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Route to download the SQLite database file
router.get('/backup', (req, res) => {
  const dbPath = path.join(__dirname, '../school.db');
  
  // Check if file exists just to be safe
  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: 'Database file not found' });
  }

  // Generate a dynamic filename with today's date
  const date = new Date().toISOString().slice(0, 10);
  const filename = `school-backup-${date}.db`;

  // Trigger the file download
  res.download(dbPath, filename, (err) => {
    if (err) {
      console.error("Backup download failed:", err);
      // Only send error if headers haven't been sent yet
      if (!res.headersSent) res.status(500).send("Backup failed");
    }
  });
});

export default router;