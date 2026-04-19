// ─── TeachersPage.jsx ─────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useTeacherStore } from '../../store/teacherStore';
import { Modal } from '../../components/Modal';
import { SearchBar } from '../../components/SearchBar';
import { Table } from '../../components/Table';
import TeacherForm from './TeacherForm';

const DEPARTMENTS = ['Primary','Secondary','Senior Secondary','Science','Commerce','Arts','Physical Education','Administration'];

export default function TeachersPage() {
  const { teachers, loading, fetch, remove } = useTeacherStore();
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');

  useEffect(() => { fetch({ q: search, department: dept }); }, [search, dept]);

  const openEdit = (t) => { setSelected(t); setModal('edit'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const cols = [
    { key: 'full_name',    label: 'Name' },
    { key: 'employee_id',  label: 'Employee ID' },
    { key: 'department',   label: 'Department' },
    { key: 'designation',  label: 'Designation' },
    { key: 'subjects',     label: 'Subjects' },
    { key: 'contact_primary', label: 'Contact' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Teachers</h1>
          <p className="text-sm text-gray-500">{teachers.length} records</p>
        </div>
        <button onClick={() => setModal('add')}
          className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          + Add Teacher
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search by name or employee ID..." /></div>
        <select value={dept} onChange={e => setDept(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        {loading ? <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
          : <Table cols={cols} rows={teachers} onEdit={openEdit} onDelete={remove} emptyMsg="No teachers found" />}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Teacher' : 'Edit Teacher'} onClose={closeModal}>
          <TeacherForm initial={selected} onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}