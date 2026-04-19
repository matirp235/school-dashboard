// ─── StudentForm.jsx ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { useStudentStore } from '../../store/studentStore';

const CLASSES = ['Nursery','LKG','UKG','1','2','3','4','5','6','7','8','9','10','11','12'];

export default function StudentForm({ initial, onClose }) {
  const { add, update } = useStudentStore();
  const [form, setForm] = useState(initial || {
    full_name:'', dob:'', gender:'', class:'', section:'', roll_no:'',
    address:'', guardian_name:'', guardian_rel:'', contact_primary:'', contact_secondary:''
  });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.full_name || !form.dob || !form.gender || !form.class || !form.guardian_name || !form.contact_primary) {
      setError('Please fill all required fields.'); return;
    }
    setSaving(true); setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v || ''));
    if (photo) fd.append('photo', photo);
    try {
      initial ? await update(initial.id, fd) : await add(fd);
      onClose();
    } catch (e) { setError(e.response?.data?.error || 'Something went wrong'); }
    finally { setSaving(false); }
  };

  const F = ({ label, k, type='text', required, opts }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {opts ? (
        <select value={form[k]} onChange={e => set(k, e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">Select</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[k]} onChange={e => set(k, e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"/>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 mb-2">Data collected as per DPDP Act 2023 — minimal personal information only.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><F label="Full Name" k="full_name" required /></div>
        <F label="Date of Birth" k="dob" type="date" required />
        <F label="Gender" k="gender" required opts={['Male','Female','Other','Prefer not to say']} />
        <F label="Class" k="class" required opts={CLASSES} />
        <F label="Section" k="section" />
        <F label="Roll Number" k="roll_no" />
        <div className="col-span-2"><F label="Address" k="address" /></div>
        <F label="Guardian Name" k="guardian_name" required />
        <F label="Relation" k="guardian_rel" required opts={['Father','Mother','Grandfather','Grandmother','Uncle','Aunt','Guardian']} />
        <F label="Primary Contact" k="contact_primary" type="tel" required />
        <F label="Secondary Contact" k="contact_secondary" type="tel" />
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Student Photo <span className="text-gray-400">(max 2MB)</span></label>
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])}
            className="text-sm text-gray-600"/>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : (initial ? 'Update' : 'Add Student')}
        </button>
      </div>
    </div>
  );
}


