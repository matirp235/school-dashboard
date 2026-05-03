import { useEffect, useState, useMemo } from 'react';
import useStudentStore from '../../store/studentStore';
import StudentForm from './StudentForm';
import StudentPrintView from './StudentPrintView';
import Modal from '../../components/Modal';

const BOARDS = ['CBSE', 'ICSE', 'State Board'];

const BOARD_COLORS = {
  'CBSE':        'bg-blue-100 text-blue-700',
  'ICSE':        'bg-purple-100 text-purple-700',
  'State Board': 'bg-green-100 text-green-700',
};

export default function StudentsPage() {
  const {
    students, loading, error,
    filters, setFilters, clearFilters,
    fetchStudents, addStudent, editStudent, removeStudent,
    getClasses,
  } = useStudentStore();

  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [viewTarget,  setViewTarget]  = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError,   setFormError]   = useState(null);

  // Fetch on mount and whenever filters change
  useEffect(() => { fetchStudents(); }, [filters]);

  // Cascading class options — only show classes that exist under selected board
  const classOptions = useMemo(() => getClasses(filters.board), [students, filters.board]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  function handleBoardChange(e) {
    // Reset class when board changes so stale class isn't silently applied
    setFilters({ board: e.target.value, class: '' });
  }

  function handleClassChange(e) {
    setFilters({ class: e.target.value });
  }

  function handleSearch(e) {
    setFilters({ search: e.target.value });
  }

  async function handleFormSubmit(fd) {
    setFormLoading(true);
    setFormError(null);
    try {
      if (editTarget) {
        await editStudent(editTarget.id, fd);
      } else {
        await addStudent(fd);
      }
      setShowForm(false);
      setEditTarget(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(student) {
    try {
      await removeStudent(student.id);
      setDeleteTarget(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  function openEdit(student) {
    setEditTarget(student);
    setShowForm(true);
  }

  function openAdd() {
    setEditTarget(null);
    setShowForm(true);
  }

  // ─── Active filter pills ──────────────────────────────────────────────────────
  const activeFilters = [
    filters.search && { label: `"${filters.search}"`, key: 'search' },
    filters.board  && { label: filters.board, key: 'board' },
    filters.class  && { label: `Class ${filters.class}`, key: 'class' },
  ].filter(Boolean);

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Students Directory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {students.length} student{students.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm">
          + Add Student
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              value={filters.search}
              onChange={handleSearch}
              placeholder="Search by name or roll no."
              className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Board filter */}
          <select
            value={filters.board}
            onChange={handleBoardChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Boards</option>
            {BOARDS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Class filter — cascades from board */}
          <select
            value={filters.class}
            onChange={handleClassChange}
            disabled={classOptions.length === 0}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {filters.board
                ? classOptions.length === 0
                  ? 'No classes in this board'
                  : 'All Classes'
                : 'All Classes'}
            </option>
            {classOptions.map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        {/* Active filter pills + clear */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-gray-500">Filters:</span>
            {activeFilters.map(f => (
              <span key={f.key}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                {f.label}
                <button onClick={() => setFilters({ [f.key]: '' })} className="hover:text-red-500">×</button>
              </span>
            ))}
            <button onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-red-500 underline ml-1">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">
            <span className="animate-spin mr-2">⏳</span> Loading students…
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🎓</p>
            <p className="text-sm">No students found. {activeFilters.length > 0 ? 'Try clearing filters.' : 'Add your first student.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Roll No.</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Board</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Class</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Guardian</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Deposit</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    {/* Student name + photo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {student.photo
                            ? <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                                {student.name.charAt(0).toUpperCase()}
                              </div>}
                        </div>
                        <span className="font-medium text-gray-800">{student.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">{student.roll_number || '—'}</td>

                    {/* Board badge */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${BOARD_COLORS[student.board] || 'bg-gray-100 text-gray-600'}`}>
                        {student.board || '—'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">{student.class ? `Class ${student.class}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{student.guardian_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{student.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.security_deposit > 0 ? `₹${Number(student.security_deposit).toLocaleString('en-IN')}` : '—'}
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewTarget(student)}
                          title="View Profile"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                          👁️
                        </button>
                        <button onClick={() => openEdit(student)}
                          title="Edit"
                          className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition">
                          ✏️
                        </button>
                        <button onClick={() => setDeleteTarget(student)}
                          title="Delete"
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <Modal
          title={editTarget ? 'Edit Student' : 'Add New Student'}
          onClose={() => { setShowForm(false); setEditTarget(null); setFormError(null); }}
          size="lg"
        >
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              ⚠️ {formError}
            </div>
          )}
          <StudentForm
            student={editTarget}
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditTarget(null); setFormError(null); }}
            loading={formLoading}
          />
        </Modal>
      )}

      {/* ── Student Detail / Profile Modal ── */}
      {viewTarget && (
        <Modal
          title="Student Profile"
          onClose={() => setViewTarget(null)}
          size="xl"
        >
          <StudentPrintView
            student={viewTarget}
            onEdit={() => { setViewTarget(null); openEdit(viewTarget); }}
            onClose={() => setViewTarget(null)}
          />
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)} size="sm">
          <p className="text-sm text-gray-600 mb-5">
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            This will remove the student and all associated fee records permanently.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition">
              Cancel
            </button>
            <button onClick={() => handleDelete(deleteTarget)}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition">
              Yes, Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
