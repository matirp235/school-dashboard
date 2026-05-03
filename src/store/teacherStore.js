import { create } from 'zustand';
import { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } from '../services/teacherService';

const useTeacherStore = create((set, get) => ({
  teachers: [],
  selectedTeacher: null,
  loading: false,
  error: null,
  filters: { search: '', department: '' },

  setFilters(partial) { set(s => ({ filters: { ...s.filters, ...partial } })); },

  async fetchTeachers() {
    set({ loading: true, error: null });
    try {
      const teachers = await getTeachers(get().filters);
      set({ teachers, loading: false });
    } catch (err) { set({ error: err.message, loading: false }); }
  },

  async fetchTeacher(id) {
    set({ loading: true });
    try {
      const t = await getTeacher(id);
      set({ selectedTeacher: t, loading: false });
    } catch (err) { set({ error: err.message, loading: false }); }
  },

  async addTeacher(fd) {
    set({ loading: true });
    try {
      const t = await createTeacher(fd);
      set(s => ({ teachers: [t, ...s.teachers], loading: false }));
      return t;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  async editTeacher(id, fd) {
    set({ loading: true });
    try {
      const t = await updateTeacher(id, fd);
      set(s => ({ teachers: s.teachers.map(x => x.id === t.id ? t : x), loading: false }));
      return t;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  async removeTeacher(id) {
    try {
      await deleteTeacher(id);
      set(s => ({ teachers: s.teachers.filter(t => t.id !== id) }));
    } catch (err) { set({ error: err.message }); throw err; }
  },

  clearError() { set({ error: null }); },
}));

export default useTeacherStore;

export { useTeacherStore };
