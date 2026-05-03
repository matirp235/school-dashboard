const BASE = '/api/students';

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function request(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Students ─────────────────────────────────────────────────────────────────

/**
 * Fetch all students with optional filters.
 * @param {{ search?: string, class?: string, board?: string }} filters
 */
export async function getStudents(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.class)  params.set('class', filters.class);
  if (filters.board)  params.set('board', filters.board);
  const qs = params.toString() ? `?${params}` : '';
  return request(`${BASE}${qs}`);
}

/**
 * Fetch single student by id.
 */
export async function getStudent(id) {
  return request(`${BASE}/${id}`);
}

/**
 * Create a new student.
 * @param {FormData} formData  Must include name, class, board and optionally photo.
 */
export async function createStudent(formData) {
  return request(BASE, { method: 'POST', body: formData });
}

/**
 * Update an existing student.
 * @param {number|string} id
 * @param {FormData} formData
 */
export async function updateStudent(id, formData) {
  return request(`${BASE}/${id}`, { method: 'PUT', body: formData });
}

/**
 * Delete a student.
 */
export async function deleteStudent(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' });
}

// ─── Fees ─────────────────────────────────────────────────────────────────────

export async function getFees(studentId) {
  return request(`${BASE}/${studentId}/fees`);
}

export async function addFee(studentId, feeData) {
  return request(`${BASE}/${studentId}/fees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feeData),
  });
}

export async function deleteFee(feeId) {
  return request(`${BASE}/fees/${feeId}`, { method: 'DELETE' });
}
