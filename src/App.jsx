// ─── src/App.jsx ──────────────────────────────────────────────────────────────
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './modules/home/HomePage';
import StudentsPage from './modules/students/StudentsPage';
import TeachersPage from './modules/teachers/TeachersPage';
import ExpensesPage from './modules/expenses/ExpensesPage';

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
        </Routes>
      </main>
    </div>
  );
}