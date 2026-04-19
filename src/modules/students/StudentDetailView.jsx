import { useState, useEffect } from 'react';
import { useStudentStore } from '../../store/studentStore.js'; // Check extension
import StudentForm from './StudentForm.jsx';
import StudentDetailView from './StudentDetailView.jsx';

export default function StudentsPage() {
  const { students, fetchAll } = useStudentStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null); // State for the View section

  useEffect(() => {
    fetchAll(); // Ensure data is loaded on mount 
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students Directory</h1>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Student
        </button>
      </div>

      {/* Standard Table Layout */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3">Guardian</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map(student => (
              <tr key={student.id}>
                <td className="px-6 py-4 font-medium">{student.full_name}</td>
                <td className="px-6 py-4">{student.class}</td>
                <td className="px-6 py-4">{student.guardian_name}</td>
                <td className="px-6 py-4 flex gap-3">
                  {/* VIEW BUTTON - This triggers the two-section view */}
                  <button onClick={() => setViewingStudent(student)} className="text-blue-600">👁️ View</button>
                  <button className="text-gray-400">✏️ Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal Overlay */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <StudentDetailView 
              student={viewingStudent} 
              onClose={() => setViewingStudent(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}