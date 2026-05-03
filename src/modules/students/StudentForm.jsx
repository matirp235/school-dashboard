import { useState, useEffect } from 'react';

const BOARDS  = ['CBSE', 'ICSE', 'State Board'];
const CLASSES = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const PAYMENT_MODES = ['Cash', 'UPI / Online', 'Cheque'];

const defaultForm = {
  name:             '',
  roll_number:      '',
  class:            '',
  board:            'CBSE',
  guardian_name:    '',
  phone:            '',
  address:          '',
  date_of_birth:    '',
  date_of_joining:  '',
  security_deposit: '',
};

export default function StudentForm({ student = null, onSubmit, onCancel, loading = false }) {
  const [form,   setForm]   = useState(defaultForm);
  const [photo,  setPhoto]  = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Populate form when editing an existing student
  useEffect(() => {
    if (student) {
      setForm({
        name:             student.name             || '',
        roll_number:      student.roll_number      || '',
        class:            student.class            || '',
        board:            student.board            || 'CBSE',
        guardian_name:    student.guardian_name    || '',
        phone:            student.phone            || '',
        address:          student.address          || '',
        date_of_birth:    student.date_of_birth    || '',
        date_of_joining:  student.date_of_joining  || '',
        security_deposit: student.security_deposit != null ? String(student.security_deposit) : '',
      });
      if (student.photo) setPreview(student.photo);
    }
  }, [student]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    // When board changes, clear class selection so user re-picks
    if (name === 'board') setForm(prev => ({ ...prev, board: value, class: '' }));
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim())  errs.name  = 'Name is required';
    if (!form.class)        errs.class = 'Class is required';
    if (!form.board)        errs.board = 'Board is required';
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid 10-digit phone number';
    if (form.security_deposit && isNaN(parseFloat(form.security_deposit)))
      errs.security_deposit = 'Must be a number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '') fd.append(k, v);
    });
    if (photo) fd.append('photo', photo);
    onSubmit(fd);
  }

  const inputCls = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Profile Photo ── */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
          {preview
            ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            : <span className="text-3xl text-gray-300">👤</span>}
        </div>
        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            📷 {preview ? 'Change Photo' : 'Upload Photo'}
          </label>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · max 5 MB</p>
        </div>
      </div>

      {/* ── Name + Roll ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange}
            placeholder="e.g. Riya Sharma" className={inputCls('name')} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Roll Number</label>
          <input name="roll_number" value={form.roll_number} onChange={handleChange}
            placeholder="e.g. 2024-101" className={inputCls('roll_number')} />
        </div>
      </div>

      {/* ── Board + Class ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Board *</label>
          <select name="board" value={form.board} onChange={handleChange} className={inputCls('board')}>
            {BOARDS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          {errors.board && <p className="text-xs text-red-500 mt-1">{errors.board}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Class *</label>
          <select name="class" value={form.class} onChange={handleChange} className={inputCls('class')}>
            <option value="">Select Class</option>
            {CLASSES.map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
          {errors.class && <p className="text-xs text-red-500 mt-1">{errors.class}</p>}
        </div>
      </div>

      {/* ── Board badge hint ── */}
      {form.board && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${
            form.board === 'CBSE'        ? 'bg-blue-100 text-blue-700' :
            form.board === 'ICSE'        ? 'bg-purple-100 text-purple-700' :
                                           'bg-green-100 text-green-700'
          }`}>{form.board}</span>
          <span>{form.board === 'CBSE' ? 'Central Board of Secondary Education' :
                 form.board === 'ICSE' ? 'Indian Certificate of Secondary Education' :
                 'State Board Curriculum'}</span>
        </div>
      )}

      {/* ── Guardian + Phone ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Guardian Name</label>
          <input name="guardian_name" value={form.guardian_name} onChange={handleChange}
            placeholder="Parent / Guardian" className={inputCls('guardian_name')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange}
            placeholder="10-digit number" className={inputCls('phone')} />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* ── Address ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
        <textarea name="address" value={form.address} onChange={handleChange} rows={2}
          placeholder="Home address" className={`${inputCls('address')} resize-none`} />
      </div>

      {/* ── Dates ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
          <input type="date" name="date_of_birth" value={form.date_of_birth}
            onChange={handleChange} className={inputCls('date_of_birth')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Joining</label>
          <input type="date" name="date_of_joining" value={form.date_of_joining}
            onChange={handleChange} className={inputCls('date_of_joining')} />
        </div>
      </div>

      {/* ── Security Deposit ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Security Deposit (₹)</label>
        <input name="security_deposit" value={form.security_deposit} onChange={handleChange}
          placeholder="0" type="number" min="0" className={inputCls('security_deposit')} />
        {errors.security_deposit && <p className="text-xs text-red-500 mt-1">{errors.security_deposit}</p>}
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3 pt-2 border-t">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {student ? 'Save Changes' : 'Add Student'}
        </button>
      </div>
    </form>
  );
}
