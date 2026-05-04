import { useEffect, useState, useMemo } from 'react';
import useExpenseStore from '../../store/expenseStore.js';
import { getCategories, createCategory, deleteCategory } from '../../services/categoryService.js';
import Modal from '../../components/Modal.jsx';
import { printExpenses } from '../../utils/printUtils.js';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS  = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

const PRESET_COLORS = [
  '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#f97316','#84cc16','#ec4899','#6b7280',
];

function CategoryManager({ categories, onRefresh }) {
  const [newName,  setNewName]  = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [adding,   setAdding]   = useState(false);
  const [error,    setError]    = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true); setError(null);
    try {
      await createCategory({ name: newName.trim(), color: newColor });
      setNewName(''); onRefresh();
    } catch (err) { setError(err.message); }
    finally { setAdding(false); }
  }

  async function handleDelete(cat) {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try { await deleteCategory(cat.id); onRefresh(); }
    catch (err) { alert(err.message); }
  }

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">⚠️ {error}</div>}

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Category Name</label>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Transport"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Color</label>
          <div className="flex gap-1 flex-wrap w-32">
            {PRESET_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setNewColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition ${newColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
        <button type="submit" disabled={adding || !newName.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap">
          {adding ? 'Adding…' : '+ Add'}
        </button>
      </form>

      {/* Category list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              {cat.is_default === 1 && (
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">default</span>
              )}
            </div>
            {cat.is_default === 0 && (
              <button onClick={() => handleDelete(cat)}
                className="text-gray-300 hover:text-red-500 transition text-sm p-1 rounded hover:bg-red-50">
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">Default categories cannot be deleted. Custom categories can only be deleted if no expenses use them.</p>
    </div>
  );
}

function ExpenseForm({ onSubmit, onCancel, loading, categories }) {
  const [form, setForm] = useState({
    title: '', amount: '', category: categories[0]?.name || 'Supplies',
    description: '', expense_date: new Date().toISOString().slice(0, 10),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    onSubmit({ ...form, amount: parseFloat(form.amount) });
  }

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
          <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. March Salaries" className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (₹) *</label>
          <input required type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} placeholder="0" className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
          <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className={`${inp} bg-white`}>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
          <input type="date" value={form.expense_date} onChange={e => setForm(p => ({...p, expense_date: e.target.value}))} className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
          <input value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Optional" className={inp} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
        <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          Record Expense
        </button>
      </div>
    </form>
  );
}

export default function ExpensesPage() {
  const { expenses, loading, error, filters, setFilters, fetchExpenses, addExpense, removeExpense } = useExpenseStore();

  const [categories,    setCategories]    = useState([]);
  const [showForm,      setShowForm]      = useState(false);
  const [showCatMgr,    setShowCatMgr]    = useState(false);
  const [formLoading,   setFormLoading]   = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null);

  async function loadCategories() {
    try { setCategories(await getCategories()); } catch (_) {}
  }

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { fetchExpenses(); }, [filters]);

  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    for (const e of expenses) map[e.category] = (map[e.category] || 0) + e.amount;
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  function getCatColor(name) {
    return categories.find(c => c.name === name)?.color || '#6b7280';
  }

  async function handleAddExpense(data) {
    setFormLoading(true);
    try { await addExpense(data); setShowForm(false); }
    catch (err) { alert(err.message); }
    finally { setFormLoading(false); }
  }

  async function handleDelete(exp) {
    try { await removeExpense(exp.id); setDeleteTarget(null); }
    catch (err) { alert(err.message); }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{expenses.length} record{expenses.length !== 1 ? 's' : ''} · Grand total: ₹{grandTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowCatMgr(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition">
            🏷️ Manage Categories
          </button>
          <button onClick={() => printExpenses(expenses, filters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition">
            🖨️ Print Report
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm">
            + Record Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={filters.month} onChange={e => setFilters({ month: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Months</option>
            {MONTHS.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
          </select>
          <select value={filters.year} onChange={e => setFilters({ year: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={filters.category} onChange={e => setFilters({ category: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          {categoryBreakdown.map(([cat, amt]) => (
            <div key={cat} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: getCatColor(cat) }} />
                <p className="text-xs font-semibold text-gray-500 truncate">{cat}</p>
              </div>
              <p className="text-base font-bold text-gray-800">₹{amt.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400">{grandTotal > 0 ? ((amt / grandTotal) * 100).toFixed(1) : 0}%</p>
            </div>
          ))}
        </div>
      )}

      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">⚠️ {error}</div>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            <span className="animate-spin mr-2">⏳</span> Loading…
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">💸</p>
            <p className="text-sm">No expenses found. Record your first expense.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Title','Category','Amount','Date','Description',''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{exp.title}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                          style={{ background: getCatColor(exp.category) }}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">₹{Number(exp.amount).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {exp.expense_date ? new Date(exp.expense_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{exp.description || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDeleteTarget(exp)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td className="px-4 py-3 font-bold text-gray-700">Grand Total</td>
                    <td />
                    <td className="px-4 py-3 font-bold text-blue-700 text-base">₹{grandTotal.toLocaleString('en-IN')}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add Expense Modal */}
      {showForm && (
        <Modal title="Record Expense" onClose={() => setShowForm(false)} size="md">
          <ExpenseForm onSubmit={handleAddExpense} onCancel={() => setShowForm(false)} loading={formLoading} categories={categories} />
        </Modal>
      )}

      {/* Category Manager Modal */}
      {showCatMgr && (
        <Modal title="🏷️ Manage Expense Categories" onClose={() => setShowCatMgr(false)} size="md">
          <CategoryManager categories={categories} onRefresh={loadCategories} />
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)} size="sm">
          <p className="text-sm text-gray-600 mb-5">
            Delete expense <strong>{deleteTarget.title}</strong> (₹{Number(deleteTarget.amount).toLocaleString('en-IN')})?
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition">Cancel</button>
            <button onClick={() => handleDelete(deleteTarget)} className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition">Yes, Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
