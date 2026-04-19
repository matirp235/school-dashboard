import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/students', label: 'Students', icon: '👨‍🎓' },
  { path: '/teachers', label: 'Teachers', icon: '👨‍🏫' },
  { path: '/expenses', label: 'Expenses', icon: '📉' },
  { path: '/contact', label: 'Contact Us', icon: '📞' } // Ensure path is exactly '/contact'
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 shadow-sm z-40">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          E
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">EduDash</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            // NavLink provides an isActive boolean automatically based on the URL
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Optional: Bottom user profile snippet */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Admin User</p>
            <p className="text-xs text-gray-400">admin@school.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}