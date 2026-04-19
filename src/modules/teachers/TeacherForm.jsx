import { useState } from 'react';
import { useTeacherStore } from '../../store/teacherStore.js';

const DEPARTMENTS = ['Mathematics', 'Science', 'Languages', 'Humanities', 'Commerce', 'Arts', 'Physical Education', 'Administration'];

const FormField = ({ label, k, type = 'text', required, opts, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {opts ? (
      <select value={value} onChange={e => onChange(k, e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
        <option value="">Select</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={e => onChange(k, e.target.value)} onClick={type === 'date' ? (e) => e.target.showPicker() : undefined} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
    )}
  </div>
);

export default function TeacherForm({ initial, onClose }) {
  const { add, update } = useTeacherStore();
  const [form, setForm] = useState(initial || {
    full_name: '', dob: '', gender: '', employee_id: '', department: '', designation: '',
    subjects: '', qualification: '', contact_primary: '', contact_secondary: '', address: '', joining_date: ''
  });
  const [photo, setPhoto] = useState(null); // Added photo state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.full_name || !form.employee_id || !form.department || !form.contact_primary) {
      setError('Please fill all required fields.'); return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.contact_primary)) {
      setError('Primary Contact must be exactly 10 digits.'); return;
    }

    setSaving(true); setError('');

    // Use FormData for file upload
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v || ''));
    if (photo) fd.append('photo', photo);

    try {
      initial ? await update(initial.id, fd) : await add(fd);
      onClose();
    } catch (e) { 
      setError(e.message || 'Something went wrong. Check if Employee ID is unique.'); 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormField label="Full Name" k="full_name" value={form.full_name} onChange={handleUpdate} required />
        </div>
        
        <FormField label="Employee ID" k="employee_id" value={form.employee_id} onChange={handleUpdate} required />
        <FormField label="Gender" k="gender" value={form.gender} onChange={handleUpdate} required opts={['Male','Female','Other']} />
        <FormField label="Department" k="department" value={form.department} onChange={handleUpdate} required opts={DEPARTMENTS} />
        <FormField label="Designation" k="designation" value={form.designation} onChange={handleUpdate} required />
        <FormField label="Date of Birth" k="dob" type="date" value={form.dob} onChange={handleUpdate} />
        <FormField label="Joining Date" k="joining_date" type="date" value={form.joining_date} onChange={handleUpdate} />
        
        <div className="col-span-2">
          <FormField label="Qualifications" k="qualification" value={form.qualification} onChange={handleUpdate} />
        </div>
        <div className="col-span-2">
          <FormField label="Subjects Taught (Comma separated)" k="subjects" value={form.subjects} onChange={handleUpdate} />
        </div>

        <FormField label="Primary Contact" k="contact_primary" type="tel" value={form.contact_primary} onChange={handleUpdate} required />
        <FormField label="Secondary Contact" k="contact_secondary" type="tel" value={form.contact_secondary} onChange={handleUpdate} />
        <div className="col-span-2">
          <FormField label="Address" k="address" value={form.address} onChange={handleUpdate} />
        </div>

        {/* Added Photo Input */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Teacher Photo <span className="text-gray-400">(max 2MB)</span>
          </label>
          <input 
            type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
          />
        </div>
      </div>

      {error && <div className="p-2 bg-red-50 border border-red-100 rounded text-[11px] text-red-600">{error}</div>}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button onClick={submit} disabled={saving} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all">
          {saving ? 'Saving...' : (initial ? 'Update Record' : 'Save Teacher')}
        </button>
      </div>
    </div>
  );
}