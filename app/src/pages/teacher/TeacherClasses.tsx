import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransitionLink from '@/components/shared/TransitionLink';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getClasses, getStudents, getReportCards, getSubjectGrades } from '@/api/data';
import FlagBadge from '@/components/shared/FlagBadge';
import type { Class, Student } from '@/types';

export default function TeacherClasses() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const [statsCache, setStatsCache] = useState<Record<string, { studentCount: number; reportCount: number; flagged: number }>>({});
  const [flagCache, setFlagCache] = useState<Record<string, 'green' | 'yellow' | 'red'>>({});

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      const allCards = await getReportCards();
      const newStats: Record<string, { studentCount: number; reportCount: number; flagged: number }> = {};
      const newFlags: Record<string, 'green' | 'yellow' | 'red'> = {};
      for (const cls of classes) {
        const students = studentsByClass[cls.id] || [];
        const clsCards = allCards.filter(r => r.classId === cls.id);
        let flagged = 0;
        for (const s of students) {
          const cards = clsCards.filter(r => r.studentId === s.id);
          if (cards.length === 0) { newFlags[s.id] = 'green'; continue; }
          const latest = cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          const grades = await getSubjectGrades(latest.id);
          if (grades.some(g => g.flag === 'red' || g.flag === 'yellow')) flagged++;
          if (grades.some(g => g.flag === 'red')) newFlags[s.id] = 'red';
          else if (grades.some(g => g.flag === 'yellow')) newFlags[s.id] = 'yellow';
          else newFlags[s.id] = 'green';
        }
        newStats[cls.id] = { studentCount: students.length, reportCount: clsCards.length, flagged };
      }
      setStatsCache(newStats);
      setFlagCache(newFlags);
    }
    if (classes.length > 0 && Object.keys(studentsByClass).length > 0) loadStats();
  }, [user, classes, studentsByClass]);

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <TransitionLink to="/teacher" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Dashboard
        </TransitionLink>
        <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-6">My Classes</h2>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls, i) => {
          const stats = statsCache[cls.id] || { studentCount: 0, reportCount: 0, flagged: 0 };
          const students = studentsByClass[cls.id] || [];
          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="bg-white rounded-2xl shadow-card p-6"
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display text-xl text-charcoal">Grade {cls.grade}</h3>
                {stats.studentCount > 0 && (() => {
                  const health = Math.round(((stats.studentCount - stats.flagged) / stats.studentCount) * 100);
                  const color = health >= 80 ? '#7A9B8A' : health >= 50 ? '#D4A03A' : '#E85D3E';
                  const r = 16;
                  const circumference = 2 * Math.PI * r;
                  const offset = circumference - (health / 100) * circumference;
                  return (
                    <div className="relative w-10 h-10 shrink-0" title={`${health}% healthy`}>
                      <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                        <circle cx="20" cy="20" r={r} fill="none" stroke="#E8E3DE" strokeWidth="3" />
                        <motion.circle
                          cx="20" cy="20" r={r}
                          fill="none" stroke={color} strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset: offset }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-body font-bold" style={{ color }}>{health}%</span>
                    </div>
                  );
                })()}
              </div>
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
                  const flag = flagCache[s.id] || 'green';
                  return (
                    <div key={s.id} className="flex items-center justify-between py-1.5">
                      <span className="font-body text-sm text-charcoal">{s.fullName}</span>
                      <FlagBadge flag={flag} size="sm" />
                    </div>
                  );
                })}
                {students.length > 3 && <p className="font-body text-xs text-medium-gray">+{students.length - 3} more students</p>}
              </div>

              <button
                onClick={() => navigate('/teacher/patterns', { state: { classId: cls.id } })}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-light-gray font-body text-xs font-medium text-medium-gray hover:border-coral/40 hover:text-coral hover:bg-coral/[0.03] transition-all"
              >
                <TrendingUp size={13} /> View Patterns
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
