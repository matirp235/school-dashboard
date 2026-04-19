// ─── TeacherForm.jsx ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { useTeacherStore } from '../../store/teacherStore';

const DEPARTMENTS = ['Primary','Secondary','Senior Secondary','Science','Commerce','Arts','Physical Education','Administration'];
const DESIGNATIONS = ['Principal','Vice Principal','PGT','TGT','PRT','Lab Assistant','Librarian','Counsellor','Admin Staff'];

export default function TeacherForm({ initial, onClose }) {
  const { add, update } = useTeacherStore();
  const [form, setForm] = useState(initial || {
    full_name:'', dob:'', gender:'', employee_id:'', department:'',
    designation:'', subjects:'', qualification:'',
    contact_primary:'', contact_secondary:'', address:'', joining_date:''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.full_name || !form.dob || !form.gender || !form.employee_id || !form.department || !form.designation || !form.contact_primary) {
      setError('Please fill all required fields.'); return;
    }
    setSaving(true); setError('');
    try {
      initial ? await update(initial.id, form) : await add(form);
      onClose();
    } catch (e) { setError(e.response?.data?.error || 'Something went wrong'); }
    finally { setSaving(false); }
  };

  const F = ({ label, k, type='text', required, opts }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {opts ? (
        <select value={form[k]} onChange={e => set(k, e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-400">
          <option value="">Select</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[k]} onChange={e => set(k, e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-400"/>
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
        <F label="Employee ID" k="employee_id" required />
        <F label="Joining Date" k="joining_date" type="date" />
        <F label="Department" k="department" required opts={DEPARTMENTS} />
        <F label="Designation" k="designation" required opts={DESIGNATIONS} />
        <div className="col-span-2"><F label="Subjects Taught" k="subjects" /></div>
        <div className="col-span-2"><F label="Highest Qualification" k="qualification" /></div>
        <F label="Primary Contact" k="contact_primary" type="tel" required />
        <F label="Secondary Contact" k="contact_secondary" type="tel" />
        <div className="col-span-2"><F label="Address" k="address" /></div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
          {saving ? 'Saving...' : (initial ? 'Update' : 'Add Teacher')}
        </button>
      </div>
    </div>
  );
}