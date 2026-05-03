const BASE = '/api/progress';

async function request(url, options = {}) {
  const res  = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

/**
 * Fetch all mark entries for a student.
 * @param {number|string} studentId
 * @returns {Promise<Array>}
 */
export async function getProgressByStudent(studentId) {
  return request(`${BASE}/${studentId}`);
}

/**
 * Fetch per-exam summary (totals + percentage) for a student.
 * @param {number|string} studentId
 * @returns {Promise<Array>}
 */
export async function getProgressSummary(studentId) {
  return request(`${BASE}/${studentId}/summary`);
}

/**
 * Add one mark entry.
 * @param {{ student_id, exam_name, subject, marks, max_marks, exam_date, remarks }} entry
 */
export async function addMark(entry) {
  return request(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
}

/**
 * Add multiple mark entries in one call (batch insert for a full exam).
 * @param {Array} entries
 */
export async function addMarksBatch(entries) {
  return request(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entries),
  });
}

/**
 * Update a mark entry.
 * @param {number|string} id  Progress report row id
 * @param {object} data       Fields to update
 */
export async function updateMark(id, data) {
  return request(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Delete a single mark entry.
 */
export async function deleteMark(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' });
}

/**
 * Delete all marks for one exam name under a student.
 */
export async function deleteExam(studentId, examName) {
  const encoded = encodeURIComponent(examName);
  return request(`${BASE}/student/${studentId}/exam/${encoded}`, { method: 'DELETE' });
}
