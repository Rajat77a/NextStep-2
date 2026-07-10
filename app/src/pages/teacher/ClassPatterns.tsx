import { useState, useEffect } from 'react';
import TransitionLink from '@/components/shared/TransitionLink';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getClasses, getStudents, getReportCards, getSubjectGrades } from '@/api/data';
import type { Class } from '@/types';

export default function ClassPatterns() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [patternData, setPatternData] = useState<{ subject: string; green: number; yellow: number; red: number }[]>([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const cls = await getClasses();
      setClasses(cls);
      if (cls.length > 0) {
        setSelectedClass(cls[0].id);
        analyzeClass(cls[0].id);
      }
    }
    load();
  }, [user]);

  const analyzeClass = async (classId: string) => {
    const students = await getStudents({ classId });
    const allCards = await getReportCards();
    const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies'];
    const data: { subject: string; green: number; yellow: number; red: number }[] = [];
    for (const subject of subjects) {
      let green = 0, yellow = 0, red = 0;
      for (const student of students) {
        const cards = allCards.filter(r => r.studentId === student.id);
        if (cards.length === 0) continue;
        const latest = cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        const grades = await getSubjectGrades(latest.id);
        const grade = grades.find(g => g.subjectName === subject);
        if (grade) {
          if (grade.flag === 'green') green++;
          else if (grade.flag === 'yellow') yellow++;
          else red++;
        }
      }
      data.push({ subject, green, yellow, red });
    }
    setPatternData(data);
  };

  const maxVal = Math.max(...patternData.flatMap(d => [d.green + d.yellow + d.red]), 1);

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <TransitionLink to="/teacher" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Dashboard
        </TransitionLink>
        <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-1">Class Patterns</h2>
        <p className="font-body text-medium-gray mb-6">Trends and insights across subjects</p>
      </motion.div>

      {/* Class Selector */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-3 mb-6">
        {classes.map(cls => (
          <button
            key={cls.id}
            onClick={() => { setSelectedClass(cls.id); analyzeClass(cls.id); }}
            className={`px-4 py-2 rounded-lg font-body text-sm font-medium transition-all ${selectedClass === cls.id ? 'bg-coral text-white' : 'bg-white text-charcoal border border-light-gray hover:border-coral'}`}
          >
            Grade {cls.grade}-{cls.section}
          </button>
        ))}
      </motion.div>

      {/* Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <h3 className="font-display text-lg text-charcoal mb-6">Subject Performance Overview</h3>
        <div className="space-y-4">
          {patternData.map((d, i) => {
            const total = d.green + d.yellow + d.red;
            return (
              <motion.div
                key={d.subject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-body text-sm font-medium text-charcoal">{d.subject}</span>
                  <span className="font-body text-xs text-medium-gray">{total} students</span>
                </div>
                <div className="h-8 bg-light-gray rounded-lg overflow-hidden flex">
                  {d.green > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.green / maxVal) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                      className="h-full bg-sage flex items-center justify-center"
                    >
                      {d.green > 1 && <span className="font-body text-[10px] text-white font-semibold">{d.green}</span>}
                    </motion.div>
                  )}
                  {d.yellow > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.yellow / maxVal) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.5 + i * 0.08 }}
                      className="h-full bg-amber flex items-center justify-center"
                    >
                      {d.yellow > 1 && <span className="font-body text-[10px] text-white font-semibold">{d.yellow}</span>}
                    </motion.div>
                  )}
                  {d.red > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.red / maxVal) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.6 + i * 0.08 }}
                      className="h-full bg-coral flex items-center justify-center"
                    >
                      {d.red > 1 && <span className="font-body text-[10px] text-white font-semibold">{d.red}</span>}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sage" /><span className="font-body text-xs text-medium-gray">On Track</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber" /><span className="font-body text-xs text-medium-gray">Watch</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-coral" /><span className="font-body text-xs text-medium-gray">Address</span></div>
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-coral" />
          <h3 className="font-display text-lg text-charcoal">AI Insights</h3>
        </div>
        {patternData.map(d => {
          const pct = Math.round((d.yellow + d.red) / Math.max(d.green + d.yellow + d.red, 1) * 100);
          if (pct > 30) {
            return (
              <div key={d.subject} className="mb-3 p-4 bg-cream rounded-xl">
                <p className="font-body text-sm text-charcoal">
                  <span className="font-semibold">{d.subject}:</span> {pct}% of students are flagged. This may indicate that the recent topics in this subject are particularly challenging. Consider reviewing the teaching approach or providing additional practice materials.
                </p>
              </div>
            );
          }
          return null;
        })}
      </motion.div>
    </div>
  );
}
