import { useState } from 'react';
import { useStudentStore } from '../../store/studentStore';

const CLASSES = ['Nursery','LKG','UKG','1','2','3','4','5','6','7','8','9','10','11','12'];

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
    contact_secondary:'', monthly_fees: '' // Added monthly_fees
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

    // 2. Contact Number Validation (10 digits, no characters)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.contact_primary)) {
      setError('Primary Contact must be exactly 10 digits and contain only numbers.');
      return;
    }
    if (form.contact_secondary && !phoneRegex.test(form.contact_secondary)) {
      setError('Secondary Contact must be exactly 10 digits if provided.');
      return;
    }

    setSaving(true); 
    setError('');

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
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormField label="Full Name" k="full_name" value={form.full_name} onChange={handleUpdate} required />
        </div>
        
        <FormField label="Date of Birth" k="dob" type="date" value={form.dob} onChange={handleUpdate} required />
        <FormField label="Gender" k="gender" value={form.gender} onChange={handleUpdate} required opts={['Male','Female','Other']} />
        <FormField label="Class" k="class" value={form.class} onChange={handleUpdate} required opts={CLASSES} />
        
        {/* New Monthly Fees Field */}
        <FormField label="Monthly Fees (₹)" k="monthly_fees" type="number" value={form.monthly_fees} onChange={handleUpdate} required />
        
        <FormField label="Section" k="section" value={form.section} onChange={handleUpdate} />
        <FormField label="Roll Number" k="roll_no" value={form.roll_no} onChange={handleUpdate} />
        
        <div className="col-span-2">
          <FormField label="Address" k="address" value={form.address} onChange={handleUpdate} />
        </div>

        <FormField label="Guardian Name" k="guardian_name" value={form.guardian_name} onChange={handleUpdate} required />
        <FormField label="Relation" k="guardian_rel" value={form.guardian_rel} onChange={handleUpdate} required opts={['Father','Mother','Guardian']} />
        
        <FormField label="Primary Contact" k="contact_primary" type="tel" value={form.contact_primary} onChange={handleUpdate} required />
        <FormField label="Secondary Contact" k="contact_secondary" type="tel" value={form.contact_secondary} onChange={handleUpdate} />
        
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Student Photo</label>
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} className="text-sm" />
        </div>
      </div>

      {error && <div className="p-2 bg-red-50 border border-red-100 rounded text-[11px] text-red-600">{error}</div>}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button onClick={submit} disabled={saving} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Student'}
        </button>
      </div>
    </div>
  );
}