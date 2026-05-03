const BASE = '/api/teachers';

async function request(url, options = {}) {
  const res  = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getTeachers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search)     params.set('search', filters.search);
  if (filters.department) params.set('department', filters.department);
  const qs = params.toString() ? `?${params}` : '';
  return request(`${BASE}${qs}`);
}

export async function getTeacher(id)         { return request(`${BASE}/${id}`); }
export async function createTeacher(fd)      { return request(BASE, { method: 'POST', body: fd }); }
export async function updateTeacher(id, fd)  { return request(`${BASE}/${id}`, { method: 'PUT', body: fd }); }
export async function deleteTeacher(id)      { return request(`${BASE}/${id}`, { method: 'DELETE' }); }
