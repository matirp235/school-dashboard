const BASE = '/api/attendance';

async function request(url, options = {}) {
  const res  = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getAttendanceForDate(date, filters = {}) {
  const params = new URLSearchParams({ date });
  if (filters.class) params.set('class', filters.class);
  if (filters.board) params.set('board', filters.board);
  return request(`${BASE}?${params}`);
}

export async function getStudentAttendance(studentId, month, year) {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (year)  params.set('year', year);
  return request(`${BASE}/student/${studentId}?${params}`);
}

export async function getStudentAttendanceSummary(studentId) {
  return request(`${BASE}/student/${studentId}/summary`);
}

export async function saveBulkAttendance(date, records) {
  return request(`${BASE}/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, records }),
  });
}

export async function updateAttendanceRecord(id, data) {
  return request(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
