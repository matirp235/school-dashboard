import { useEffect, useState } from 'react';
import useStudentStore from '../../store/studentStore.js';
import useProgressStore from '../../store/progressStore.js';
import useAttendanceStore from '../../store/attendanceStore.js';
import ProgressReport from './ProgressReport.jsx';
import { printStudent } from '../../utils/printUtils.js';

const BOARD_COLORS = {
  'CBSE':        'bg-blue-100 text-blue-700',
  'ICSE':        'bg-purple-100 text-purple-700',
  'State Board': 'bg-green-100 text-green-700',
};

const TABS = [
  { id: 'overview',    label: '👤 Overview' },
  { id: 'fees',        label: '💰 Fee Ledger' },
  { id: 'progress',   label: '📋 Progress Report' },
  { id: 'attendance', label: '📅 Attendance' },
];

export default function StudentPrintView({ student, onEdit, onClose }) {
  const { fees, feeLoading, fetchFees, addFeeEntry, removeFee } = useStudentStore();
  const { marks, fetchMarks, clearProgress }                    = useProgressStore();
  const { summary: attSummary, fetchSummaryForStudent }         = useAttendanceStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [feeForm, setFeeForm]     = useState({ month: '', amount: '', payment_mode: 'Cash', note: '' });
  const [addingFee, setAddingFee] = useState(false);
  const [feeError,  setFeeError]  = useState(null);
  const [printing,  setPrinting]  = useState(false);

  useEffect(() => {
    fetchFees(student.id);
    fetchMarks(student.id);
    fetchSummaryForStudent(student.id);
    return () => clearProgress();
  }, [student.id]);

  const totalFees = fees.reduce((s, f) => s + f.amount, 0);

  async function handleAddFee(e) {
    e.preventDefault();
    setFeeError(null);
    if (!feeForm.month || !feeForm.amount) { setFeeError('Month and amount are required'); return; }
    try {
      setAddingFee(true);
      await addFeeEntry(student.id, feeForm);
      setFeeForm({ month: '', amount: '', payment_mode: 'Cash', note: '' });
    } catch (err) { setFeeError(err.message); }
    finally { setAddingFee(false); }
  }

  async function handleRemoveFee(feeId) {
    if (!window.confirm('Delete this fee record?')) return;
    try { await removeFee(feeId); } catch (err) { alert(err.message); }
  }

  async function handlePrint() {
    setPrinting(true);
    try {
      printStudent({ student, fees, marks, attendanceSummary: attSummary });
    } finally {
      setTimeout(() => setPrinting(false), 1000);
    }
  }

  return (
    <div className="flex flex-col min-h-0">

      {/* ── Student hero ── */}
      <div className="flex items-start gap-4 pb-4 border-b border-gray-100 mb-0">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
          {student.photo
            ? <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-300">
                {student.name?.charAt(0).toUpperCase()}
              </div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">{student.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {student.board && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${BOARD_COLORS[student.board] || 'bg-gray-100 text-gray-600'}`}>
                    {student.board}
                  </span>
                )}
                {student.class && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">Class {student.class}</span>}
                {student.roll_number && <span className="text-xs text-gray-400">#{student.roll_number}</span>}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={handlePrint} disabled={printing}
                className="text-xs font-medium text-green-700 hover:text-green-900 border border-green-200 hover:border-green-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                {printing ? '⏳ Preparing…' : '🖨️ Print Report'}
              </button>
              <button onClick={onEdit}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition">
                ✏️ Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex border-b border-gray-200 mt-0 mb-4 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoRow label="Full Name"       value={student.name} />
            <InfoRow label="Roll Number"     value={student.roll_number} />
            <InfoRow label="Board"           value={student.board} />
            <InfoRow label="Class"           value={student.class ? `Class ${student.class}` : null} />
            <InfoRow label="Date of Birth"   value={fmtDate(student.date_of_birth)} />
            <InfoRow label="Date of Joining" value={fmtDate(student.date_of_joining)} />
            <InfoRow label="Guardian"        value={student.guardian_name} />
            <InfoRow label="Phone"           value={student.phone} />
          </div>
          {student.address && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">Address</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{student.address}</p>
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">Security Deposit</p>
            <p className="text-xl font-bold text-amber-800">₹{Number(student.security_deposit || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-amber-600 mt-0.5">Refundable on leaving</p>
          </div>
        </div>
      )}

      {/* ── Fee Ledger ── */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-xs text-green-700 font-semibold">Total Collected</p>
              <p className="text-xl font-bold text-green-800 mt-0.5">₹{totalFees.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-700 font-semibold">Transactions</p>
              <p className="text-xl font-bold text-blue-800 mt-0.5">{fees.length}</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-gray-600 mb-3">+ Add Fee Payment</h4>
            {feeError && <p className="text-xs text-red-600 mb-2">⚠️ {feeError}</p>}
            <form onSubmit={handleAddFee}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Month *</label>
                  <input value={feeForm.month} onChange={e => setFeeForm(p => ({ ...p, month: e.target.value }))}
                    placeholder="e.g. April 2025"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Amount (₹) *</label>
                  <input type="number" min="0" value={feeForm.amount} onChange={e => setFeeForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Payment Mode</label>
                  <select value={feeForm.payment_mode} onChange={e => setFeeForm(p => ({ ...p, payment_mode: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>Cash</option><option>UPI / Online</option><option>Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Note</label>
                  <input value={feeForm.note} onChange={e => setFeeForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="Optional"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button type="submit" disabled={addingFee}
                className="w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                {addingFee ? 'Adding…' : '+ Add Payment'}
              </button>
            </form>
          </div>

          {feeLoading ? (
            <p className="text-center text-sm text-gray-400 py-4">Loading…</p>
          ) : fees.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">No fee records yet.</p>
          ) : (
            <div className="overflow-hidden border border-gray-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Month</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Amount</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Mode</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Note</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Date</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fees.map(fee => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-700">{fee.month}</td>
                      <td className="px-4 py-2 text-green-700 font-semibold">₹{Number(fee.amount).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{fee.payment_mode}</span></td>
                      <td className="px-4 py-2 text-gray-500 text-xs">{fee.note || '—'}</td>
                      <td className="px-4 py-2 text-gray-400 text-xs">{fmtDate(fee.paid_on)}</td>
                      <td className="px-4 py-2">
                        <button onClick={() => handleRemoveFee(fee.id)} className="text-gray-300 hover:text-red-500 transition">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Progress Report ── */}
      {activeTab === 'progress' && <ProgressReport studentId={student.id} />}

      {/* ── Attendance ── */}
      {activeTab === 'attendance' && <AttendanceSummaryTab summary={attSummary} />}
    </div>
  );
}

// ── Attendance summary inside student profile ─────────────────────────────────
function AttendanceSummaryTab({ summary }) {
  if (summary.length === 0) return (
    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
      <p className="text-3xl mb-2">📅</p>
      <p className="text-sm text-gray-400">No attendance records yet.</p>
      <p className="text-xs text-gray-300 mt-1">Mark attendance from the Attendance page.</p>
    </div>
  );

  const overallPresent = summary.reduce((s, r) => s + r.present, 0);
  const overallTotal   = summary.reduce((s, r) => s + r.total_days, 0);
  const overallPct     = overallTotal > 0 ? ((overallPresent / overallTotal) * 100).toFixed(1) : '—';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Days',    val: overallTotal,   cls: 'text-gray-800' },
          { label: 'Days Present',  val: overallPresent, cls: 'text-green-700' },
          { label: 'Attendance %',  val: `${overallPct}%`, cls: overallPct >= 75 ? 'text-green-700' : overallPct >= 50 ? 'text-yellow-700' : 'text-red-700' },
        ].map(({ label, val, cls }) => (
          <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${cls}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Month</th>
              <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500">Working Days</th>
              <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500">Present</th>
              <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500">Absent</th>
              <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500">Late</th>
              <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500">Attendance %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {summary.map(row => {
              const pct = parseFloat(row.attendance_pct);
              const pctCls = pct >= 75 ? 'text-green-700' : pct >= 50 ? 'text-yellow-700' : 'text-red-700';
              return (
                <tr key={row.month} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-700">{row.month}</td>
                  <td className="px-4 py-2 text-center text-gray-600">{row.total_days}</td>
                  <td className="px-4 py-2 text-center font-semibold text-green-700">{row.present}</td>
                  <td className="px-4 py-2 text-center font-semibold text-red-600">{row.absent}</td>
                  <td className="px-4 py-2 text-center font-semibold text-yellow-700">{row.late}</td>
                  <td className={`px-4 py-2 text-center font-bold ${pctCls}`}>{row.attendance_pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-700 mt-0.5">{value || <span className="text-gray-300">—</span>}</p>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }); }
  catch { return d; }
}
