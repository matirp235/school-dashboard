import { useEffect, useState } from 'react';
import { useStudentStore } from '../../store/studentStore.js';
import { useTeacherStore } from '../../store/teacherStore.js';
import { useExpenseStore } from '../../store/expenseStore.js';

export default function HomePage() {
  const { students, fetchAll: fetchStudents } = useStudentStore();
  const { teachers, fetchAll: fetchTeachers } = useTeacherStore();
  const { summary, fetchSummary } = useExpenseStore();

  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // --- BANNER STATE & LOGIC ---
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [banner, setBanner] = useState(() => {
    const saved = localStorage.getItem('school_banner');
    return saved ? JSON.parse(saved) : {
      tag: 'Announcement',
      title: 'Admissions Open for 2026-2027! 🎓',
      subtitle: 'Offer early-bird discounts on security deposits until the end of the month.'
    };
  });

  const [editBannerForm, setEditBannerForm] = useState(banner);

  const saveBanner = () => {
    setBanner(editBannerForm);
    localStorage.setItem('school_banner', JSON.stringify(editBannerForm));
    setIsEditingBanner(false);
  };

// --- BULLETPROOF BACKUP LOGIC ---
  const handleBackup = async () => {
    try {
      // 1. Fetch the file via the proxy
      const res = await fetch('/api/system/backup');
      
      if (!res.ok) {
        alert("Failed to download backup. Please check backend server.");
        return;
      }

      // 2. Convert the response into a Blob (raw file data)
      const blob = await res.blob();
      
      // 3. Create a temporary download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // 4. Force the download with a dynamic filename
      const date = new Date().toISOString().slice(0, 10);
      a.download = `school-backup-${date}.db`;
      
      // 5. Click the link invisibly and clean it up
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Backup error:", error);
    }
  };

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

  useEffect(() => {
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear().toString();

    if (fetchStudents) fetchStudents();
    if (fetchTeachers) fetchTeachers();
    if (fetchSummary) fetchSummary(month, year);
  }, [fetchStudents, fetchTeachers, fetchSummary]);

  return (
    <div className="p-6 space-y-6">
      
      {/* HEADER & BACKUP BUTTON */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {greeting}, Admin! 👋
          </h1>
          <p className="text-gray-500 mt-1 font-medium">{currentDate}</p>
        </div>
        <button 
          onClick={handleBackup}
          className="mt-4 md:mt-0 flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 border border-green-200 font-bold rounded-lg hover:bg-green-100 transition-colors"
        >
          <span className="text-xl">📥</span> Weekly Backup
        </button>
      </div>

      {/* AD BANNER SECTION */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="text-white mb-4 md:mb-0 max-w-3xl">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              {banner.tag}
            </span>
            <h2 className="text-2xl font-bold mb-1">{banner.title}</h2>
            <p className="text-blue-100">{banner.subtitle}</p>
          </div>
          <button 
            onClick={() => setIsEditingBanner(true)}
            className="whitespace-nowrap px-6 py-3 bg-white text-blue-700 font-bold rounded-lg shadow-lg hover:bg-gray-50 hover:scale-105 transition-transform"
          >
            Update Banner
          </button>
        </div>
      </div>

      {/* LIVE METRICS DASHBOARD (Updated to 4 Columns) */}
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-2">School Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl">👨‍🎓</div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Students</p>
            <p className="text-3xl font-bold text-gray-800">{students?.length || 0}</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl">👨‍🏫</div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Staff</p>
            <p className="text-3xl font-bold text-gray-800">{teachers?.length || 0}</p>
          </div>
        </div>

        {/* Metric 3: New Attendance Metric */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl">✅</div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Today's Attendance</p>
            <p className="text-3xl font-bold text-gray-800">--%</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl">📉</div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Month's Expenses</p>
            <p className="text-3xl font-bold text-gray-800">₹{summary?.grand_total || 0}</p>
          </div>
        </div>
      </div>

      {/* BANNER EDIT MODAL */}
      {isEditingBanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Edit Dashboard Banner</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Tag (Small Pill)</label>
                <input 
                  type="text" value={editBannerForm.tag} 
                  onChange={e => setEditBannerForm({...editBannerForm, tag: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" 
                  placeholder="e.g. Announcement, Holiday, Alert"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Headline</label>
                <input 
                  type="text" value={editBannerForm.title} 
                  onChange={e => setEditBannerForm({...editBannerForm, title: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle Details</label>
                <textarea 
                  value={editBannerForm.subtitle} 
                  onChange={e => setEditBannerForm({...editBannerForm, subtitle: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none resize-none" 
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-4 border-t">
              <button onClick={() => setIsEditingBanner(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={saveBanner} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}