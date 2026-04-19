import React from 'react';

export default function TeacherDetailView({ teacher, onClose }) {
  return (
    <div className="flex flex-col gap-6">
      
      {/* SECTION 1: Fixed Profile Details */}
      <section className="bg-amber-50 p-6 rounded-xl border border-amber-100 flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="flex-shrink-0">
          <div className="w-28 h-28 bg-amber-200 text-amber-700 flex items-center justify-center rounded-full text-4xl font-bold border-4 border-white shadow-md">
            {teacher.full_name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 w-full">
          <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
            👨‍🏫 Staff Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><p className="text-amber-700/80 text-xs font-semibold uppercase">Full Name</p><p className="font-bold text-gray-800">{teacher.full_name}</p></div>
            <div><p className="text-amber-700/80 text-xs font-semibold uppercase">Employee ID</p><p className="font-bold text-gray-800">{teacher.employee_id}</p></div>
            <div><p className="text-amber-700/80 text-xs font-semibold uppercase">Department</p><p className="font-bold text-gray-800">{teacher.department}</p></div>
            <div><p className="text-amber-700/80 text-xs font-semibold uppercase">Designation</p><p className="font-bold text-gray-800">{teacher.designation}</p></div>
            <div><p className="text-amber-700/80 text-xs font-semibold uppercase">Contact</p><p className="font-bold text-gray-800">{teacher.contact_primary}</p></div>
            <div><p className="text-amber-700/80 text-xs font-semibold uppercase">Joining Date</p><p className="font-bold text-gray-800">{teacher.joining_date || 'N/A'}</p></div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Academic Profile */}
      <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          📚 Academic Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Qualifications</p>
            <p className="text-gray-800 font-medium">{teacher.qualification || 'No qualifications listed.'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Subjects Taught</p>
            <div className="flex flex-wrap gap-2">
              {teacher.subjects ? teacher.subjects.split(',').map((sub, i) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold shadow-sm">
                  {sub.trim()}
                </span>
              )) : <span className="text-gray-500 font-medium">No subjects assigned.</span>}
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}