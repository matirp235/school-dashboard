const BASE = '/api/expenses';

async function request(url, options = {}) {
  const res  = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getExpenses(filters = {}) {
  const params = new URLSearchParams();
  if (filters.month)    params.set('month', filters.month);
  if (filters.year)     params.set('year', filters.year);
  if (filters.category) params.set('category', filters.category);
  const qs = params.toString() ? `?${params}` : '';
  return request(`${BASE}${qs}`);
}

export async function createExpense(data) {
  return request(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateExpense(id, data) {
  return request(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteExpense(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' });
}
