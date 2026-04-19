import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/StatCard';
import axios from 'axios';

const shortcuts = [
  { to: '/students', icon: '🎓', label: 'Students',  desc: 'Manage student profiles',  color: 'bg-blue-50  hover:bg-blue-100  text-blue-700'  },
  { to: '/teachers', icon: '👤', label: 'Teachers',  desc: 'Manage teacher profiles',  color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
  { to: '/expenses', icon: '₹',  label: 'Expenses',  desc: 'Track monthly expenses',   color: 'bg-amber-50 hover:bg-amber-100  text-amber-700'  },
];

export default function HomePage() {
  const nav = useNavigate();
  const [stats, setStats] = useState({ students: 0, teachers: 0, expenses: '—' });
  const today = new Date();

  useEffect(() => {
    Promise.all([
      axios.get('/api/students').then(r => r.data.length),
      axios.get('/api/teachers').then(r => r.data.length),
      axios.get('/api/expenses/summary', {
        params: {
          month: today.toLocaleString('default', { month: 'long' }),
          year: today.getFullYear()
        }
      }).then(r => `₹${r.data.grand_total?.toLocaleString('en-IN') || 0}`),
    ]).then(([students, teachers, expenses]) => setStats({ students, teachers, expenses }))
      .catch(() => {});
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Good morning 👋</h1>
        <p className="text-gray-500 text-sm mt-1">
          {today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard label="Total Students" value={stats.students} icon="🎓" color="blue" />
        <StatCard label="Total Teachers"  value={stats.teachers} icon="👤" color="purple" />
        <StatCard label="This Month's Expenses" value={stats.expenses} icon="₹" color="amber" />
      </div>

      {/* Quick access */}
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Quick Access</h2>
      <div className="grid grid-cols-3 gap-4">
        {shortcuts.map(({ to, icon, label, desc, color }) => (
          <button key={to} onClick={() => nav(to)}
            className={`${color} rounded-xl p-6 text-left transition-colors`}>
            <span className="text-3xl">{icon}</span>
            <p className="font-semibold mt-3">{label}</p>
            <p className="text-xs mt-1 opacity-70">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}