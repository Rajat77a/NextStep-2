import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, FileText, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getClasses, getStudents } from '@/api/data';
import { storage } from '@/api/storage';
import FlagBadge from '@/components/shared/FlagBadge';
import type { Class, Student } from '@/types';

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [studentsByClass, setStudentsByClass] = useState<Record<string, Student[]>>({});

  useEffect(() => {
    async function load() {
      if (!user) return;
      const cls = await getClasses();
      setClasses(cls);
      for (const c of cls) {
        const st = await getStudents({ classId: c.id });
        setStudentsByClass(prev => ({ ...prev, [c.id]: st }));
      }
    }
    load();
  }, [user]);

  const getClassStats = (classId: string) => {
    const students = studentsByClass[classId] || [];
    const reportCards = storage.getReportCards().filter(r => r.classId === classId);
    let flagged = 0;
    for (const s of students) {
      const cards = reportCards.filter(r => r.studentId === s.id);
      if (cards.length === 0) continue;
      const latest = cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      const grades = storage.getSubjectGrades().filter(g => g.reportCardId === latest.id);
      if (grades.some(g => g.flag === 'red' || g.flag === 'yellow')) flagged++;
    }
    return { studentCount: students.length, reportCount: reportCards.length, flagged };
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/teacher" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-6">My Classes</h2>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls, i) => {
          const stats = getClassStats(cls.id);
          const students = studentsByClass[cls.id] || [];
          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="bg-white rounded-2xl shadow-card p-6"
            >
              <h3 className="font-display text-xl text-charcoal mb-1">Grade {cls.grade}</h3>
              <p className="label-text text-medium-gray mb-4">Section {cls.section}</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-cream rounded-xl">
                  <Users size={16} className="mx-auto text-coral mb-1" />
                  <p className="font-display text-lg text-charcoal">{stats.studentCount}</p>
                  <p className="font-body text-[10px] text-medium-gray">Students</p>
                </div>
                <div className="text-center p-3 bg-cream rounded-xl">
                  <FileText size={16} className="mx-auto text-coral mb-1" />
                  <p className="font-display text-lg text-charcoal">{stats.reportCount}</p>
                  <p className="font-body text-[10px] text-medium-gray">Reports</p>
                </div>
                <div className="text-center p-3 bg-cream rounded-xl">
                  <BarChart3 size={16} className="mx-auto text-coral mb-1" />
                  <p className="font-display text-lg text-coral">{stats.flagged}</p>
                  <p className="font-body text-[10px] text-medium-gray">Flagged</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="label-text text-medium-gray">Quick View</p>
                {students.slice(0, 3).map(s => {
                  const cards = storage.getReportCards().filter(r => r.studentId === s.id);
                  let flag: 'green' | 'yellow' | 'red' = 'green';
                  if (cards.length > 0) {
                    const latest = cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                    const grades = storage.getSubjectGrades().filter(g => g.reportCardId === latest.id);
                    if (grades.some(g => g.flag === 'red')) flag = 'red';
                    else if (grades.some(g => g.flag === 'yellow')) flag = 'yellow';
                  }
                  return (
                    <div key={s.id} className="flex items-center justify-between py-1.5">
                      <span className="font-body text-sm text-charcoal">{s.fullName}</span>
                      <FlagBadge flag={flag} size="sm" />
                    </div>
                  );
                })}
                {students.length > 3 && <p className="font-body text-xs text-medium-gray">+{students.length - 3} more students</p>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
