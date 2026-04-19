import { useState, useEffect } from 'react';
import { useStudentStore } from '../../store/studentStore.js';
import StudentForm from './StudentForm.jsx';
// IMPORTANT: If you haven't created this file yet, comment the next line out!
// import StudentDetailView from './StudentDetailView.jsx'; 

export default function StudentsPage() {
  const { students, fetchAll } = useStudentStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // State for the View section
  const [viewingStudent, setViewingStudent] = useState(null); 

 useEffect(() => {
    if (fetchAll) {
      fetchAll(); 
    }
  }, []); // Keep this array totally empty!

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Students Directory</h1>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Add Student
        </button>
      </div>

      {/* Standard Table Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Class</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Guardian</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Deposit</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students && students.length > 0 ? (
              students.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{student.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{student.class} {student.section ? `(${student.section})` : ''}</td>
                  <td className="px-6 py-4 text-gray-600">{student.guardian_name}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">₹{student.security_deposit || 0}</td>
                  <td className="px-6 py-4 flex gap-3">
                    <button 
                      onClick={() => setViewingStudent(student)} 
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  No students found. Click "Add Student" to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Enroll New Student</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <StudentForm onClose={() => setIsFormOpen(false)} />
          </div>
        </div>
      )}

      {/* View Modal Overlay (Uncomment the component inside when you create StudentDetailView.jsx) */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">Student File</h2>
              <button onClick={() => setViewingStudent(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            
            {/* If StudentDetailView is throwing errors, comment this line out temporarily */}
            {/* <StudentDetailView student={viewingStudent} onClose={() => setViewingStudent(null)} /> */}
            <div className="p-4 text-center text-gray-500">
               Detail View Component is under construction...
            </div>

          </div>
        </div>
      )}
    </div>
  );
}