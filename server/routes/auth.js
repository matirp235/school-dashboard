import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import db from '../db.js';

const router = Router();

// In-memory session store  { token -> { userId, username, role, expiresAt } }
const sessions = new Map();

function createSession(user) {
  const token     = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
  sessions.set(token, { userId: user.id, username: user.username, role: user.role, expiresAt });
  return token;
}

// Middleware — attach to any route that needs auth
export function requireAuth(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired — please log in again' });
  }
  req.user = session;
  next();
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim().toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

    const token = createSession(user);
    res.json({ token, username: user.username, role: user.role });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const token = req.headers['x-auth-token'];
  if (token) sessions.delete(token);
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me  — validate token and return user info
router.get('/me', requireAuth, (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ error: 'Both fields required' });
    if (new_password.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
    if (!bcrypt.compareSync(current_password, user.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.user.userId);
    res.json({ message: 'Password updated successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
