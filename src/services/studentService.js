import axios from 'axios';
const BASE = '/api/students';

export const studentService = {
  getAll: (params = {}) => axios.get(BASE, { params }).then(r => r.data),
  getById: (id) => axios.get(`${BASE}/${id}`).then(r => r.data),
  create: (formData) => axios.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data),
  update: (id, formData) => axios.put(`${BASE}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data),
  delete: (id) => axios.delete(`${BASE}/${id}`).then(r => r.data),
};
