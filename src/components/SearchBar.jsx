// ─── SearchBar.jsx ────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-400 w-full bg-white"
      />
    </div>
  );
}