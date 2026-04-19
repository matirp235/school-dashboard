import { create } from 'zustand';

export const useExpenseStore = create((set) => ({
  expenses: [],
  summary: { rows: [], grand_total: 0 },

  // 1. Fetch filtered expenses
  fetchAll: async (month, year) => {
    try {
      const query = new URLSearchParams();
      if (month) query.append('month', month);
      if (year) query.append('year', year);
      
      const res = await fetch(`/api/expenses?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch expenses');
      
      const data = await res.json();
      set({ expenses: data });
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  },

  // 2. Fetch summary data (for charts/totals)
  fetchSummary: async (month, year) => {
    try {
      const query = new URLSearchParams();
      // We removed the strict 'return' block so "All Months" works perfectly
      if (month) query.append('month', month);
      if (year) query.append('year', year);
      
      const res = await fetch(`/api/expenses/summary?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch summary');
      
      const data = await res.json();
      set({ summary: data });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  },

  // 3. Add a new expense
  add: async (expenseData) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });
    
    if (!res.ok) throw new Error('Failed to add expense');
    
    const newExpense = await res.json();
    set((state) => ({ expenses: [newExpense, ...state.expenses] }));
  },

  // 4. Update an existing expense
  update: async (id, expenseData) => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });
    
    if (!res.ok) throw new Error('Failed to update expense');
    
    const updatedExpense = await res.json();
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? updatedExpense : e)),
    }));
  },

  // 5. Delete an expense
  deleteExpense: async (id) => {
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete expense');
    
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
  }
}));