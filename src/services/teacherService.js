export const teacherService = {
  getAll: (params = {}) => axios.get('/api/teachers', { params }).then(r => r.data),
  getById: (id) => axios.get(`/api/teachers/${id}`).then(r => r.data),
  create: (data) => axios.post('/api/teachers', data).then(r => r.data),
  update: (id, data) => axios.put(`/api/teachers/${id}`, data).then(r => r.data),
  delete: (id) => axios.delete(`/api/teachers/${id}`).then(r => r.data),
};
