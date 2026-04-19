// ─── ExpensesPage.jsx ─────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { Modal } from '../../components/Modal';
import { Table } from '../../components/Table';
import ExpenseForm from './ExpenseForm';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CATEGORIES = ['Salaries','Utilities','Maintenance','Stationery','Events','Transport','Miscellaneous'];

const CAT_COLORS = {
  Salaries: 'bg-blue-100 text-blue-700',
  Utilities: 'bg-green-100 text-green-700',
  Maintenance: 'bg-amber-100 text-amber-700',
  Stationery: 'bg-purple-100 text-purple-700',
  Events: 'bg-pink-100 text-pink-700',
  Transport: 'bg-teal-100 text-teal-700',
  Miscellaneous: 'bg-gray-100 text-gray-600',
};

export default function ExpensesPage() {
  const { expenses, summary, loading, fetch, fetchSummary, remove } = useExpenseStore();
  const now = new Date();
  const [month, setMonth] = useState(MONTHS[now.getMonth()]);
  const [year, setYear] = useState(now.getFullYear());
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch({ month, year });
    fetchSummary(month, year);
  }, [month, year]);

  const openEdit = (e) => { setSelected(e); setModal('edit'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const cols = [
    { key: 'category', label: 'Category', render: r => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_COLORS[r.category] || 'bg-gray-100 text-gray-600'}`}>
        {r.category}
      </span>
    )},
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount', render: r => `₹${Number(r.amount).toLocaleString('en-IN')}` },
    { key: 'created_at', label: 'Added', render: r => new Date(r.created_at).toLocaleDateString('en-IN') },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Expenses</h1>
          <p className="text-sm text-gray-500">{month} {year}</p>
        </div>
        <button onClick={() => setModal('add')}
          className="bg-amber-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors">
          + Add Expense
        </button>
      </div>

      {/* Month/Year filter */}
      <div className="flex gap-3 mb-5">
        <select value={month} onChange={e => setMonth(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="col-span-1 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs text-amber-600 font-medium">Total This Month</p>
            <p className="text-2xl font-semibold text-amber-700 mt-1">
              ₹{Number(summary.grand_total || 0).toLocaleString('en-IN')}
            </p>
          </div>
          {summary.rows?.slice(0, 3).map(r => (
            <div key={r.category} className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-medium">{r.category}</p>
              <p className="text-lg font-semibold text-gray-800 mt-1">₹{Number(r.total).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100">
        {loading ? <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
          : <Table cols={cols} rows={expenses} onEdit={openEdit} onDelete={remove} emptyMsg="No expenses for this month" />}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Expense' : 'Edit Expense'} onClose={closeModal}>
          <ExpenseForm initial={selected} defaultMonth={month} defaultYear={year} onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}