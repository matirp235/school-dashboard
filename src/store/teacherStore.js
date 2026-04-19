import { create } from 'zustand';

export const useTeacherStore = create((set) => ({
  teachers: [],

  fetchAll: async (q = '', department = '') => {
    try {
      const query = new URLSearchParams();
      if (q) query.append('q', q);
      if (department) query.append('department', department);

      const res = await fetch(`/api/teachers?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch teachers');
      const data = await res.json();
      set({ teachers: data });
    } catch (error) { console.error('Error fetching teachers:', error); }
  },

  add: async (formData) => {
    // Note: Do not set Content-Type header when sending FormData
    const res = await fetch('/api/teachers', { method: 'POST', body: formData });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to add teacher');
    }
    const newTeacher = await res.json();
    set((state) => ({ teachers: [...state.teachers, newTeacher] }));
  },

  update: async (id, formData) => {
    const res = await fetch(`/api/teachers/${id}`, { method: 'PUT', body: formData });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update teacher');
    }
    const updatedTeacher = await res.json();
    set((state) => ({
      teachers: state.teachers.map((t) => (t.id === id ? updatedTeacher : t)),
    }));
  },

  deleteTeacher: async (id) => {
    const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete teacher');
    set((state) => ({ teachers: state.teachers.filter((t) => t.id !== id) }));
  }
}));