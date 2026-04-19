import { useEffect, useState } from 'react';
import { useStudentStore } from '../../store/studentStore.js';
import { useTeacherStore } from '../../store/teacherStore.js';
import { useExpenseStore } from '../../store/expenseStore.js';

export default function HomePage() {
  // 1. Connect to all your stores
  const { students, fetchAll: fetchStudents } = useStudentStore();
  const { teachers, fetchAll: fetchTeachers } = useTeacherStore();
  const { summary, fetchSummary } = useExpenseStore();

  // 2. Dynamic Greeting Logic
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');

      setCurrentDate(now.toLocaleDateString('en-IN', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      }));
    };
    
    updateTime();
  }, []);

  // 3. Fetch all live data on mount
  useEffect(() => {
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear().toString();

    if (fetchStudents) fetchStudents();
    if (fetchTeachers) fetchTeachers();
    if (fetchSummary) fetchSummary(month, year);
  }, [fetchStudents, fetchTeachers, fetchSummary]);

  return (
    <div className="p-6 space-y-6">
      
      {/* HEADER: Dynamic Greeting & Date */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {greeting}, Admin! 👋
          </h1>
          <p className="text-gray-500 mt-1 font-medium">{currentDate}</p>
        </div>
      </div>

      {/* AD BANNER SECTION */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-md overflow-hidden relative">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="text-white mb-4 md:mb-0">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              Announcement
            </span>
            <h2 className="text-2xl font-bold mb-1">Admissions Open for 2026-2027! 🎓</h2>
            <p className="text-blue-100">Offer early-bird discounts on security deposits until the end of the month.</p>
          </div>
          <button className="whitespace-nowrap px-6 py-3 bg-white text-blue-700 font-bold rounded-lg shadow-lg hover:bg-gray-50 hover:scale-105 transition-transform">
            Update Banner
          </button>
        </div>
      </div>

      {/* LIVE METRICS DASHBOARD */}
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-2">School Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Total Students */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl">
            👨‍🎓
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Students</p>
            <p className="text-3xl font-bold text-gray-800">{students?.length || 0}</p>
          </div>
        </div>

        {/* Metric 2: Total Teachers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl">
            👨‍🏫
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Staff</p>
            <p className="text-3xl font-bold text-gray-800">{teachers?.length || 0}</p>
          </div>
        </div>

        {/* Metric 3: Current Month Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl">
            📉
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">This Month's Expenses</p>
            <p className="text-3xl font-bold text-gray-800">₹{summary?.grand_total || 0}</p>
          </div>
        </div>

      </div>
    </div>
  );
}