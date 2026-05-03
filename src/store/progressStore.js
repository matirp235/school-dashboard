import { create } from 'zustand';
import {
  getProgressByStudent,
  getProgressSummary,
  addMark,
  addMarksBatch,
  updateMark,
  deleteMark,
  deleteExam,
} from '../services/progressService';

const useProgressStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
  marks:    [],        // flat list of all mark rows for the current student
  summary:  [],        // per-exam summary (totals + percentage)
  loading:  false,
  saving:   false,
  error:    null,

  // Track which student we have loaded (to avoid stale data)
  loadedStudentId: null,

  // ─── Derived ─────────────────────────────────────────────────────────────────
  /**
   * Returns marks grouped by exam_name.
   * { [exam_name]: { exam_name, exam_date, rows: [...] } }
   */
  get groupedByExam() {
    const groups = {};
    for (const row of get().marks) {
      if (!groups[row.exam_name]) {
        groups[row.exam_name] = { exam_name: row.exam_name, exam_date: row.exam_date, rows: [] };
      }
      groups[row.exam_name].rows.push(row);
    }
    return groups;
  },

  /** Unique exam names present in current marks */
  get examNames() {
    return [...new Set(get().marks.map(m => m.exam_name))];
  },

  // ─── Actions ─────────────────────────────────────────────────────────────────
  async fetchMarks(studentId) {
    set({ loading: true, error: null });
    try {
      const [marks, summary] = await Promise.all([
        getProgressByStudent(studentId),
        getProgressSummary(studentId),
      ]);
      set({ marks, summary, loading: false, loadedStudentId: studentId });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  async addMarkEntry(entry) {
    set({ saving: true, error: null });
    try {
      const mark = await addMark(entry);
      set(state => ({ marks: [...state.marks, mark], saving: false }));
      // Refresh summary
      await get().refreshSummary(entry.student_id);
      return mark;
    } catch (err) {
      set({ error: err.message, saving: false });
      throw err;
    }
  },

  async addBatchEntries(entries) {
    set({ saving: true, error: null });
    try {
      const added = await addMarksBatch(entries);
      const addedArr = Array.isArray(added) ? added : [added];
      set(state => ({ marks: [...state.marks, ...addedArr], saving: false }));
      if (entries.length > 0) await get().refreshSummary(entries[0].student_id);
      return addedArr;
    } catch (err) {
      set({ error: err.message, saving: false });
      throw err;
    }
  },

  async editMark(id, data) {
    set({ saving: true, error: null });
    try {
      const updated = await updateMark(id, data);
      set(state => ({
        marks: state.marks.map(m => m.id === updated.id ? updated : m),
        saving: false,
      }));
      await get().refreshSummary(updated.student_id);
      return updated;
    } catch (err) {
      set({ error: err.message, saving: false });
      throw err;
    }
  },

  async removeMark(id) {
    try {
      const mark = get().marks.find(m => m.id === id);
      await deleteMark(id);
      set(state => ({ marks: state.marks.filter(m => m.id !== id) }));
      if (mark) await get().refreshSummary(mark.student_id);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  async removeExam(studentId, examName) {
    try {
      await deleteExam(studentId, examName);
      set(state => ({ marks: state.marks.filter(m => !(m.student_id === studentId && m.exam_name === examName)) }));
      await get().refreshSummary(studentId);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  async refreshSummary(studentId) {
    try {
      const summary = await getProgressSummary(studentId);
      set({ summary });
    } catch (_) {}
  },

  clearProgress() {
    set({ marks: [], summary: [], loadedStudentId: null, error: null });
  },

  clearError() { set({ error: null }); },
}));

export default useProgressStore;

export { useProgressStore };
