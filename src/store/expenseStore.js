import { create } from 'zustand';
import { expenseService } from '../services/expenseService';

export const useExpenseStore = create((set) => ({
  expenses: [],
  summary: null,
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await expenseService.getAll(params);
      set({ expenses: data, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
  fetchSummary: async (month, year) => {
    const s = await expenseService.getSummary(month, year);
    set({ summary: s });
  },
  add: async (data) => {
    const e = await expenseService.create(data);
    set(st => ({ expenses: [e, ...st.expenses] }));
  },
  update: async (id, data) => {
    const e = await expenseService.update(id, data);
    set(st => ({ expenses: st.expenses.map(x => x.id === id ? e : x) }));
  },
  remove: async (id) => {
    await expenseService.delete(id);
    set(st => ({ expenses: st.expenses.filter(x => x.id !== id) }));
  },
}));
