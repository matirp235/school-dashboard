// ─── Table.jsx ────────────────────────────────────────────────────────────────
export function Table({ cols, rows, onEdit, onDelete, emptyMsg = 'No records found' }) {
  if (!rows.length) return (
    <div className="text-center py-16 text-gray-400 text-sm">{emptyMsg}</div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {cols.map(c => (
              <th key={c.key} className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                {c.label}
              </th>
            ))}
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              {cols.map(c => (
                <td key={c.key} className="py-3 px-4 text-gray-700">
                  {c.render ? c.render(row) : row[c.key] ?? '—'}
                </td>
              ))}
              <td className="py-3 px-4 text-right space-x-2">
                <button onClick={() => onEdit(row)}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium">Edit</button>
                <button onClick={() => onDelete(row.id)}
                  className="text-xs text-red-400 hover:text-red-600 font-medium">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}