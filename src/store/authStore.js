import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout, getMe, changePassword as apiChangePassword } from '../services/authService.js';

// Rehydrate from localStorage on load
function loadPersistedAuth() {
  try {
    const token = localStorage.getItem('auth_token');
    const user  = JSON.parse(localStorage.getItem('auth_user') || 'null');
    if (token && user) return { token, user, isAuthenticated: true };
  } catch (_) {}
  return { token: null, user: null, isAuthenticated: false };
}

const persisted = loadPersistedAuth();

const useAuthStore = create((set, get) => ({
  token:           persisted.token,
  user:            persisted.user,
  isAuthenticated: persisted.isAuthenticated,
  loading:         false,
  error:           null,

  async login(username, password) {
    set({ loading: true, error: null });
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify({ username: data.username, role: data.role }));
      set({ token: data.token, user: { username: data.username, role: data.role }, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  async logout() {
    await apiLogout();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  async verifySession() {
    if (!get().token) return;
    try {
      await getMe();
    } catch (_) {
      // Token invalid/expired — clear session
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({ token: null, user: null, isAuthenticated: false });
    }
  },

  async changePassword(current, next) {
    return apiChangePassword(current, next);
  },

  clearError() { set({ error: null }); },
}));

export default useAuthStore;
export { useAuthStore };
