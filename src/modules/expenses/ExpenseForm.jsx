import { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore.js';

const CATEGORIES = ['Salary', 'Maintenance', 'Utilities', 'Events', 'Supplies', 'Other'];

// FIX: Extracted FormField to fix typing focus bug
const FormField = ({ label, k, type = 'text', required, opts, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {opts ? (
      <select value={value} onChange={e => onChange(k, e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-400 bg-white">
        <option value="">Select</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={e => onChange(k, e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-400" />
    )}
  </div>
);

export default function ExpenseForm({ initial, onClose }) {
  const { add, update } = useExpenseStore();
  const [form, setForm] = useState(initial || {
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    year: new Date().getFullYear(),
    category: '', 
    description: '', 
    amount: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.month || !form.category || !form.amount) {
      setError('Please fill required fields (Month, Category, Amount).'); 
      return;
    }
    setSaving(true); setError('');
    try {
      // Assuming store accepts plain object
      initial ? await update(initial.id, form) : await add(form);
      onClose();
    } catch (e) { setError(e.message || 'Something went wrong'); } 
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Month" k="month" type="month" value={form.month} onChange={handleUpdate} required />
        <FormField label="Amount (₹)" k="amount" type="number" value={form.amount} onChange={handleUpdate} required />
        <div className="col-span-2">
          <FormField label="Category" k="category" value={form.category} onChange={handleUpdate} required opts={CATEGORIES} />
        </div>
        <div className="col-span-2">
          <FormField label="Description" k="description" value={form.description} onChange={handleUpdate} />
        </div>
      </div>
      {error && <div className="p-2 bg-red-50 text-[11px] text-red-600">{error}</div>}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        <button onClick={submit} disabled={saving} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Expense'}
        </button>
      </div>
    </div>
  );
}