import { useState, useEffect } from 'react';

export default function StudentDetailView({ student, onClose }) {
  const [fees, setFees] = useState([]);
  const [newFee, setNewFee] = useState({ month_year: '', amount: '', payment_mode: 'Cash', comment: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFees();
  }, [student.id]);

  const fetchFees = async () => {
    try {
      const res = await fetch(`/api/students/${student.id}/fees`);
      if (res.ok) {
        const data = await res.json();
        setFees(data);
      }
    } catch (error) {
      console.error("Failed to fetch fees", error);
    }
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${student.id}/fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFee)
      });
      if (res.ok) {
        setNewFee({ month_year: '', amount: '', payment_mode: 'Cash', comment: '' });
        fetchFees(); 
      }
    } catch (error) {
      console.error("Failed to add fee", error);
    } finally {
      setLoading(false);
    }
  };

  // Construct full image URL (Assuming backend runs on port 5000 in dev)
  const getImageUrl = (path) => {
    if (!path) return null;
    // When running Vite (5173), we need to point to the backend (5000) for static files
    return path.startsWith('/') ? `http://localhost:5000${path}` : path;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* SECTION 1: Fixed Student Details & Photo */}
      <section className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col md:flex-row gap-6 items-center md:items-start">
        
        {/* Student Photo Thumbnail */}
        <div className="flex-shrink-0">
          {student.photo_url ? (
            <img 
              src={getImageUrl(student.photo_url)} 
              alt={student.full_name} 
              className="w-28 h-28 object-cover rounded-full border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-28 h-28 bg-blue-200 text-blue-600 flex items-center justify-center rounded-full text-4xl font-bold border-4 border-white shadow-md">
              {student.full_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Text Details Grid */}
        <div className="flex-1 w-full">
          <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
            👤 Student Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><p className="text-blue-500/80 text-xs font-semibold uppercase">Full Name</p><p className="font-bold text-gray-800">{student.full_name}</p></div>
            <div><p className="text-blue-500/80 text-xs font-semibold uppercase">Class/Section</p><p className="font-bold text-gray-800">{student.class} {student.section ? `- ${student.section}` : ''}</p></div>
            <div><p className="text-blue-500/80 text-xs font-semibold uppercase">Roll No</p><p className="font-bold text-gray-800">{student.roll_no || 'N/A'}</p></div>
            <div><p className="text-blue-500/80 text-xs font-semibold uppercase">Guardian</p><p className="font-bold text-gray-800">{student.guardian_name} ({student.guardian_rel})</p></div>
            <div><p className="text-blue-500/80 text-xs font-semibold uppercase">Contact</p><p className="font-bold text-gray-800">{student.contact_primary}</p></div>
            <div><p className="text-blue-500/80 text-xs font-semibold uppercase">Security Deposit</p><p className="font-bold text-green-600">₹{student.security_deposit || 0}</p></div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Fees Management (Remains Unchanged) */}
      <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          💳 Fee Management
        </h3>
        
        <form onSubmit={handleAddFee} className="flex flex-wrap gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <input type="month" required className="border border-gray-300 p-2 rounded text-sm flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-400 outline-none" 
            value={newFee.month_year} onChange={e => setNewFee({...newFee, month_year: e.target.value})} />
          <input type="number" placeholder="Amount (₹)" required className="border border-gray-300 p-2 rounded text-sm flex-1 min-w-[100px] focus:ring-2 focus:ring-blue-400 outline-none" 
            value={newFee.amount} onChange={e => setNewFee({...newFee, amount: e.target.value})} />
          <select className="border border-gray-300 p-2 rounded text-sm flex-1 min-w-[100px] bg-white focus:ring-2 focus:ring-blue-400 outline-none" 
            value={newFee.payment_mode} onChange={e => setNewFee({...newFee, payment_mode: e.target.value})}>
            <option>Cash</option><option>Online/UPI</option><option>Cheque</option>
          </select>
          <input type="text" placeholder="Comment/Ref" className="border border-gray-300 p-2 rounded text-sm flex-2 min-w-[150px] focus:ring-2 focus:ring-blue-400 outline-none" 
            value={newFee.comment} onChange={e => setNewFee({...newFee, comment: e.target.value})} />
          <button disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Adding...' : '+ Add Fee'}
          </button>
        </form>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-gray-600 font-semibold">Month/Year</th>
                <th className="px-4 py-3 text-gray-600 font-semibold">Amount</th>
                <th className="px-4 py-3 text-gray-600 font-semibold">Mode</th>
                <th className="px-4 py-3 text-gray-600 font-semibold">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fees.length > 0 ? fees.map(f => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{f.month_year}</td>
                  <td className="px-4 py-3 text-green-600 font-bold">₹{f.amount}</td>
                  <td className="px-4 py-3"><span className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium">{f.payment_mode}</span></td>
                  <td className="px-4 py-3 text-gray-500 italic">{f.comment || '-'}</td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="text-center py-6 text-gray-400">No fee records found for this student.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}