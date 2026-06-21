import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Info, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getReportCards, getClarityCheck, getPlanProgress, updateActionItem } from '@/api/data';
import FlagBadge from '@/components/shared/FlagBadge';
import type { ClarityCheck as IClarityCheck, PlanProgress as IPlanProgress } from '@/types';

export default function DayPlan() {
  const { user } = useAuth();
  const [check, setCheck] = useState<IClarityCheck | null>(null);
  const [progress, setProgress] = useState<IPlanProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const cards = await getReportCards();
      if (cards.length > 0) {
        const c = await getClarityCheck(cards[0].id);
        setCheck(c);
        if (c) {
          const p = await getPlanProgress(c.id);
          setProgress(p);
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const toggleAction = async (itemIndex: number) => {
    if (!progress) return;
    const item = progress.actionItems[itemIndex];
    const updated = await updateActionItem(progress.id, itemIndex, !item.completed);
    setProgress(updated);
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-5 md:px-12 py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-light-gray rounded w-1/3" /><div className="h-48 bg-light-gray rounded-xl" /></div></div>;
  }

  if (!check) {
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-12 py-8 text-center">
        <h2 className="font-display text-2xl text-charcoal mb-4">No Plan Available</h2>
        <p className="font-body text-medium-gray mb-6">Upload a report card first to generate a 30-day plan.</p>
        <Link to="/parent/upload" className="btn-text px-6 py-3 rounded-[10px] bg-coral text-white inline-flex items-center gap-2 hover:bg-coral-dark transition-all">Upload Report Card</Link>
      </div>
    );
  }

  const plan = check.thirtyDayPlan;
  const focusAreas = check.teacherQuestions.map((q, index) =>
    typeof q === 'string' ? `Focus ${index + 1}` : q.subject
  );
  const isComplete = progress ? progress.completionRate === 100 : false;

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-12 py-6 md:py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/parent/clarity" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Clarity Check
        </Link>
        <h2 className="font-display text-2xl md:text-4xl text-charcoal">30-Day Home Plan</h2>
        <p className="font-body text-medium-gray mt-1">Small, concrete habits tailored to the report card</p>
      </motion.div>

      {/* Progress Bar - Sticky */}
      {progress && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="sticky top-20 z-30 bg-cream/95 backdrop-blur-md rounded-xl border border-light-gray p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-sm font-medium text-charcoal">My Progress</span>
            <span className="font-body text-sm text-medium-gray">{progress.completionRate}% complete</span>
          </div>
          <div className="h-3 bg-light-gray rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.completionRate}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className={`h-full rounded-full ${isComplete ? 'bg-sage' : 'bg-gradient-to-r from-coral to-coral-dark'}`}
            />
          </div>
        </motion.div>
      )}

      {/* Plan Overview */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl shadow-card p-6 mb-6 border-t-[3px] border-coral">
        <h3 className="font-display text-lg text-charcoal mb-3">Focus Areas</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {focusAreas.map(f => <FlagBadge key={f} flag="yellow" showLabel={false} size="sm" />)}
        </div>
        <p className="font-body text-sm text-medium-gray">Based on {check.teacherQuestions.length} AI-generated follow-up questions from the latest report card</p>
      </motion.div>

      {/* Completion Celebration */}
      {isComplete && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-sage/[0.1] border border-sage/30 rounded-2xl p-8 text-center mb-6">
          <Trophy size={40} className="text-sage mx-auto mb-3" />
          <h3 className="font-display text-2xl text-charcoal mb-2">You've completed the 30-day plan!</h3>
          <p className="font-body text-charcoal/70">Great work supporting your child. Consistency is the key to lasting improvement.</p>
        </motion.div>
      )}

      {/* Weekly Breakdown */}
      <div className="space-y-6">
        {plan.map((week, wi) => {
          const weekNumber = week.week ?? week.weekNumber ?? wi + 1;
          const actions = week.actions || [{ text: week.habit || '', timeEstimate: 'This week', whyItHelps: 'Small repeated habits are easier to sustain.' }];
          return (
          <motion.div
            key={weekNumber}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + wi * 0.15 }}
            className="bg-white rounded-2xl shadow-card p-6"
          >
            <div className="mb-4">
              <h4 className="font-display text-xl text-charcoal">{week.weekTitle || `Week ${weekNumber}`}</h4>
              <p className="font-body text-sm text-medium-gray">Week {weekNumber}</p>
            </div>
            <div className="space-y-3">
              {actions.map((action, ai) => {
                const globalIndex = plan.slice(0, wi).reduce((acc, w) => acc + (w.actions?.length || 1), 0) + ai;
                const isDone = progress?.actionItems[globalIndex]?.completed || false;
                return (
                  <div
                    key={ai}
                    onClick={() => toggleAction(globalIndex)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-cream/50 transition-colors cursor-pointer group"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${isDone ? 'bg-sage border-sage' : 'border-light-gray group-hover:border-coral'}`}>
                      {isDone && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-body text-sm ${isDone ? 'text-charcoal/50 line-through' : 'text-charcoal'}`}>{action.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-body text-[10px] text-medium-gray">{action.timeEstimate}</span>
                        <span className="relative group/tooltip">
                          <Info size={12} className="text-medium-gray hover:text-coral cursor-help" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-charcoal text-white text-xs font-body p-2 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
                            {action.whyItHelps}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )})}
      </div>
    </div>
  );
}
