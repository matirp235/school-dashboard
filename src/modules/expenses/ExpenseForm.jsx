// ─── ExpenseForm.jsx ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CATEGORIES = ['Salaries','Utilities','Maintenance','Stationery','Events','Transport','Miscellaneous'];

export default function ExpenseForm({ initial, defaultMonth, defaultYear, onClose }) {
  const { add, update } = useExpenseStore();
  const [form, setForm] = useState(initial || {
    month: defaultMonth, year: defaultYear,
    category: '', description: '', amount: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.category || !form.amount || !form.month) {
      setError('Category and amount are required.'); return;
    }
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('Enter a valid amount.'); return;
    }
    setSaving(true); setError('');
    try {
      initial ? await update(initial.id, form) : await add(form);
      onClose();
    } catch (e) { setError('Something went wrong'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Month <span className="text-red-400">*</span></label>
          <select value={form.month} onChange={e => set('month', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-400">
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
          <input type="number" value={form.year} onChange={e => set('year', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-400"/>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category <span className="text-red-400">*</span></label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹) <span className="text-red-400">*</span></label>
          <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="0"/>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <input type="text" value={form.description} onChange={e => set('description', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Optional details..."/>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">
          {saving ? 'Saving...' : (initial ? 'Update' : 'Add Expense')}
        </button>
      </div>
    </div>
  );
}