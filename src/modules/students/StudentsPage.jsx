import { useState, useEffect } from 'react';
import { useStudentStore } from '../../store/studentStore.js';
import StudentForm from './StudentForm.jsx';
import StudentDetailView from './StudentDetailView.jsx'; 

const CLASSES = ['Nursery','LKG','UKG','1','2','3','4','5','6','7','8','9','10','11','12'];

export default function StudentsPage() {
  const { students, fetchAll } = useStudentStore();
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [editingStudent, setEditingStudent] = useState(null); 
  const [viewingStudent, setViewingStudent] = useState(null); 

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');

  useEffect(() => {
    if (fetchAll) {
      fetchAll(); 
    }
  }, []); // Keep this array totally empty!

  // Derive filtered students based on search and class filter
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (student.roll_no && student.roll_no.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = filterClass === '' || student.class === filterClass;
    return matchesSearch && matchesClass;
  });

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

      {/* Search and Filter Controls */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input 
          type="text" 
          placeholder="Search by name or roll no..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select 
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Classes</option>
          {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
        </select>
      </div>

      {/* Standard Table Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-600">Roll No</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Class</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Contact</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents && filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-medium">{student.roll_no || '-'}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{student.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{student.class} {student.section ? `(${student.section})` : ''}</td>
                  <td className="px-6 py-4 text-gray-600">{student.contact_primary}</td>
                  <td className="px-6 py-4 flex gap-4">
                    <button onClick={() => setViewingStudent(student)} className="text-blue-600 hover:text-blue-800 font-medium">👁️ View</button>
                    <button onClick={() => setEditingStudent(student)} className="text-amber-600 hover:text-amber-800 font-medium">✏️ Edit</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  {students.length === 0 ? "No students found. Click 'Add Student' to begin." : "No students match your search criteria."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Unified Modal for Add OR Edit Student */}
      {(isFormOpen || editingStudent) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">
                {editingStudent ? 'Edit Student Record' : 'Enroll New Student'}
              </h2>
              <button onClick={() => { setIsFormOpen(false); setEditingStudent(null); }} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
            </div>
            <StudentForm initial={editingStudent} onClose={() => { setIsFormOpen(false); setEditingStudent(null); }} />
          </div>
        </div>
      )}

      {/* View Details & Fees Modal Overlay */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">Student File</h2>
              <button onClick={() => setViewingStudent(null)} className="text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>
            </div>
            <StudentDetailView student={viewingStudent} onClose={() => setViewingStudent(null)} />
          </div>
        </div>
      )}
    </div>
  );
}