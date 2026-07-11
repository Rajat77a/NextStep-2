import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TransitionLink from '@/components/shared/TransitionLink';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Check, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getReportCards } from '@/api/data';
import FlagBadge from '@/components/shared/FlagBadge';
import type { ReportCard, AIReportSubject } from '@/types';

const flagRank = { green: 3, yellow: 2, red: 1 } as const;

export default function ProgressTracking() {
  const { user } = useAuth();
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [gradesByCard, setGradesByCard] = useState<Record<string, AIReportSubject[]>>({});
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const cards = await getReportCards();
      setReportCards(cards.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      const allGrades: Record<string, AIReportSubject[]> = {};
      const subjectSet = new Set<string>();
      for (const card of cards) {
        const g = card.ai_response?.subjects || [];
        allGrades[card.id] = g;
        g.forEach(sg => subjectSet.add(sg.subject));
      }
      setGradesByCard(allGrades);
      setSubjects([...subjectSet]);
    }
    load();
  }, [user]);

  if (reportCards.length < 2 || subjects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-12 py-8">
        <TransitionLink to="/parent" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Dashboard
        </TransitionLink>
        <div className="text-center py-12">
          <TrendingUp size={40} className="mx-auto text-light-gray mb-4" />
          <h2 className="font-display text-2xl text-charcoal mb-2">Not Enough Data Yet</h2>
          <p className="font-body text-medium-gray">Upload next term's report card to see what's changed.</p>
        </div>
      </div>
    );
  }

  const latestCard = reportCards[reportCards.length - 1];
  const prevCard = reportCards[reportCards.length - 2];
  const latestGrades = gradesByCard[latestCard.id] || [];
  const prevGrades = gradesByCard[prevCard.id] || [];

  const improvements: string[] = [];
  const watchAreas: string[] = [];

  subjects.forEach(subject => {
    const lg = latestGrades.find(g => g.subject === subject);
    const pg = prevGrades.find(g => g.subject === subject);
    if (lg && pg) {
      if (flagRank[lg.flag] > flagRank[pg.flag]) improvements.push(`${subject} improved from ${pg.flag} to ${lg.flag}`);
      else if (flagRank[lg.flag] < flagRank[pg.flag]) watchAreas.push(`${subject} moved from ${pg.flag} to ${lg.flag}`);
    }
  });

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <TransitionLink to="/parent" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Dashboard
        </TransitionLink>
        <h2 className="font-display text-2xl md:text-4xl text-charcoal">Progress Over Time</h2>
        <p className="font-body text-medium-gray mt-1 mb-6">See how your child is trending across terms</p>
      </motion.div>

      {/* Subject-by-Subject Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {subjects.map((subject, i) => {
          const lg = latestGrades.find(g => g.subject === subject);
          const pg = prevGrades.find(g => g.subject === subject);
          const trend = lg && pg ? (flagRank[lg.flag] > flagRank[pg.flag] ? 'up' : flagRank[lg.flag] < flagRank[pg.flag] ? 'down' : 'flat') : 'flat';
          return (
            <motion.div
              key={subject}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-white rounded-2xl shadow-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-display text-lg text-charcoal">{subject}</h4>
                {lg && <FlagBadge flag={lg.flag} size="sm" />}
              </div>
              <div className="flex items-center gap-3 mb-3">
                {pg && <span className="px-3 py-1 bg-light-gray rounded-full font-body text-sm font-medium text-charcoal">{pg.flag}</span>}
                {trend === 'up' ? <TrendingUp size={18} className="text-sage" /> : trend === 'down' ? <TrendingDown size={18} className="text-coral" /> : <Minus size={18} className="text-medium-gray" />}
                {lg && <span className={`px-3 py-1 rounded-full font-body text-sm font-medium ${lg.flag === 'green' ? 'bg-sage/10 text-sage' : lg.flag === 'yellow' ? 'bg-amber/10 text-amber' : 'bg-coral/10 text-coral'}`}>{lg.flag}</span>}
              </div>
              {lg?.reasoning && <p className="font-body text-xs text-charcoal/60">{lg.reasoning.slice(0, 100)}...</p>}
            </motion.div>
          );
        })}
      </div>

      {/* Improvement Summary */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-card p-6 border-t-[3px] border-coral">
        <h3 className="font-display text-xl text-charcoal mb-4">What's Changed</h3>
        <div className="space-y-4">
          {improvements.length > 0 && (
            <div>
              <p className="label-text text-sage mb-2 flex items-center gap-2"><Check size={14} /> IMPROVED</p>
              <ul className="space-y-1.5">
                {improvements.map((imp, i) => <li key={i} className="font-body text-sm text-charcoal/80 flex items-start gap-2"><Check size={14} className="text-sage mt-0.5 flex-shrink-0" />{imp}</li>)}
              </ul>
            </div>
          )}
          {watchAreas.length > 0 && (
            <div>
              <p className="label-text text-amber mb-2 flex items-center gap-2"><Eye size={14} /> KEEP AN EYE ON</p>
              <ul className="space-y-1.5">
                {watchAreas.map((wa, i) => <li key={i} className="font-body text-sm text-charcoal/80 flex items-start gap-2"><Eye size={14} className="text-amber mt-0.5 flex-shrink-0" />{wa}</li>)}
              </ul>
            </div>
          )}
          {improvements.length === 0 && watchAreas.length === 0 && (
            <p className="font-body text-charcoal/60">No significant changes between terms. Consistency is good!</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
