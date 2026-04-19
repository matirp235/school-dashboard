// ─── StudentPrintView.jsx ─────────────────────────────────────────────────────
import { forwardRef } from 'react';

const StudentPrintView = forwardRef(({ students }, ref) => (
  <div ref={ref} className="p-8 font-sans">
    <h1 className="text-2xl font-bold mb-1">Student Register</h1>
    <p className="text-sm text-gray-500 mb-6">Printed on {new Date().toLocaleDateString('en-IN')}</p>
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100">
          {['#','Name','Class','Roll No','Guardian','Contact'].map(h => (
            <th key={h} className="border border-gray-300 px-3 py-2 text-left font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {students.map((s, i) => (
          <tr key={s.id} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
            <td className="border border-gray-200 px-3 py-2">{i + 1}</td>
            <td className="border border-gray-200 px-3 py-2">{s.full_name}</td>
            <td className="border border-gray-200 px-3 py-2">Class {s.class}{s.section ? ` – ${s.section}` : ''}</td>
            <td className="border border-gray-200 px-3 py-2">{s.roll_no || '—'}</td>
            <td className="border border-gray-200 px-3 py-2">{s.guardian_name}</td>
            <td className="border border-gray-200 px-3 py-2">{s.contact_primary}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p className="text-xs text-gray-400 mt-4">Total: {students.length} students</p>
  </div>
));
export default StudentPrintView;