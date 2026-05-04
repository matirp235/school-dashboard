import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import Modal from './Modal.jsx';
import { changePassword } from '../services/authService.js';

const NAV_LINKS = [
  { path: '/',           label: 'Dashboard',  icon: '🏠' },
  { path: '/students',   label: 'Students',   icon: '👨‍🎓' },
  { path: '/teachers',   label: 'Teachers',   icon: '👨‍🏫' },
  { path: '/attendance', label: 'Attendance', icon: '📅' },
  { path: '/expenses',   label: 'Expenses',   icon: '📉' },
  { path: '/contact',    label: 'Contact Us', icon: '📞' },
];

function ChangePasswordModal({ onClose }) {
  const [form, setForm]     = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (form.next.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (form.next !== form.confirm) { setError('New passwords do not match'); return; }
    setLoading(true);
    try {
      await changePassword(form.current, form.next);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <Modal title="Change Password" onClose={onClose} size="sm">
      {success ? (
        <div className="text-center py-6">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-semibold text-green-700">Password updated successfully!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">⚠️ {error}</div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Current Password</label>
            <input type="password" required value={form.current} onChange={e => setForm(p => ({...p, current: e.target.value}))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
            <input type="password" required value={form.next} onChange={e => setForm(p => ({...p, next: e.target.value}))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm New Password</label>
            <input type="password" required value={form.confirm} onChange={e => setForm(p => ({...p, confirm: e.target.value}))} className={inp} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2">
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate         = useNavigate();
  const [showChangePw, setShowChangePw] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 shadow-sm z-40">
        {/* Brand */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">EduDash</h2>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`
              }>
              <span className="text-xl">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-100">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition text-left">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role || 'admin'}</p>
              </div>
              <span className="text-gray-400 text-xs">{showUserMenu ? '▲' : '▼'}</span>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                <button
                  onClick={() => { setShowChangePw(true); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                  🔑 Change Password
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition text-left">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </>
  );
}
