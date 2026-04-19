// ─── Modal.jsx ────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}