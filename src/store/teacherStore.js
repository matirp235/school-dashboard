import { create } from 'zustand';
import { teacherService } from '../services/teacherService';

export const useTeacherStore = create((set) => ({
  teachers: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await teacherService.getAll(params);
      set({ teachers: data, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
  add: async (data) => {
    const t = await teacherService.create(data);
    set(st => ({ teachers: [t, ...st.teachers] }));
  },
  update: async (id, data) => {
    const t = await teacherService.update(id, data);
    set(st => ({ teachers: st.teachers.map(x => x.id === id ? t : x) }));
  },
  remove: async (id) => {
    await teacherService.delete(id);
    set(st => ({ teachers: st.teachers.filter(x => x.id !== id) }));
  },
}));
