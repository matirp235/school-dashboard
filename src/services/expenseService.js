export const expenseService = {
  getAll: (params = {}) => axios.get('/api/expenses', { params }).then(r => r.data),
  getSummary: (month, year) => axios.get('/api/expenses/summary', { params: { month, year } }).then(r => r.data),
  getMonths: () => axios.get('/api/expenses/months').then(r => r.data),
  create: (data) => axios.post('/api/expenses', data).then(r => r.data),
  update: (id, data) => axios.put(`/api/expenses/${id}`, data).then(r => r.data),
  delete: (id) => axios.delete(`/api/expenses/${id}`).then(r => r.data),
};
