import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TransitionLink from '@/components/shared/TransitionLink';
import { ArrowLeft, AlertCircle, ChevronDown, ChevronUp, ArrowRight, MessageCircle, HelpCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getReportCards, getClarityCheck, getSubjectGrades } from '@/api/data';
import FlagBadge from '@/components/shared/FlagBadge';
import type { ReportCard, ClarityCheck as IClarityCheck, SubjectGrade } from '@/types';

export default function ClarityCheck() {
  const { user } = useAuth();
  const location = useLocation();
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<ReportCard | null>(null);
  const [clarityCheck, setClarityCheck] = useState<IClarityCheck | null>(null);
  const [grades, setGrades] = useState<SubjectGrade[]>([]);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const cards = await getReportCards();
      setReportCards(cards);
      const stateCardId = (location.state as any)?.reportCardId;
      const card = stateCardId ? cards.find(c => c.id === stateCardId) : cards[0];
      if (card) {
        setSelectedCard(card);
        const check = await getClarityCheck(card.id);
        setClarityCheck(check);
        const grades = await getSubjectGrades(card.id);
        setGrades(grades);
      }
      setLoading(false);
    }
    load();
  }, [user, location.state]);

  const handleCardChange = async (cardId: string) => {
    const card = reportCards.find(c => c.id === cardId);
    if (card) {
      setSelectedCard(card);
      setLoading(true);
      const check = await getClarityCheck(card.id);
      setClarityCheck(check);
      const grades = await getSubjectGrades(card.id);
      setGrades(grades);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-12 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-light-gray rounded w-1/4" />
          <div className="h-16 bg-light-gray rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-light-gray rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCard || grades.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-12 py-8 text-center">
        <h2 className="font-display text-2xl text-charcoal mb-4">No Report Cards Yet</h2>
        <p className="font-body text-medium-gray mb-6">Upload a report card to see your Clarity Check.</p>
        <TransitionLink to="/parent/upload" className="btn-text px-6 py-3 rounded-[10px] bg-coral text-white inline-flex items-center gap-2 hover:bg-coral-dark transition-all">Upload Report Card <ArrowRight size={14} /></TransitionLink>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-12 py-6 md:py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <TransitionLink to="/parent" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Dashboard
        </TransitionLink>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-4xl text-charcoal">Clarity Check</h2>
            <p className="font-body text-medium-gray mt-1">Here's what stands out — and what you can do about it</p>
          </div>
          {reportCards.length > 1 && (
            <select
              value={selectedCard.id}
              onChange={e => handleCardChange(e.target.value)}
              className="px-4 py-2.5 rounded-[10px] border border-light-gray bg-white font-body text-sm text-charcoal focus:border-coral outline-none"
            >
              {reportCards.map(c => <option key={c.id} value={c.id}>{c.term}</option>)}
            </select>
          )}
        </div>
      </motion.div>

      {/* Disclaimer Banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-amber/[0.08] border-l-[3px] border-amber rounded-r-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber flex-shrink-0 mt-0.5" />
        <p className="font-body text-xs text-charcoal/70 leading-relaxed">
          This analysis is designed to guide conversations, not replace professional advice. When in doubt, always check with your child's teacher. This is not a diagnosis.
        </p>
      </motion.div>

      {/* Subject Flags Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {grades.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`bg-white rounded-2xl shadow-card p-5 border-l-4 ${g.flag === 'green' ? 'border-l-sage' : g.flag === 'yellow' ? 'border-l-amber' : 'border-l-coral'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display text-lg text-charcoal">{g.subjectName}</h4>
              <FlagBadge flag={g.flag} />
            </div>
            <p className="font-body text-sm text-charcoal/60 mb-3">Grade: <span className="font-medium text-charcoal">{g.grade}</span></p>
            <p className="font-body text-sm text-charcoal leading-relaxed mb-3">{g.aiNote}</p>
            {g.flag !== 'green' && (
              <p className="font-body text-xs text-medium-gray italic mb-3">
                This is not a diagnosis — just something worth checking with the teacher about.
              </p>
            )}
            {g.teacherComment && (
              <div className="bg-cream rounded-lg p-3 mb-3">
                <p className="font-body text-xs text-charcoal/60">Teacher wrote: "{g.teacherComment}"</p>
              </div>
            )}
            <button
              onClick={() => setExpandedSubject(expandedSubject === g.id ? null : g.id)}
              className="flex items-center gap-1 text-coral font-body text-xs font-semibold hover:underline"
            >
              {expandedSubject === g.id ? <><ChevronUp size={12} /> Hide details</> : <><ChevronDown size={12} /> What this might mean</>}
            </button>
            <AnimatePresence>
              {expandedSubject === g.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <p className="font-body text-xs text-charcoal/70 mt-3 leading-relaxed">
                    {g.flag === 'green'
                      ? `The grade and teacher comments suggest your child is handling ${g.subjectName} well at this stage. Continue supporting their current study habits.`
                      : g.flag === 'yellow'
                      ? `This grade may indicate that your child is facing some challenges in ${g.subjectName}. It's worth having a gentle conversation about what they find difficult, and checking in with the teacher for specific areas to focus on.`
                      : `This grade suggests your child may need additional support in ${g.subjectName}. Consider speaking with the teacher about remedial resources or tutoring options. At home, try to create a calm, focused study environment for this subject.`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      {clarityCheck && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <h3 className="font-display text-xl text-charcoal mb-3">Overall Summary</h3>
          <p className="font-body text-charcoal/70 leading-relaxed">{clarityCheck.summaryText}</p>
        </motion.div>
      )}

      {/* Bottom CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-cream rounded-2xl p-8 text-center">
        <h4 className="font-display text-xl text-charcoal mb-2">Ready for the next step?</h4>
        <p className="font-body text-medium-gray mb-6">We have a personalized plan ready for you.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <TransitionLink to="/parent/conversation" className="btn-text px-5 py-3 rounded-[10px] bg-white text-charcoal border border-light-gray hover:border-coral hover:text-coral transition-all inline-flex items-center gap-2">
            <MessageCircle size={16} /> Conversation Guide
          </TransitionLink>
          <TransitionLink to="/parent/questions" className="btn-text px-5 py-3 rounded-[10px] bg-white text-charcoal border border-light-gray hover:border-coral hover:text-coral transition-all inline-flex items-center gap-2">
            <HelpCircle size={16} /> Teacher Questions
          </TransitionLink>
          <TransitionLink to="/parent/plan" className="btn-text px-5 py-3 rounded-[10px] bg-coral text-white hover:bg-coral-dark transition-all inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
            <Calendar size={16} /> 30-Day Plan
          </TransitionLink>
        </div>
      </motion.div>
    </div>
  );
}

