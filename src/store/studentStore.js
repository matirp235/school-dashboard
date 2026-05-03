import { create } from 'zustand';
import {
  getStudents, getStudent,
  createStudent, updateStudent, deleteStudent,
  getFees, addFee, deleteFee,
} from '../services/studentService';

const useStudentStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
  students:       [],
  selectedStudent: null,
  fees:           [],

  loading:        false,
  feeLoading:     false,
  error:          null,

  // Active filters — board cascades into class options
  filters: {
    search: '',
    board:  '',       // 'CBSE' | 'ICSE' | 'State Board' | ''
    class:  '',
  },

  // ─── Derived helpers ─────────────────────────────────────────────────────────
  /** Returns unique boards present in the loaded list */
  get boards() {
    const all = get().students.map(s => s.board).filter(Boolean);
    return [...new Set(all)].sort();
  },

  /** Returns unique classes, optionally scoped to a board */
  getClasses(board) {
    const all = get().students
      .filter(s => !board || s.board === board)
      .map(s => s.class)
      .filter(Boolean);
    return [...new Set(all)].sort((a, b) => {
      // Natural sort: "1", "2", ... "10", "11" rather than lexicographic
      const na = parseInt(a, 10), nb = parseInt(b, 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  },

  // ─── Actions ─────────────────────────────────────────────────────────────────
  setFilters(partial) {
    set(state => ({
      filters: { ...state.filters, ...partial },
    }));
  },

  clearFilters() {
    set({ filters: { search: '', board: '', class: '' } });
  },

  async fetchStudents() {
    set({ loading: true, error: null });
    try {
      // Send all active filters to the server for efficient server-side filtering
      const { filters } = get();
      const students = await getStudents({
        search: filters.search,
        board:  filters.board,
        class:  filters.class,
      });
      set({ students, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  async fetchStudent(id) {
    set({ loading: true, error: null });
    try {
      const student = await getStudent(id);
      set({ selectedStudent: student, loading: false });
      return student;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  async addStudent(formData) {
    set({ loading: true, error: null });
    try {
      const student = await createStudent(formData);
      set(state => ({ students: [student, ...state.students], loading: false }));
      return student;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  async editStudent(id, formData) {
    set({ loading: true, error: null });
    try {
      const updated = await updateStudent(id, formData);
      set(state => ({
        students: state.students.map(s => s.id === updated.id ? updated : s),
        selectedStudent: state.selectedStudent?.id === updated.id ? updated : state.selectedStudent,
        loading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  async removeStudent(id) {
    try {
      await deleteStudent(id);
      set(state => ({
        students: state.students.filter(s => s.id !== id),
        selectedStudent: state.selectedStudent?.id === id ? null : state.selectedStudent,
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // ─── Fees ───────────────────────────────────────────────────────────────────
  async fetchFees(studentId) {
    set({ feeLoading: true });
    try {
      const fees = await getFees(studentId);
      set({ fees, feeLoading: false });
    } catch (err) {
      set({ error: err.message, feeLoading: false });
    }
  },

  async addFeeEntry(studentId, feeData) {
    try {
      const fee = await addFee(studentId, feeData);
      set(state => ({ fees: [fee, ...state.fees] }));
      return fee;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  async removeFee(feeId) {
    try {
      await deleteFee(feeId);
      set(state => ({ fees: state.fees.filter(f => f.id !== feeId) }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  clearError() { set({ error: null }); },
  clearSelected() { set({ selectedStudent: null, fees: [] }); },
}));

export default useStudentStore;

export { useStudentStore };
