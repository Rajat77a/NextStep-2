import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, MessageCircle, HelpCircle, Calendar, TrendingUp, ArrowRight, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getStudents, getReportCards, getClarityCheck, getPlanProgress } from '@/api/data';
import FlagBadge from '@/components/shared/FlagBadge';
import type { Student, ReportCard, ClarityCheck, SubjectGrade } from '@/types';
import { storage } from '@/api/storage';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [latestCheck, setLatestCheck] = useState<ClarityCheck | null>(null);
  const [latestGrades, setLatestGrades] = useState<SubjectGrade[]>([]);
  const [progress, setProgress] = useState<{ completionRate: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const kids = await getStudents({ parentId: user.id });
      setChildren(kids);
      if (kids.length > 0) {
        const cards = await getReportCards({ studentId: kids[0].id });
        setReportCards(cards);
        if (cards.length > 0) {
          const check = await getClarityCheck(cards[0].id);
          setLatestCheck(check);
          const grades = storage.getSubjectGrades().filter(g => g.reportCardId === cards[0].id);
          setLatestGrades(grades);
          if (check) {
            const prog = await getPlanProgress(check.id);
            if (prog) setProgress({ completionRate: prog.completionRate });
          }
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const latestCard = reportCards[0];
  const latestFlagCounts = {
    green: latestGrades.filter((grade) => grade.flag === 'green').length,
    yellow: latestGrades.filter((grade) => grade.flag === 'yellow').length,
    red: latestGrades.filter((grade) => grade.flag === 'red').length,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-12 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-light-gray rounded w-1/3" />
          <div className="h-24 bg-light-gray rounded-xl" />
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-light-gray rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-12 py-6 md:py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-1">
          {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {user?.fullName.split(' ')[0]}
        </h2>
        <p className="font-body text-medium-gray mb-6">
          {children.length > 0 ? `Here's how ${children[0].fullName.split(' ')[0]} is doing this term` : 'Add your child to get started'}
        </p>
      </motion.div>

      {/* Summary Bar */}
      {latestCard && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-white rounded-2xl shadow-card p-5 md:p-6 mb-6 border-t-[3px] border-coral">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="label-text text-medium-gray mb-1">Latest Report</p>
              <p className="font-body font-medium text-charcoal">{latestCard.term}</p>
              <p className="font-body text-xs text-medium-gray">{new Date(latestCard.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="label-text text-medium-gray mb-1">Overall Status</p>
              <FlagBadge flag={latestCheck?.overallStatus || 'green'} />
            </div>
            <div>
              <p className="label-text text-medium-gray mb-1">Flag Distribution</p>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-sage/10 text-sage rounded-full font-body text-[10px] font-semibold">{latestFlagCounts.green} green</span>
                <span className="px-2 py-0.5 bg-amber/10 text-amber rounded-full font-body text-[10px] font-semibold">{latestFlagCounts.yellow} yellow</span>
                <span className="px-2 py-0.5 bg-coral/10 text-coral rounded-full font-body text-[10px] font-semibold">{latestFlagCounts.red} red</span>
              </div>
            </div>
            <div>
              <p className="label-text text-medium-gray mb-1">Plan Progress</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-light-gray rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress?.completionRate || 0}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-coral rounded-full" />
                </div>
                <span className="font-body text-xs text-medium-gray">{progress?.completionRate || 0}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Report Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-charcoal">Report Cards</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-coral/10 text-coral rounded-full font-body text-xs font-semibold">All</span>
              </div>
            </div>
            {reportCards.length === 0 ? (
              <div className="text-center py-10">
                <FileText size={40} className="mx-auto text-light-gray mb-3" />
                <p className="font-body text-medium-gray">No report cards yet</p>
                <Link to="/parent/upload" className="inline-flex items-center gap-1 text-coral font-body text-sm font-semibold mt-2 hover:underline">
                  Upload your first <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {reportCards.slice(0, 3).map(card => {
                  const grades = storage.getSubjectGrades().filter(g => g.reportCardId === card.id);
                  const fc = { green: grades.filter(g => g.flag === 'green').length, yellow: grades.filter(g => g.flag === 'yellow').length, red: grades.filter(g => g.flag === 'red').length };
                  return (
                    <Link key={card.id} to="/parent/clarity" state={{ reportCardId: card.id }} className="block p-4 rounded-xl border border-light-gray hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-body font-medium text-charcoal">{card.term}</span>
                        <span className="font-body text-xs text-medium-gray">{new Date(card.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        {fc.green > 0 && <span className="px-2 py-0.5 bg-sage/10 text-sage rounded-full font-body text-[10px] font-semibold">{fc.green} On Track</span>}
                        {fc.yellow > 0 && <span className="px-2 py-0.5 bg-amber/10 text-amber rounded-full font-body text-[10px] font-semibold">{fc.yellow} Watch</span>}
                        {fc.red > 0 && <span className="px-2 py-0.5 bg-coral/10 text-coral rounded-full font-body text-[10px] font-semibold">{fc.red} Address</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-display text-xl text-charcoal mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: <Upload size={18} />, label: 'Upload Report Card', desc: 'Add a new report card', to: '/parent/upload' },
                { icon: <MessageCircle size={18} />, label: "Tonight's Conversation", desc: 'How to talk with your child', to: '/parent/conversation' },
                { icon: <HelpCircle size={18} />, label: 'Questions for Teacher', desc: 'Specific questions to ask', to: '/parent/questions' },
                { icon: <Calendar size={18} />, label: '30-Day Home Plan', desc: 'Personalized action plan', to: '/parent/plan' },
              ].map(action => (
                <Link key={action.to} to={action.to} className="flex items-center gap-3 p-4 rounded-xl border border-light-gray hover:border-coral/30 hover:bg-coral/[0.02] transition-all group">
                  <span className="text-coral">{action.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-charcoal text-sm">{action.label}</p>
                    <p className="font-body text-xs text-medium-gray">{action.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-medium-gray group-hover:text-coral transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Clarity Check Preview */}
          {latestCheck && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl shadow-card p-6 border-t-[3px] border-coral">
              <h3 className="font-display text-xl text-charcoal mb-4">Latest Clarity Check</h3>
              <div className="space-y-3">
                {latestGrades.slice(0, 3).map(g => (
                  <div key={g.id} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-sm text-charcoal">{g.subjectName}</p>
                      <p className="font-body text-xs text-medium-gray truncate">{g.aiNote?.slice(0, 60)}...</p>
                    </div>
                    <FlagBadge flag={g.flag} size="sm" />
                  </div>
                ))}
              </div>
              <Link to="/parent/clarity" className="inline-flex items-center gap-1 text-coral font-body text-sm font-semibold mt-4 hover:underline">
                View Full Analysis <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}

          {/* Progress Mini */}
          {progress && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-coral" />
                <h3 className="font-display text-xl text-charcoal">Plan Progress</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-body text-medium-gray">Completion</span>
                  <span className="font-body font-semibold text-charcoal">{progress.completionRate}%</span>
                </div>
                <div className="h-3 bg-light-gray rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress.completionRate}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-gradient-to-r from-coral to-coral-dark rounded-full" />
                </div>
              </div>
              <Link to="/parent/plan" className="inline-flex items-center gap-1 text-coral font-body text-sm font-semibold mt-4 hover:underline">
                Continue Plan <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}

          {/* Privacy Note */}
          <div className="bg-card-surface-alt rounded-2xl p-5">
            <p className="font-body text-xs text-medium-gray leading-relaxed">
              <span className="font-semibold text-charcoal">Privacy note:</span> Your child's data is private. No teacher or school admin can see your Clarity Check, conversation guides, or 30-day plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
