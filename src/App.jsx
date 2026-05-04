import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar         from './components/Sidebar.jsx';
import ProtectedRoute  from './components/ProtectedRoute.jsx';
import LoginPage       from './modules/auth/LoginPage.jsx';
import HomePage        from './modules/home/HomePage.jsx';
import StudentsPage    from './modules/students/StudentsPage.jsx';
import TeachersPage    from './modules/teachers/TeachersPage.jsx';
import ExpensesPage    from './modules/expenses/ExpensesPage.jsx';
import AttendancePage  from './modules/attendance/AttendancePage.jsx';
import ContactPage     from './modules/contact/ContactPage.jsx';

function AppShell({ children }) {
  return (
    <div className="flex bg-gray-50 min-h-screen font-sans text-gray-800">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppShell><HomePage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/students" element={
        <ProtectedRoute>
          <AppShell><StudentsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/teachers" element={
        <ProtectedRoute>
          <AppShell><TeachersPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/expenses" element={
        <ProtectedRoute>
          <AppShell><ExpensesPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute>
          <AppShell><AttendancePage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/contact" element={
        <ProtectedRoute>
          <AppShell><ContactPage /></AppShell>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
