import { useEffect, useState } from 'react';
import useTeacherStore from '../../store/teacherStore.js';
import Modal from '../../components/Modal.jsx';
import { printTeachers } from '../../utils/printUtils.js';

const DEPARTMENTS = ['Science', 'Mathematics', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physical Education', 'Arts', 'Commerce', 'Other'];

function TeacherForm({ teacher = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm] = useState({
    name: '', employee_id: '', department: '', designation: '', qualification: '', subjects: '', phone: '', email: '', date_of_joining: '',
  });
  const [photo, setPhoto]   = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (teacher) {
      setForm({
        name: teacher.name || '', employee_id: teacher.employee_id || '', department: teacher.department || '',
        designation: teacher.designation || '', qualification: teacher.qualification || '',
        subjects: teacher.subjects || '', phone: teacher.phone || '', email: teacher.email || '',
        date_of_joining: teacher.date_of_joining || '',
      });
      if (teacher.photo) setPreview(teacher.photo);
    }
  }, [teacher]);

  function handlePhoto(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (photo) fd.append('photo', photo);
    onSubmit(fd);
  }

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
          {preview ? <img src={preview} className="w-full h-full object-cover" alt="" /> : <span className="text-2xl text-gray-300">👤</span>}
        </div>
        <label className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
          <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          📷 {preview ? 'Change Photo' : 'Upload Photo'}
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
          <input required name="name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className={inp} /></div>
        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Employee ID</label>
          <input name="employee_id" value={form.employee_id} onChange={e => setForm(p => ({...p, employee_id: e.target.value}))} className={inp} /></div>
        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
          <select name="department" value={form.department} onChange={e => setForm(p => ({...p, department: e.target.value}))} className={`${inp} bg-white`}>
            <option value="">Select</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select></div>
        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Designation</label>
          <input name="designation" value={form.designation} onChange={e => setForm(p => ({...p, designation: e.target.value}))} className={inp} /></div>
        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Qualification</label>
          <input name="qualification" value={form.qualification} onChange={e => setForm(p => ({...p, qualification: e.target.value}))} className={inp} /></div>
        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className={inp} /></div>
        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className={inp} /></div>
        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Date of Joining</label>
          <input type="date" name="date_of_joining" value={form.date_of_joining} onChange={e => setForm(p => ({...p, date_of_joining: e.target.value}))} className={inp} /></div>
      </div>
      <div><label className="block text-xs font-semibold text-gray-600 mb-1">Subjects Taught</label>
        <input name="subjects" value={form.subjects} onChange={e => setForm(p => ({...p, subjects: e.target.value}))} placeholder="e.g. Physics, Chemistry" className={inp} /></div>
      <div className="flex justify-end gap-3 pt-2 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
        <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {teacher ? 'Save Changes' : 'Add Teacher'}
        </button>
      </div>
    </form>
  );
}

export default function TeachersPage() {
  const { teachers, loading, error, filters, setFilters, fetchTeachers, addTeacher, editTeacher, removeTeacher } = useTeacherStore();
  const [showForm,     setShowForm]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading,  setFormLoading]  = useState(false);
  const [formError,    setFormError]    = useState(null);

  useEffect(() => { fetchTeachers(); }, [filters]);

  async function handleSubmit(fd) {
    setFormLoading(true); setFormError(null);
    try {
      editTarget ? await editTeacher(editTarget.id, fd) : await addTeacher(fd);
      setShowForm(false); setEditTarget(null);
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  }

  async function handleDelete(t) {
    try { await removeTeacher(t.id); setDeleteTarget(null); } catch (err) { alert(err.message); }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teachers / Staff</h1>
          <p className="text-sm text-gray-500 mt-0.5">{teachers.length} staff member{teachers.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => printTeachers(teachers)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition">
            🖨️ Print List
          </button>
          <button onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm">
            + Add Teacher
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input value={filters.search} onChange={e => setFilters({ search: e.target.value })} placeholder="Search by name or employee ID"
              className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={filters.department} onChange={e => setFilters({ department: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">⚠️ {error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm"><span className="animate-spin mr-2">⏳</span> Loading…</div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-2">👩‍🏫</p><p className="text-sm">No staff found. Add your first teacher.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name','Employee ID','Department','Designation','Subjects','Phone','Joined','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teachers.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-400">
                          {t.photo ? <img src={t.photo} alt="" className="w-full h-full object-cover" /> : t.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.employee_id || '—'}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{t.department || '—'}</span></td>
                    <td className="px-4 py-3 text-gray-600">{t.designation || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{t.subjects || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{t.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{t.date_of_joining ? new Date(t.date_of_joining).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditTarget(t); setShowForm(true); }} className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition">✏️</button>
                        <button onClick={() => setDeleteTarget(t)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title={editTarget ? 'Edit Teacher' : 'Add New Teacher'} onClose={() => { setShowForm(false); setEditTarget(null); setFormError(null); }} size="lg">
          {formError && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">⚠️ {formError}</div>}
          <TeacherForm teacher={editTarget} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditTarget(null); }} loading={formLoading} />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)} size="sm">
          <p className="text-sm text-gray-600 mb-5">Delete <strong>{deleteTarget.name}</strong>? This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition">Cancel</button>
            <button onClick={() => handleDelete(deleteTarget)} className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition">Yes, Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
