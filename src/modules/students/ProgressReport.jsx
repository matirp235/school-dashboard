import { useEffect, useState } from 'react';
import useProgressStore from '../../store/progressStore';

const EXAM_NAMES = [
  'Unit Test 1', 'Unit Test 2', 'Unit Test 3',
  'Half Yearly', 'Pre-Board', 'Annual Exam', 'Other',
];

const SUBJECTS = [
  'Mathematics', 'Science', 'English', 'Hindi', 'Social Studies',
  'Computer Science', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Economics', 'Accountancy',
  'Business Studies', 'Physical Education', 'Other',
];

const emptyRow = { subject: '', marks: '', max_marks: '100', remarks: '' };

function grade(marks, maxMarks) {
  const pct = (marks / maxMarks) * 100;
  if (pct >= 91) return { label: 'A1', color: 'text-green-700 bg-green-100' };
  if (pct >= 81) return { label: 'A2', color: 'text-green-600 bg-green-50' };
  if (pct >= 71) return { label: 'B1', color: 'text-blue-700 bg-blue-100' };
  if (pct >= 61) return { label: 'B2', color: 'text-blue-600 bg-blue-50' };
  if (pct >= 51) return { label: 'C1', color: 'text-yellow-700 bg-yellow-100' };
  if (pct >= 41) return { label: 'C2', color: 'text-yellow-600 bg-yellow-50' };
  if (pct >= 33) return { label: 'D',  color: 'text-orange-700 bg-orange-100' };
  return { label: 'E (Fail)', color: 'text-red-700 bg-red-100' };
}

function pctColor(pct) {
  if (pct >= 75) return 'text-green-700';
  if (pct >= 50) return 'text-yellow-700';
  return 'text-red-700';
}

export default function ProgressReport({ studentId }) {
  const {
    marks, summary, loading, saving, error,
    fetchMarks, addMarkEntry, addBatchEntries, editMark, removeMark, removeExam,
    clearError,
  } = useProgressStore();

  // ── Add-exam form state ────────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [examName,    setExamName]    = useState('');
  const [customExam,  setCustomExam]  = useState('');
  const [examDate,    setExamDate]    = useState('');
  const [rows,        setRows]        = useState([{ ...emptyRow }]);
  const [formError,   setFormError]   = useState(null);

  // ── Edit single mark state ─────────────────────────────────────────────────
  const [editingId,   setEditingId]   = useState(null);
  const [editData,    setEditData]    = useState({});

  // ── Expanded exam accordion ────────────────────────────────────────────────
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (studentId) fetchMarks(studentId);
  }, [studentId]);

  // Group marks by exam_name
  const grouped = {};
  for (const m of marks) {
    if (!grouped[m.exam_name]) grouped[m.exam_name] = { exam_name: m.exam_name, exam_date: m.exam_date, rows: [] };
    grouped[m.exam_name].rows.push(m);
  }
  const examGroups = Object.values(grouped).sort((a, b) => {
    if (a.exam_date && b.exam_date) return b.exam_date.localeCompare(a.exam_date);
    return a.exam_name.localeCompare(b.exam_name);
  });

  // ── Row helpers ────────────────────────────────────────────────────────────
  function updateRow(i, field, value) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  function addRow() { setRows(prev => [...prev, { ...emptyRow }]); }

  function removeRow(i) {
    if (rows.length === 1) return;
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  // ── Submit new exam ────────────────────────────────────────────────────────
  async function handleAddExam(e) {
    e.preventDefault();
    setFormError(null);
    const resolvedExam = examName === 'Other' ? customExam.trim() : examName;
    if (!resolvedExam) { setFormError('Please enter an exam name'); return; }

    const invalid = rows.filter(r => !r.subject || r.marks === '');
    if (invalid.length > 0) { setFormError('All subjects must have a subject name and marks'); return; }

    const entries = rows.map(r => ({
      student_id: studentId,
      exam_name:  resolvedExam,
      subject:    r.subject,
      marks:      parseFloat(r.marks),
      max_marks:  parseFloat(r.max_marks) || 100,
      exam_date:  examDate || null,
      remarks:    r.remarks || null,
    }));

    try {
      await addBatchEntries(entries);
      setShowAddForm(false);
      setExamName(''); setCustomExam(''); setExamDate('');
      setRows([{ ...emptyRow }]);
      // Auto-expand newly added exam
      setExpanded(prev => ({ ...prev, [resolvedExam]: true }));
    } catch (err) {
      setFormError(err.message);
    }
  }

  // ── Inline edit ────────────────────────────────────────────────────────────
  function startEdit(mark) {
    setEditingId(mark.id);
    setEditData({ marks: mark.marks, max_marks: mark.max_marks, remarks: mark.remarks || '' });
  }

  async function saveEdit(id) {
    try {
      await editMark(id, {
        marks:     parseFloat(editData.marks),
        max_marks: parseFloat(editData.max_marks),
        remarks:   editData.remarks,
      });
      setEditingId(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function handleDeleteExam(examName) {
    if (!window.confirm(`Delete all marks for "${examName}"?`)) return;
    try { await removeExam(studentId, examName); } catch (err) { alert(err.message); }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex justify-between">
          <span>⚠️ {error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* ── Summary Cards ── */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {summary.map(s => {
            const pct = parseFloat(s.percentage) || 0;
            return (
              <div key={s.exam_name} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">{s.exam_name}</p>
                {s.exam_date && <p className="text-xs text-gray-400 mb-1">{new Date(s.exam_date).toLocaleDateString('en-IN')}</p>}
                <p className={`text-2xl font-bold mt-1 ${pctColor(pct)}`}>{pct.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.total_marks}/{s.total_max_marks} marks</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Exam Button ── */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">
          {examGroups.length > 0 ? `${examGroups.length} Exam${examGroups.length > 1 ? 's' : ''} Recorded` : 'No exams recorded yet'}
        </h3>
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition">
          {showAddForm ? '✕ Cancel' : '+ Add Exam Marks'}
        </button>
      </div>

      {/* ── Add Exam Form ── */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h4 className="text-sm font-bold text-blue-800 mb-4">Record Exam Marks</h4>
          {formError && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
              ⚠️ {formError}
            </div>
          )}
          <form onSubmit={handleAddExam} className="space-y-4">

            {/* Exam Name + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Exam Name *</label>
                <select value={examName} onChange={e => setExamName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select exam</option>
                  {EXAM_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                {examName === 'Other' && (
                  <input value={customExam} onChange={e => setCustomExam(e.target.value)}
                    placeholder="Enter exam name"
                    className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Exam Date</label>
                <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
            </div>

            {/* Subject rows */}
            <div>
              <div className="grid grid-cols-12 gap-2 mb-1 text-xs font-semibold text-gray-500 px-1">
                <span className="col-span-4">Subject</span>
                <span className="col-span-2">Marks</span>
                <span className="col-span-2">Max</span>
                <span className="col-span-3">Remarks</span>
                <span className="col-span-1" />
              </div>
              <div className="space-y-2">
                {rows.map((row, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <select value={row.subject} onChange={e => updateRow(i, 'subject', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">Subject</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input type="number" min="0" value={row.marks}
                        onChange={e => updateRow(i, 'marks', e.target.value)}
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" min="1" value={row.max_marks}
                        onChange={e => updateRow(i, 'max_marks', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-3">
                      <input value={row.remarks} onChange={e => updateRow(i, 'remarks', e.target.value)}
                        placeholder="Optional"
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button type="button" onClick={() => removeRow(i)}
                        disabled={rows.length === 1}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-30 text-lg leading-none">
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addRow}
                className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1">
                + Add subject
              </button>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowAddForm(false); setFormError(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                Save Marks
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Exam Accordion ── */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading marks…</div>
      ) : examGroups.length === 0 && !showAddForm ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm text-gray-400">No exam marks recorded yet.</p>
          <p className="text-xs text-gray-300 mt-1">Click "Add Exam Marks" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {examGroups.map(group => {
            const totalMarks = group.rows.reduce((s, r) => s + r.marks, 0);
            const totalMax   = group.rows.reduce((s, r) => s + r.max_marks, 0);
            const pct        = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : '—';
            const isOpen     = expanded[group.exam_name] !== false; // default open

            return (
              <div key={group.exam_name} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                {/* Accordion header */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpanded(prev => ({ ...prev, [group.exam_name]: !isOpen }))}>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">{isOpen ? '▼' : '▶'}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{group.exam_name}</p>
                      {group.exam_date && (
                        <p className="text-xs text-gray-400">{new Date(group.exam_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-base font-bold ${pctColor(parseFloat(pct))}`}>{pct}%</p>
                      <p className="text-xs text-gray-400">{totalMarks}/{totalMax}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteExam(group.exam_name); }}
                      className="text-gray-300 hover:text-red-500 transition text-lg leading-none"
                      title="Delete entire exam">
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Accordion body */}
                {isOpen && (
                  <div className="border-t border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Subject</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Marks</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Max</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">%</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Grade</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Remarks</th>
                          <th className="px-4 py-2" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {group.rows.map(row => {
                          const pctRow = row.max_marks > 0 ? ((row.marks / row.max_marks) * 100).toFixed(1) : '—';
                          const g      = grade(row.marks, row.max_marks);
                          const isEditing = editingId === row.id;

                          return (
                            <tr key={row.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium text-gray-700">{row.subject}</td>

                              {isEditing ? (
                                <>
                                  <td className="px-4 py-2">
                                    <input type="number" value={editData.marks}
                                      onChange={e => setEditData(p => ({ ...p, marks: e.target.value }))}
                                      className="w-20 border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none" />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input type="number" value={editData.max_marks}
                                      onChange={e => setEditData(p => ({ ...p, max_marks: e.target.value }))}
                                      className="w-20 border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none" />
                                  </td>
                                  <td className="px-4 py-2 text-gray-500">—</td>
                                  <td className="px-4 py-2 text-gray-500">—</td>
                                  <td className="px-4 py-2">
                                    <input value={editData.remarks}
                                      onChange={e => setEditData(p => ({ ...p, remarks: e.target.value }))}
                                      placeholder="Remarks"
                                      className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none" />
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex gap-1">
                                      <button onClick={() => saveEdit(row.id)}
                                        className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition">
                                        ✓
                                      </button>
                                      <button onClick={() => setEditingId(null)}
                                        className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">
                                        ✕
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-2 text-gray-700 font-semibold">{row.marks}</td>
                                  <td className="px-4 py-2 text-gray-500">{row.max_marks}</td>
                                  <td className={`px-4 py-2 font-medium ${pctColor(parseFloat(pctRow))}`}>{pctRow}%</td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${g.color}`}>{g.label}</span>
                                  </td>
                                  <td className="px-4 py-2 text-gray-500 text-xs">{row.remarks || '—'}</td>
                                  <td className="px-4 py-2">
                                    <div className="flex gap-1">
                                      <button onClick={() => startEdit(row)}
                                        className="text-xs text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition">
                                        ✏️
                                      </button>
                                      <button onClick={() => removeMark(row.id)}
                                        className="text-xs text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition">
                                        🗑️
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>

                      {/* Totals row */}
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                          <td className="px-4 py-2 text-xs font-bold text-gray-600">Total</td>
                          <td className="px-4 py-2 text-xs font-bold text-gray-800">{totalMarks}</td>
                          <td className="px-4 py-2 text-xs font-bold text-gray-600">{totalMax}</td>
                          <td className={`px-4 py-2 text-xs font-bold ${pctColor(parseFloat(pct))}`}>{pct}%</td>
                          <td colSpan={3} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
