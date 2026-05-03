// ─── Print utility — opens a styled print window ─────────────────────────────
// All print functions open a new browser window, write a self-contained HTML
// document, and call window.print(). No dependencies required.

const PRINT_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1a1a1a; background: #fff; }
  h1 { font-size: 20px; font-weight: 700; }
  h2 { font-size: 15px; font-weight: 700; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #e5e7eb; }
  h3 { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #f3f4f6; text-align: left; padding: 6px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border: 1px solid #e5e7eb; }
  td { padding: 6px 10px; border: 1px solid #e5e7eb; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .section { margin-bottom: 28px; }
  .header { display: flex; align-items: center; gap: 20px; padding-bottom: 16px; border-bottom: 3px solid #1d4ed8; margin-bottom: 24px; }
  .header img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; }
  .header-avatar { width: 72px; height: 72px; border-radius: 50%; background: #dbeafe; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: #1d4ed8; flex-shrink: 0; }
  .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
  .info-item label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
  .info-item span { font-weight: 600; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }
  .badge-blue   { background: #dbeafe; color: #1d4ed8; }
  .badge-purple { background: #ede9fe; color: #6d28d9; }
  .badge-green  { background: #dcfce7; color: #15803d; }
  .badge-gray   { background: #f3f4f6; color: #4b5563; }
  .grade-a1 { color: #15803d; font-weight: 700; }
  .grade-b  { color: #1d4ed8; font-weight: 700; }
  .grade-c  { color: #b45309; font-weight: 700; }
  .grade-d  { color: #c2410c; font-weight: 700; }
  .grade-e  { color: #dc2626; font-weight: 700; }
  .stat-row { display: flex; gap: 16px; margin-bottom: 12px; }
  .stat-box { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; text-align: center; }
  .stat-box .val { font-size: 22px; font-weight: 700; }
  .stat-box .lbl { font-size: 10px; color: #6b7280; text-transform: uppercase; }
  .pct-green { color: #15803d; } .pct-yellow { color: #b45309; } .pct-red { color: #dc2626; }
  .page-break { page-break-before: always; }
  .print-footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
  @media print {
    body { font-size: 11px; }
    .no-break { page-break-inside: avoid; }
  }
`;

function openPrintWindow(title, bodyHtml) {
  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(`<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>${PRINT_CSS}</style>
</head><body>
${bodyHtml}
<div class="print-footer">
  <span>Printed on ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</span>
  <span>${title}</span>
</div>
<script>window.onload = () => { window.print(); }<\/script>
</body></html>`);
  win.document.close();
}

// ─── Grade helper ──────────────────────────────────────────────────────────────
function getGrade(marks, maxMarks) {
  const p = (marks / maxMarks) * 100;
  if (p >= 91) return { label: 'A1', cls: 'grade-a1' };
  if (p >= 81) return { label: 'A2', cls: 'grade-a1' };
  if (p >= 71) return { label: 'B1', cls: 'grade-b' };
  if (p >= 61) return { label: 'B2', cls: 'grade-b' };
  if (p >= 51) return { label: 'C1', cls: 'grade-c' };
  if (p >= 41) return { label: 'C2', cls: 'grade-c' };
  if (p >= 33) return { label: 'D',  cls: 'grade-d' };
  return { label: 'E (Fail)', cls: 'grade-e' };
}

function pctCls(pct) {
  if (pct >= 75) return 'pct-green';
  if (pct >= 50) return 'pct-yellow';
  return 'pct-red';
}

function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }); }
  catch { return d; }
}

function boardBadge(board) {
  const cls = board === 'CBSE' ? 'badge-blue' : board === 'ICSE' ? 'badge-purple' : 'badge-green';
  return `<span class="badge ${cls}">${board || ''}</span>`;
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. PRINT STUDENT (info → progress → attendance → fees)
// ──────────────────────────────────────────────────────────────────────────────
export function printStudent({ student, fees = [], marks = [], attendanceSummary = [] }) {
  const avatarHtml = student.photo
    ? `<img src="${student.photo}" alt="${student.name}" />`
    : `<div class="header-avatar">${student.name.charAt(0).toUpperCase()}</div>`;

  // Group marks by exam
  const exams = {};
  for (const m of marks) {
    if (!exams[m.exam_name]) exams[m.exam_name] = { exam_name: m.exam_name, exam_date: m.exam_date, rows: [] };
    exams[m.exam_name].rows.push(m);
  }

  const examHtml = Object.values(exams).map(ex => {
    const total    = ex.rows.reduce((s, r) => s + r.marks, 0);
    const maxTotal = ex.rows.reduce((s, r) => s + r.max_marks, 0);
    const pct      = maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(1) : '—';
    const rows     = ex.rows.map(r => {
      const p = ((r.marks / r.max_marks) * 100).toFixed(1);
      const g = getGrade(r.marks, r.max_marks);
      return `<tr>
        <td>${r.subject}</td>
        <td style="text-align:center">${r.marks}</td>
        <td style="text-align:center">${r.max_marks}</td>
        <td style="text-align:center" class="${pctCls(parseFloat(p))}">${p}%</td>
        <td style="text-align:center" class="${g.cls}">${g.label}</td>
        <td>${r.remarks || '—'}</td>
      </tr>`;
    }).join('');
    return `
      <div class="no-break" style="margin-bottom:16px;">
        <h3>${ex.exam_name}${ex.exam_date ? ` &nbsp;<span style="font-weight:400;color:#6b7280;font-size:11px;">${fmtDate(ex.exam_date)}</span>` : ''}</h3>
        <table>
          <thead><tr><th>Subject</th><th>Marks</th><th>Max</th><th>%</th><th>Grade</th><th>Remarks</th></tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr style="background:#f3f4f6;font-weight:700;">
            <td>Total</td><td style="text-align:center">${total}</td>
            <td style="text-align:center">${maxTotal}</td>
            <td style="text-align:center" class="${pctCls(parseFloat(pct))}">${pct}%</td>
            <td colspan="2"></td>
          </tr></tfoot>
        </table>
      </div>`;
  }).join('') || '<p style="color:#9ca3af;font-size:11px;">No exam records found.</p>';

  const attHtml = attendanceSummary.length === 0
    ? '<p style="color:#9ca3af;font-size:11px;">No attendance records found.</p>'
    : `<table>
        <thead><tr><th>Month</th><th>Working Days</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance %</th></tr></thead>
        <tbody>${attendanceSummary.map(r => `<tr>
          <td>${r.month}</td>
          <td style="text-align:center">${r.total_days}</td>
          <td style="text-align:center;color:#15803d;font-weight:600;">${r.present}</td>
          <td style="text-align:center;color:#dc2626;font-weight:600;">${r.absent}</td>
          <td style="text-align:center;color:#b45309;font-weight:600;">${r.late}</td>
          <td style="text-align:center" class="${pctCls(r.attendance_pct)}">${r.attendance_pct}%</td>
        </tr>`).join('')}</tbody>
       </table>`;

  const totalFees = fees.reduce((s, f) => s + f.amount, 0);
  const feesHtml = fees.length === 0
    ? '<p style="color:#9ca3af;font-size:11px;">No fee records found.</p>'
    : `<table>
        <thead><tr><th>Month</th><th>Amount</th><th>Mode</th><th>Note</th><th>Date</th></tr></thead>
        <tbody>${fees.map(f => `<tr>
          <td>${f.month}</td>
          <td>₹${Number(f.amount).toLocaleString('en-IN')}</td>
          <td>${f.payment_mode}</td>
          <td>${f.note || '—'}</td>
          <td>${fmtDate(f.paid_on)}</td>
        </tr>`).join('')}</tbody>
        <tfoot><tr style="font-weight:700;background:#f3f4f6;">
          <td>Total</td><td>₹${totalFees.toLocaleString('en-IN')}</td><td colspan="3"></td>
        </tr></tfoot>
       </table>`;

  const body = `
    <!-- Header -->
    <div class="header">
      ${avatarHtml}
      <div>
        <h1>${student.name}</h1>
        <div style="margin-top:6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          ${boardBadge(student.board)}
          ${student.class ? `<span class="badge badge-gray">Class ${student.class}</span>` : ''}
          ${student.roll_number ? `<span style="color:#6b7280;font-size:11px;">Roll #${student.roll_number}</span>` : ''}
        </div>
      </div>
    </div>

    <!-- Section 1: Student Information -->
    <div class="section">
      <h2>1. Student Information</h2>
      <div class="info-grid">
        <div class="info-item"><label>Guardian</label><span>${student.guardian_name || '—'}</span></div>
        <div class="info-item"><label>Phone</label><span>${student.phone || '—'}</span></div>
        <div class="info-item"><label>Date of Birth</label><span>${fmtDate(student.date_of_birth)}</span></div>
        <div class="info-item"><label>Date of Joining</label><span>${fmtDate(student.date_of_joining)}</span></div>
        <div class="info-item"><label>Security Deposit</label><span>₹${Number(student.security_deposit || 0).toLocaleString('en-IN')}</span></div>
        <div class="info-item"><label>Address</label><span>${student.address || '—'}</span></div>
      </div>
    </div>

    <!-- Section 2: Progress Report -->
    <div class="section">
      <h2>2. Progress Report</h2>
      ${examHtml}
    </div>

    <!-- Section 3: Attendance -->
    <div class="section">
      <h2>3. Attendance Information</h2>
      ${attHtml}
    </div>

    <!-- Section 4: Fee Ledger -->
    <div class="section">
      <h2>4. Fee Information</h2>
      ${feesHtml}
    </div>
  `;

  openPrintWindow(`Student Report — ${student.name}`, body);
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. PRINT TEACHER LIST
// ──────────────────────────────────────────────────────────────────────────────
export function printTeachers(teachers) {
  const rows = teachers.map((t, i) => `<tr>
    <td>${i + 1}</td>
    <td><strong>${t.name}</strong></td>
    <td>${t.employee_id || '—'}</td>
    <td>${t.department || '—'}</td>
    <td>${t.designation || '—'}</td>
    <td>${t.qualification || '—'}</td>
    <td>${t.subjects || '—'}</td>
    <td>${t.phone || '—'}</td>
    <td>${t.email || '—'}</td>
    <td>${fmtDate(t.date_of_joining)}</td>
  </tr>`).join('');

  const body = `
    <div class="header" style="display:block;border-bottom:3px solid #1d4ed8;padding-bottom:12px;margin-bottom:20px;">
      <h1>Teachers / Staff Directory</h1>
      <p style="color:#6b7280;margin-top:4px;">${teachers.length} staff member${teachers.length !== 1 ? 's' : ''}</p>
    </div>
    <table>
      <thead><tr>
        <th>#</th><th>Name</th><th>Employee ID</th><th>Department</th>
        <th>Designation</th><th>Qualification</th><th>Subjects</th>
        <th>Phone</th><th>Email</th><th>Joined</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  openPrintWindow('Teachers Directory', body);
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. PRINT EXPENSES
// ──────────────────────────────────────────────────────────────────────────────
export function printExpenses(expenses, filters = {}) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const catMap = {};
  for (const e of expenses) catMap[e.category] = (catMap[e.category] || 0) + e.amount;

  const catRows = Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => `
    <tr><td>${cat}</td><td style="text-align:right;font-weight:600;">₹${amt.toLocaleString('en-IN')}</td>
    <td style="text-align:right;">${((amt / total) * 100).toFixed(1)}%</td></tr>
  `).join('');

  const expRows = expenses.map((e, i) => `<tr>
    <td>${i + 1}</td>
    <td><strong>${e.title}</strong>${e.description ? `<br><span style="color:#6b7280;font-size:10px;">${e.description}</span>` : ''}</td>
    <td><span class="badge badge-gray">${e.category}</span></td>
    <td style="text-align:right;font-weight:600;">₹${Number(e.amount).toLocaleString('en-IN')}</td>
    <td>${fmtDate(e.expense_date)}</td>
  </tr>`).join('');

  const filterLabel = [
    filters.month && filters.year ? `${filters.month}/${filters.year}` : filters.year || '',
    filters.category || '',
  ].filter(Boolean).join(' · ');

  const body = `
    <div class="header" style="display:block;border-bottom:3px solid #1d4ed8;padding-bottom:12px;margin-bottom:20px;">
      <h1>Expense Report${filterLabel ? ` — ${filterLabel}` : ''}</h1>
      <p style="color:#6b7280;margin-top:4px;">${expenses.length} record${expenses.length !== 1 ? 's' : ''} · Total: ₹${total.toLocaleString('en-IN')}</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
      <div>
        <h2>Category Breakdown</h2>
        <table>
          <thead><tr><th>Category</th><th style="text-align:right">Amount</th><th style="text-align:right">%</th></tr></thead>
          <tbody>${catRows}</tbody>
          <tfoot><tr style="font-weight:700;background:#f3f4f6;">
            <td>Grand Total</td>
            <td style="text-align:right">₹${total.toLocaleString('en-IN')}</td>
            <td style="text-align:right">100%</td>
          </tr></tfoot>
        </table>
      </div>
      <div class="stat-box" style="display:flex;flex-direction:column;justify-content:center;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
        <div class="lbl" style="font-size:11px;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">Grand Total</div>
        <div class="val" style="font-size:32px;font-weight:700;color:#1d4ed8;">₹${total.toLocaleString('en-IN')}</div>
        <div style="margin-top:6px;color:#6b7280;font-size:11px;">${expenses.length} transactions</div>
      </div>
    </div>

    <h2>Transaction Details</h2>
    <table>
      <thead><tr><th>#</th><th>Title</th><th>Category</th><th style="text-align:right">Amount</th><th>Date</th></tr></thead>
      <tbody>${expRows}</tbody>
      <tfoot><tr style="font-weight:700;background:#f3f4f6;">
        <td colspan="3">Total</td>
        <td style="text-align:right">₹${total.toLocaleString('en-IN')}</td>
        <td></td>
      </tr></tfoot>
    </table>
  `;
  openPrintWindow('Expense Report', body);
}
