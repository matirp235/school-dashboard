import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import HomePage from "./modules/home/HomePage.jsx";
import StudentsPage from "./modules/students/StudentsPage.jsx";
import TeachersPage from "./modules/teachers/TeachersPage.jsx";
import ExpensesPage from "./modules/expenses/ExpensesPage.jsx";

function App() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar - Fixed width */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;