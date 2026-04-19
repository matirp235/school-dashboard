import { create } from 'zustand';

export const useStudentStore = create((set) => ({
  students: [],

  // 1. Fetch all students from the database
  fetchAll: async () => {
    try {
      const res = await fetch('/api/students');
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      set({ students: data });
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  },

  // 2. Add a new student (Uses FormData for the photo upload)
  add: async (formData) => {
    const res = await fetch('/api/students', {
      method: 'POST',
      body: formData, // Do NOT set Content-Type header here; browser does it for FormData
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to add student');
    }
    
    // Auto-refresh the table by adding the new student to the state
    const newStudent = await res.json();
    set((state) => ({ students: [...state.students, newStudent] }));
  },

  // 3. Update an existing student
  update: async (id, formData) => {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      body: formData,
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update student');
    }
    
    // Auto-refresh the table by replacing the old record
    const updatedStudent = await res.json();
    set((state) => ({
      students: state.students.map((s) => (s.id === id ? updatedStudent : s)),
    }));
  },
}));