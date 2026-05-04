const BASE = '/api/auth';

async function request(url, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { 'x-auth-token': token } : {}) };
  const res  = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function login(username, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function logout() {
  try { await request(`${BASE}/logout`, { method: 'POST' }); } catch (_) {}
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

export async function getMe() {
  return request(`${BASE}/me`);
}

export async function changePassword(current_password, new_password) {
  return request(`${BASE}/change-password`, {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password }),
  });
}
