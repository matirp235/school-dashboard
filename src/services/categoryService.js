const BASE = '/api/categories';

async function request(url, options = {}) {
  const token = localStorage.getItem('auth_token');
  const res   = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { 'x-auth-token': token } : {}), ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const getCategories    = ()           => request(BASE);
export const createCategory   = (data)       => request(BASE, { method: 'POST', body: JSON.stringify(data) });
export const updateCategory   = (id, data)   => request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory   = (id)         => request(`${BASE}/${id}`, { method: 'DELETE' });
