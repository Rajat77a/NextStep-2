import { useState, useEffect } from 'react';
import TransitionLink from '@/components/shared/TransitionLink';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Upload, X, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getStudents, addStudent, getClasses, deleteStudent, getReportCards, getSubjectGrades } from '@/api/data';
import FlagBadge from '@/components/shared/FlagBadge';
import type { Student, Class } from '@/types';

export default function StudentRoster() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [newStudent, setNewStudent] = useState({ fullName: '', rollNumber: '', classId: '', parentName: '', parentEmail: '' });
  const [csvText, setCsvText] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const [st, cl] = await Promise.all([getStudents(), getClasses()]);
    setStudents(st);
    setClasses(cl);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addStudent(newStudent);
    setShowAdd(false);
    setNewStudent({ fullName: '', rollNumber: '', classId: '', parentName: '', parentEmail: '' });
    loadData();
  };

  const handleBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = csvText.trim().split('\n').slice(1);
    const rows = lines.map(line => {
      const [rollNumber, fullName, parentName, parentEmail] = line.split(',');
      return { rollNumber: rollNumber?.trim(), fullName: fullName?.trim(), parentName: parentName?.trim(), parentEmail: parentEmail?.trim() };
    }).filter(r => r.rollNumber && r.fullName);
    if (rows.length > 0 && newStudent.classId) {
      const { importBulkStudents } = await import('@/api/bulk');
      await importBulkStudents(newStudent.classId, rows as any);
      setShowBulk(false);
      setCsvText('');
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this student?')) {
      await deleteStudent(id);
      loadData();
    }
  };

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.includes(search)
  );

  const [flagMap, setFlagMap] = useState<Record<string, string>>({});

  const getStudentFlag = async (studentId: string) => {
    try {
      const cards = await getReportCards({ studentId });
      if (!cards.length) return 'green' as const;
      const grades = await getSubjectGrades(cards[0].id);
      if (grades.some(g => g.flag === 'red')) return 'red';
      if (grades.some(g => g.flag === 'yellow')) return 'yellow';
      return 'green';
    } catch {
      return 'green';
    }
  };

  useEffect(() => {
    async function loadFlags() {
      const flags: Record<string, string> = {};
      await Promise.all(students.map(async (s) => {
        flags[s.id] = await getStudentFlag(s.id);
      }));
      setFlagMap(flags);
    }
    if (students.length > 0) loadFlags();
  }, [students]);

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <TransitionLink to="/admin" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Dashboard
        </TransitionLink>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-display text-2xl md:text-4xl text-charcoal">Student Roster</h2>
          <div className="flex gap-3">
            <button onClick={() => setShowBulk(true)} className="btn-text px-4 py-2.5 rounded-[10px] border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-all flex items-center gap-2">
              <Upload size={14} /> Bulk Upload
            </button>
            <button onClick={() => setShowAdd(true)} className="btn-text px-4 py-2.5 rounded-[10px] bg-coral text-white hover:bg-coral-dark transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
              <Plus size={14} /> Add Student
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-medium-gray" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or roll number..." className="w-full pl-9 pr-4 py-2.5 rounded-[10px] border border-light-gray bg-white font-body text-sm focus:border-coral outline-none" />
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cream border-b border-light-gray">
                <th className="text-left py-3 px-4 label-text text-charcoal/60">Name</th>
                <th className="text-left py-3 px-4 label-text text-charcoal/60">Roll No</th>
                <th className="text-left py-3 px-4 label-text text-charcoal/60">Class</th>
                <th className="text-left py-3 px-4 label-text text-charcoal/60">Flag</th>
                <th className="text-left py-3 px-4 label-text text-charcoal/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => {
                const cls = classes.find(c => c.id === student.classId);
                const flag = flagMap[student.id] || 'green';
                return (
                  <tr key={student.id} className="border-b border-light-gray/50 hover:bg-cream/30 transition-colors">
                    <td className="py-3 px-4 font-body text-sm text-charcoal">{student.fullName}</td>
                    <td className="py-3 px-4 font-body text-sm text-medium-gray">{student.rollNumber}</td>
                    <td className="py-3 px-4 font-body text-sm text-medium-gray">{cls ? `Grade ${cls.grade}-${cls.section}` : '-'}</td>
                    <td className="py-3 px-4"><FlagBadge flag={flag} size="sm" /></td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleDelete(student.id)} className="text-medium-gray hover:text-coral transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="font-body text-medium-gray">No students found</p>
          </div>
        )}
      </motion.div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl shadow-modal p-8 w-full max-w-md">
              <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream flex items-center justify-center hover:bg-light-gray"><X size={14} /></button>
              <h3 className="font-display text-2xl text-charcoal mb-6">Add Student</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <input type="text" value={newStudent.fullName} onChange={e => setNewStudent({ ...newStudent, fullName: e.target.value })} placeholder="Student Name" className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none" required />
                <input type="text" value={newStudent.rollNumber} onChange={e => setNewStudent({ ...newStudent, rollNumber: e.target.value })} placeholder="Roll Number" className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none" required />
                <select value={newStudent.classId} onChange={e => setNewStudent({ ...newStudent, classId: e.target.value })} className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none" required>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>Grade {c.grade}-{c.section}</option>)}
                </select>
                <input type="text" value={newStudent.parentName} onChange={e => setNewStudent({ ...newStudent, parentName: e.target.value })} placeholder="Parent Name" className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none" />
                <input type="email" value={newStudent.parentEmail} onChange={e => setNewStudent({ ...newStudent, parentEmail: e.target.value })} placeholder="Parent Email" className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none" />
                <button type="submit" className="w-full py-3 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all">Add Student</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Upload Modal */}
      <AnimatePresence>
        {showBulk && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setShowBulk(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl shadow-modal p-8 w-full max-w-lg">
              <button onClick={() => setShowBulk(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream flex items-center justify-center hover:bg-light-gray"><X size={14} /></button>
              <h3 className="font-display text-2xl text-charcoal mb-2">Bulk Upload Students</h3>
              <p className="font-body text-sm text-medium-gray mb-4">Paste CSV data: rollNumber,fullName,parentName,parentEmail</p>
              <select value={newStudent.classId} onChange={e => setNewStudent({ ...newStudent, classId: e.target.value })} className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none mb-4" required>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>Grade {c.grade}-{c.section}</option>)}
              </select>
              <textarea value={csvText} onChange={e => setCsvText(e.target.value)} rows={8} placeholder="rollNumber,fullName,parentName,parentEmail&#10;001,Rahul Sharma,Mrs. Sharma,parent1@demo.com&#10;002,Priya Patel,Mr. Patel,parent2@demo.com" className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none resize-none mb-4" />
              <button onClick={handleBulk} className="w-full py-3 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all">Process Upload</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
