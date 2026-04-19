import { NavLink } from "react-router-dom";

const menuItems = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Students', path: '/students', icon: '🎓' },
  { name: 'Teachers', path: '/teachers', icon: '👨‍🏫' },
  { name: 'Expenses', path: '/expenses', icon: '💸' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-blue-400">
          School Admin
        </h1>
        <p className="text-xs text-slate-400 mt-1">Management Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3 text-center text-xs text-slate-400">
          v1.0.0 Stable
        </div>
      </div>
    </aside>
  );
}