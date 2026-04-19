import { create } from 'zustand';
import { studentService } from '../services/studentService';

export const useStudentStore = create((set) => ({
  students: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await studentService.getAll(params);
      set({ students: data, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
  add: async (formData) => {
    const s = await studentService.create(formData);
    set(st => ({ students: [s, ...st.students] }));
  },
  update: async (id, formData) => {
    const s = await studentService.update(id, formData);
    set(st => ({ students: st.students.map(x => x.id === id ? s : x) }));
  },
  remove: async (id) => {
    await studentService.delete(id);
    set(st => ({ students: st.students.filter(x => x.id !== id) }));
  },
}));
