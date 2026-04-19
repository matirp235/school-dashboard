import { create } from 'zustand';

export const useTeacherStore = create((set) => ({
  teachers: [],

  // 1. Fetch all teachers (with optional search and filter)
  fetchAll: async (q = '', department = '') => {
    try {
      const query = new URLSearchParams();
      if (q) query.append('q', q);
      if (department) query.append('department', department);

      const res = await fetch(`/api/teachers?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch teachers');
      
      const data = await res.json();
      set({ teachers: data });
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  },

  // 2. Add a new teacher
  add: async (teacherData) => {
    const res = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to add teacher');
    }
    
    // Auto-refresh the table by adding the new teacher to the state
    const newTeacher = await res.json();
    set((state) => ({ teachers: [...state.teachers, newTeacher] }));
  },

  // 3. Update an existing teacher
  update: async (id, teacherData) => {
    const res = await fetch(`/api/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update teacher');
    }
    
    // Auto-refresh the table by replacing the old record
    const updatedTeacher = await res.json();
    set((state) => ({
      teachers: state.teachers.map((t) => (t.id === id ? updatedTeacher : t)),
    }));
  },

  // 4. Delete a teacher
  deleteTeacher: async (id) => {
    const res = await fetch(`/api/teachers/${id}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) throw new Error('Failed to delete teacher');
    
    set((state) => ({
      teachers: state.teachers.filter((t) => t.id !== id),
    }));
  }
}));