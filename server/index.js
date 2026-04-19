import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Important: ESM doesn't have __dirname by default. We create it here:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import your routes
// Note: You MUST include the .js extension in the file path for ESM
import studentRoutes from './routes/students.js';
import teacherRoutes from './routes/teachers.js';
import expenseRoutes from './routes/expenses.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use Routes
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/expenses', expenseRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`\n  School Dashboard API running at http://localhost:${PORT}`);
  console.log(`  Frontend running at http://localhost:5173\n`);
});