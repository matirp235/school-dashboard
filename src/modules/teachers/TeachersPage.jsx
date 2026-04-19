import { useState, useEffect } from 'react';
import { useTeacherStore } from '../../store/teacherStore.js';
import TeacherForm from './TeacherForm.jsx';
import TeacherDetailView from './TeacherDetailView.jsx';

const DEPARTMENTS = ['Mathematics', 'Science', 'Languages', 'Humanities', 'Commerce', 'Arts', 'Physical Education', 'Administration'];

export default function TeachersPage() {
  const { teachers, fetchAll } = useTeacherStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [editingTeacher, setEditingTeacher] = useState(null); 
  const [viewingTeacher, setViewingTeacher] = useState(null); 

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');

  useEffect(() => {
    if (fetchAll) fetchAll(); 
  }, [fetchAll]);

  // Derived filtered teachers
  const filteredTeachers = teachers?.filter(teacher => {
    const matchesSearch = teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          teacher.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === '' || teacher.department === filterDept;
    return matchesSearch && matchesDept;
  }) || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Directory</h1>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Add Teacher
        </button>
      </div>

      <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input 
          type="text" 
          placeholder="Search by name or Employee ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select 
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-600">Emp ID</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Department</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Contact</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map(teacher => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-medium">{teacher.employee_id}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{teacher.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{teacher.department}</td>
                  <td className="px-6 py-4 text-gray-600">{teacher.contact_primary}</td>
                  <td className="px-6 py-4 flex gap-4">
                    <button onClick={() => setViewingTeacher(teacher)} className="text-blue-600 hover:text-blue-800 font-medium">👁️ View</button>
                    <button onClick={() => setEditingTeacher(teacher)} className="text-amber-600 hover:text-amber-800 font-medium">✏️ Edit</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No staff members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Unified Add/Edit Form */}
      {(isFormOpen || editingTeacher) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">{editingTeacher ? 'Edit Staff Record' : 'Register New Teacher'}</h2>
              <button onClick={() => { setIsFormOpen(false); setEditingTeacher(null); }} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
            </div>
            <TeacherForm initial={editingTeacher} onClose={() => { setIsFormOpen(false); setEditingTeacher(null); }} />
          </div>
        </div>
      )}

      {/* View Detail Overlay */}
      {viewingTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">Staff File</h2>
              <button onClick={() => setViewingTeacher(null)} className="text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>
            </div>
            <TeacherDetailView teacher={viewingTeacher} onClose={() => setViewingTeacher(null)} />
          </div>
        </div>
      )}
    </div>
  );
}