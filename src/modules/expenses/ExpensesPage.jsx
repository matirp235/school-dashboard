import { useState, useEffect } from 'react';
import { useExpenseStore } from '../../store/expenseStore.js';
import ExpenseForm from './ExpenseForm.jsx';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS = ['2024', '2025', '2026', '2027', '2028'];

export default function ExpensesPage() {
  const { expenses, summary, fetchAll, fetchSummary, deleteExpense } = useExpenseStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Set default filters to the current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear().toString();

  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);

  // Fetch expenses and summary whenever filters change
  useEffect(() => {
    if (fetchAll && fetchSummary) {
      fetchAll(filterMonth, filterYear);
      fetchSummary(filterMonth, filterYear);
    }
  }, [filterMonth, filterYear, fetchAll, fetchSummary]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        fetchSummary(filterMonth, filterYear);
      } catch (error) {
        console.error("Failed to delete expense");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">School Expenses</h1>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Record Expense
        </button>
      </div>

      {/* Filters & Grand Total Summary */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex gap-4">
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Months</option>
            {MONTHS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          
          {/* FIX: Simplified static year dropdown */}
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        
        <div className="bg-red-50 text-red-700 px-6 py-2 rounded-lg border border-red-100 flex items-center gap-3">
          <span className="text-sm font-semibold uppercase">Total for {filterMonth || 'All'} {filterYear}:</span>
          <span className="text-xl font-bold">₹{summary?.grand_total || 0}</span>
        </div>
      </div>

      {/* Layout Grid: Category Summary (Left) & Expense List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {summary?.rows && summary.rows.length > 0 ? (
              summary.rows.map((row, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-medium text-gray-700">{row.category}</span>
                  <span className="font-bold text-red-600">₹{row.total}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">No expenses recorded for this period.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-600">Date</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Category</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Description</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Amount</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses && expenses.length > 0 ? (
                expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{expense.month} {expense.year}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <span className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 italic">{expense.description || '-'}</td>
                    <td className="px-6 py-4 font-bold text-red-600">₹{expense.amount}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button onClick={() => setEditingExpense(expense)} className="text-amber-600 hover:text-amber-800 font-medium">✏️ Edit</button>
                      <button onClick={() => handleDelete(expense.id)} className="text-red-500 hover:text-red-700 font-medium">🗑️ Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No detailed expense records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(isFormOpen || editingExpense) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">
                {editingExpense ? 'Edit Expense' : 'Record New Expense'}
              </h2>
              <button onClick={() => { setIsFormOpen(false); setEditingExpense(null); }} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">&times;</button>
            </div>
            
            <ExpenseForm 
              initial={editingExpense} 
              onClose={() => { 
                setIsFormOpen(false); 
                setEditingExpense(null); 
                fetchSummary(filterMonth, filterYear);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}