import { NavLink } from 'react-router-dom';

const links = [
  { to: '/home',     icon: '⊞', label: 'Home' },
  { to: '/students', icon: '🎓', label: 'Students' },
  { to: '/teachers', icon: '👤', label: 'Teachers' },
  { to: '/expenses', icon: '₹', label: 'Expenses' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col h-full no-print">
      {/* Logo / brand */}
      <div className="px-6 py-6 border-b border-gray-100">
        <h1 className="text-base font-semibold text-gray-800">School Dashboard</h1>
        <p className="text-xs text-gray-400 mt-0.5">Institution Management</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
               ${isActive
                 ? 'bg-blue-50 text-blue-600 font-medium'
                 : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
               }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">v1.0.0 · Local</p>
      </div>
    </aside>
  );
}