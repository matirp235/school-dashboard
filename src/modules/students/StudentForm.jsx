import { useState } from 'react';
import { useStudentStore } from '../../store/studentStore.js';

const CLASSES = ['Nursery','LKG','UKG','1','2','3','4','5','6','7','8','9','10','11','12'];

// Extracted outside to prevent focus loss on typing
const FormField = ({ label, k, type = 'text', required, opts, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {opts ? (
      <select 
        value={value} 
        onChange={e => onChange(k, e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
      >
        <option value="">Select</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(k, e.target.value)}
        onClick={type === 'date' ? (e) => e.target.showPicker() : undefined}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    )}
  </div>
);

export default function StudentForm({ initial, onClose }) {
  const { add, update } = useStudentStore();
  const [form, setForm] = useState(initial || {
    full_name:'', dob:'', gender:'', class:'', section:'', roll_no:'',
    address:'', guardian_name:'', guardian_rel:'', contact_primary:'', 
    contact_secondary:'', security_deposit: ''
  });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    // 1. Basic Required Fields Check
    if (!form.full_name || !form.dob || !form.gender || !form.class || !form.guardian_name || !form.contact_primary) {
      setError('Please fill all required fields.'); 
      return;
    }

    // 2. Contact Number Validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.contact_primary)) {
      setError('Primary Contact must be exactly 10 digits.');
      return;
    }
    if (form.contact_secondary && !phoneRegex.test(form.contact_secondary)) {
      setError('Secondary Contact must be exactly 10 digits if provided.');
      return;
    }

    setSaving(true); 
    setError('');

    // 3. Prepare Multipart Form Data
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v || ''));
    if (photo) fd.append('photo', photo);

    try {
      initial ? await update(initial.id, fd) : await add(fd);
      onClose();
    } catch (e) { 
      setError(e.response?.data?.error || 'Something went wrong'); 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
        <p className="text-[10px] text-blue-700 leading-tight">
          <strong>Privacy Note:</strong> Data collected as per DPDP Act 2023 — minimal personal information only.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormField label="Full Name" k="full_name" value={form.full_name} onChange={handleUpdate} required />
        </div>
        
        <FormField label="Date of Birth" k="dob" type="date" value={form.dob} onChange={handleUpdate} required />
        <FormField label="Gender" k="gender" value={form.gender} onChange={handleUpdate} required opts={['Male','Female','Other','Prefer not to say']} />
        
        <FormField label="Class" k="class" value={form.class} onChange={handleUpdate} required opts={CLASSES} />
        <FormField label="Security Deposit (₹)" k="security_deposit" type="number" value={form.security_deposit} onChange={handleUpdate} />
        
        <FormField label="Section" k="section" value={form.section} onChange={handleUpdate} />
        <FormField label="Roll Number" k="roll_no" value={form.roll_no} onChange={handleUpdate} />
        
        <div className="col-span-2">
          <FormField label="Address" k="address" value={form.address} onChange={handleUpdate} />
        </div>

        <FormField label="Guardian Name" k="guardian_name" value={form.guardian_name} onChange={handleUpdate} required />
        <FormField label="Relation" k="guardian_rel" value={form.guardian_rel} onChange={handleUpdate} required opts={['Father','Mother','Grandfather','Grandmother','Uncle','Aunt','Guardian']} />
        
        <FormField label="Primary Contact" k="contact_primary" type="tel" value={form.contact_primary} onChange={handleUpdate} required />
        <FormField label="Secondary Contact" k="contact_secondary" type="tel" value={form.contact_secondary} onChange={handleUpdate} />
        
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Student Photo <span className="text-gray-400">(max 2MB)</span>
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={e => setPhoto(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>
      </div>

      {error && <div className="p-2 bg-red-50 border border-red-100 rounded text-[11px] text-red-600">{error}</div>}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          onClick={onClose} 
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={submit} 
          disabled={saving}
          className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-200 transition-all active:scale-95"
        >
          {saving ? 'Saving...' : (initial ? 'Update Record' : 'Save Student')}
        </button>
      </div>
    </div>
  );
}