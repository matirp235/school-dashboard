import { create } from 'zustand';
import {
  getAttendanceForDate,
  getStudentAttendanceSummary,
  saveBulkAttendance,
} from '../services/attendanceService.js';

const today = () => new Date().toISOString().slice(0, 10);

const useAttendanceStore = create((set, get) => ({
  date:     today(),
  records:  [],       // [{ id, name, roll_number, class, board, photo, status, note, attendance_id }]
  summary:  [],       // monthly summary for student view
  loading:  false,
  saving:   false,
  error:    null,
  filters:  { board: '', class: '' },

  // Local draft — tracks what the user has toggled before saving
  draft: {},          // { [student_id]: 'present' | 'absent' | 'late' }

  setDate(date) { set({ date }); },
  setFilters(partial) { set(s => ({ filters: { ...s.filters, ...partial } })); },

  async fetchForDate() {
    const { date, filters } = get();
    set({ loading: true, error: null });
    try {
      const records = await getAttendanceForDate(date, filters);
      // Build initial draft from what's already saved
      const draft = {};
      for (const r of records) draft[r.id] = r.status || 'present';
      set({ records, draft, loading: false });
    } catch (err) { set({ error: err.message, loading: false }); }
  },

  // Toggle one student in the draft (does NOT save yet)
  setStudentStatus(studentId, status) {
    set(s => ({ draft: { ...s.draft, [studentId]: status } }));
  },

  // Mark all students in draft with same status
  markAll(status) {
    const { records } = get();
    const draft = {};
    for (const r of records) draft[r.id] = status;
    set({ draft });
  },

  // Save the entire draft to the server
  async saveAll() {
    const { date, records, draft } = get();
    set({ saving: true, error: null });
    try {
      const payload = records.map(r => ({
        student_id: r.id,
        status:     draft[r.id] || 'present',
        note:       null,
      }));
      await saveBulkAttendance(date, payload);
      set({ saving: false });
      // Refresh to get DB ids
      await get().fetchForDate();
    } catch (err) { set({ error: err.message, saving: false }); }
  },

  async fetchSummaryForStudent(studentId) {
    try {
      const summary = await getStudentAttendanceSummary(studentId);
      set({ summary });
    } catch (err) { set({ error: err.message }); }
  },

  clearError() { set({ error: null }); },
}));

export default useAttendanceStore;
export { useAttendanceStore };
