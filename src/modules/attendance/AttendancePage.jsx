import { useEffect, useMemo } from 'react';
import useAttendanceStore from '../../store/attendanceStore.js';
import useStudentStore from '../../store/studentStore.js';

const BOARDS  = ['CBSE', 'ICSE', 'State Board'];
const STATUS_CONFIG = {
  present: { label: 'P',       bg: 'bg-green-100 text-green-700 border-green-300',  ring: 'ring-green-400', pill: 'bg-green-500' },
  absent:  { label: 'A',       bg: 'bg-red-100 text-red-700 border-red-300',        ring: 'ring-red-400',   pill: 'bg-red-500'   },
  late:    { label: 'L',       bg: 'bg-yellow-100 text-yellow-700 border-yellow-300', ring: 'ring-yellow-400', pill: 'bg-yellow-500' },
};

export default function AttendancePage() {
  const {
    date, records, draft, loading, saving, error,
    filters, setDate, setFilters,
    fetchForDate, setStudentStatus, markAll, saveAll, clearError,
  } = useAttendanceStore();

  const { students, fetchStudents } = useStudentStore();

  useEffect(() => { fetchForDate(); }, [date, filters.board, filters.class]);
  useEffect(() => { fetchStudents(); }, []);

  const classOptions = useMemo(() => {
    const filtered = students.filter(s => !filters.board || s.board === filters.board);
    return [...new Set(filtered.map(s => s.class).filter(Boolean))].sort((a, b) => {
      const na = parseInt(a), nb = parseInt(b);
      return (!isNaN(na) && !isNaN(nb)) ? na - nb : a.localeCompare(b);
    });
  }, [students, filters.board]);

  const counts = useMemo(() => {
    let present = 0, absent = 0, late = 0;
    for (const r of records) {
      const s = draft[r.id] || 'present';
      if (s === 'present') present++;
      else if (s === 'absent') absent++;
      else late++;
    }
    return { present, absent, late, total: records.length };
  }, [records, draft]);

  const isDirty = records.some(r => (draft[r.id] || 'present') !== (r.status || 'present'));

  function handleBoardChange(e) {
    setFilters({ board: e.target.value, class: '' });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving || !isDirty}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
          {saving
            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
            : '💾 Save Attendance'}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex justify-between">
          <span>⚠️ {error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {/* ── Controls bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">

          {/* Date picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Board filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Board</label>
            <select value={filters.board} onChange={handleBoardChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">All Boards</option>
              {BOARDS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>

          {/* Class filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Class</label>
            <select value={filters.class} onChange={e => setFilters({ class: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">All Classes</option>
              {classOptions.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>

          {/* Bulk mark */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Mark All</label>
            <div className="flex gap-2">
              <button onClick={() => markAll('present')}
                className="flex-1 py-2 text-xs font-semibold bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 transition">
                ✓ All Present
              </button>
              <button onClick={() => markAll('absent')}
                className="flex-1 py-2 text-xs font-semibold bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition">
                ✗ All Absent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary pills ── */}
      {records.length > 0 && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {[
            { key: 'total',   label: 'Total',   val: counts.total,   cls: 'bg-gray-100 text-gray-700' },
            { key: 'present', label: 'Present', val: counts.present, cls: 'bg-green-100 text-green-700' },
            { key: 'absent',  label: 'Absent',  val: counts.absent,  cls: 'bg-red-100 text-red-700' },
            { key: 'late',    label: 'Late',    val: counts.late,    cls: 'bg-yellow-100 text-yellow-700' },
          ].map(({ key, label, val, cls }) => (
            <div key={key} className={`px-4 py-2 rounded-xl text-sm font-semibold ${cls}`}>
              {label}: {val}
              {key === 'present' && counts.total > 0 && (
                <span className="ml-1 font-normal opacity-70">({((val / counts.total) * 100).toFixed(0)}%)</span>
              )}
            </div>
          ))}
          {isDirty && (
            <div className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-100 text-amber-700">
              ⚠ Unsaved changes
            </div>
          )}
        </div>
      )}

      {/* ── Student list ── */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          <span className="animate-spin mr-2">⏳</span> Loading…
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-sm text-gray-400">No students match the current filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Board / Class</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((student, idx) => {
                const status = draft[student.id] || 'present';
                const cfg    = STATUS_CONFIG[status];
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>

                    {/* Student info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-400">
                          {student.photo
                            ? <img src={student.photo} alt="" className="w-full h-full object-cover" />
                            : student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{student.name}</p>
                          {student.roll_number && <p className="text-xs text-gray-400">#{student.roll_number}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <span className="font-medium">{student.board}</span>
                      {student.class && <span className="ml-1">· Class {student.class}</span>}
                    </td>

                    {/* Current status badge */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.pill}`} />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>

                    {/* Toggle buttons */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        {['present', 'absent', 'late'].map(s => (
                          <button
                            key={s}
                            onClick={() => setStudentStatus(student.id, s)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold border transition ${
                              status === s
                                ? STATUS_CONFIG[s].bg + ' ring-2 ' + STATUS_CONFIG[s].ring
                                : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer save bar */}
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {counts.present} present · {counts.absent} absent · {counts.late} late of {counts.total} students
            </p>
            <button
              onClick={saveAll}
              disabled={saving || !isDirty}
              className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-40">
              {saving ? 'Saving…' : '💾 Save All'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
