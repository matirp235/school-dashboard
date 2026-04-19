import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import Sidebar from "./components/Sidebar.jsx";

// Pages
import HomePage from "./modules/home/HomePage.jsx";
import StudentsPage from "./modules/students/StudentsPage.jsx";
import TeachersPage from "./modules/teachers/TeachersPage.jsx";
import ExpensesPage from "./modules/expenses/ExpensesPage.jsx";
import ContactPage from "./modules/contact/ContactPage.jsx"; // <-- Make sure this is imported!

export default function App() {
  return (
    <div className="flex bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area (ml-64 pushes it to the right of the 64-width sidebar) */}
      <main className="flex-1 ml-64 min-h-screen">
        <Routes>
          {/* Exactly match these paths to the Sidebar NAV_LINKS */}
          <Route path="/" element={<HomePage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          
          {/* The Contact Route must be defined here */}
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Catch-all: If user types a bad URL, send them to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}