import { create } from 'zustand';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/expenseService';

const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  error: null,
  filters: { month: '', year: new Date().getFullYear().toString(), category: '' },

  setFilters(partial) { set(s => ({ filters: { ...s.filters, ...partial } })); },

  async fetchExpenses() {
    set({ loading: true, error: null });
    try {
      const expenses = await getExpenses(get().filters);
      set({ expenses, loading: false });
    } catch (err) { set({ error: err.message, loading: false }); }
  },

  async addExpense(data) {
    set({ loading: true });
    try {
      const e = await createExpense(data);
      set(s => ({ expenses: [e, ...s.expenses], loading: false }));
      return e;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  async editExpense(id, data) {
    set({ loading: true });
    try {
      const e = await updateExpense(id, data);
      set(s => ({ expenses: s.expenses.map(x => x.id === e.id ? e : x), loading: false }));
      return e;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  async removeExpense(id) {
    try {
      await deleteExpense(id);
      set(s => ({ expenses: s.expenses.filter(e => e.id !== id) }));
    } catch (err) { set({ error: err.message }); throw err; }
  },

  get grandTotal() { return get().expenses.reduce((sum, e) => sum + e.amount, 0); },
  get categoryBreakdown() {
    const map = {};
    for (const e of get().expenses) map[e.category] = (map[e.category] || 0) + e.amount;
    return map;
  },

  clearError() { set({ error: null }); },
}));

export default useExpenseStore;

export { useExpenseStore };
