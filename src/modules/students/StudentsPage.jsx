// ─── StudentsPage.jsx ─────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useStudentStore } from '../../store/studentStore';
import { Modal } from '../../components/Modal';
import { SearchBar } from '../../components/SearchBar';
import { Table } from '../../components/Table';
import StudentForm from './StudentForm';
import StudentPrintView from './StudentPrintView';

const CLASSES = ['Nursery','LKG','UKG','1','2','3','4','5','6','7','8','9','10','11','12'];

export default function StudentsPage() {
  const { students, loading, fetch, remove } = useStudentStore();
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const printRef = useRef();

  useEffect(() => { fetch({ q: search, class: filterClass }); }, [search, filterClass]);

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const openEdit = (s) => { setSelected(s); setModal('edit'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const cols = [
    { key: 'photo_url', label: '', render: r => r.photo_url
        ? <img src={r.photo_url} className="w-8 h-8 rounded-full object-cover"/> : <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600">{r.full_name[0]}</div> },
    { key: 'full_name',  label: 'Name' },
    { key: 'class',      label: 'Class', render: r => `Class ${r.class}${r.section ? ' – ' + r.section : ''}` },
    { key: 'roll_no',    label: 'Roll No' },
    { key: 'guardian_name', label: 'Guardian' },
    { key: 'contact_primary', label: 'Contact' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Students</h1>
          <p className="text-sm text-gray-500">{students.length} records</p>
        </div>
        <button onClick={() => setModal('add')}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search by name or roll no..." /></div>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
          <option value="">All Classes</option>
          {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <button onClick={handlePrint}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          🖨 Print List
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100">
        {loading ? <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
          : <Table cols={cols} rows={students} onEdit={openEdit} onDelete={remove} emptyMsg="No students found" />}
      </div>

      {/* Hidden print view */}
      <div className="hidden"><StudentPrintView ref={printRef} students={students} /></div>

      {/* Modals */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Student' : 'Edit Student'} onClose={closeModal}>
          <StudentForm initial={selected} onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}