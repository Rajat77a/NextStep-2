import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getReportCards, getClarityCheck } from '@/api/data';
import type { ClarityCheck as IClarityCheck, TeacherQuestion } from '@/types';

function questionToText(question: string | TeacherQuestion): string {
  return typeof question === 'string' ? question : question.question;
}

function questionContext(question: string | TeacherQuestion): string | null {
  return typeof question === 'string' ? null : question.context;
}

export default function TeacherQuestions() {
  const { user } = useAuth();
  const [check, setCheck] = useState<IClarityCheck | null>(null);
  const [copied, setCopied] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [extraQuestions, setExtraQuestions] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const cards = await getReportCards();
      if (cards.length > 0) {
        const c = await getClarityCheck(cards[0].id);
        setCheck(c);
      }
    }
    load();
  }, [user]);

  const handleCopyAll = () => {
    if (!check) return;
    const text = [
      'Questions for the Teacher',
      '',
      ...check.teacherQuestions.map((q, i) => `${i + 1}. ${questionToText(q)}`),
      ...extraQuestions.map((q, i) => `${check.teacherQuestions.length + i + 1}. ${q}`),
    ].join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCustom = () => {
    if (customQuestion.trim()) {
      setExtraQuestions([...extraQuestions, customQuestion.trim()]);
      setCustomQuestion('');
      setShowCustom(false);
    }
  };

  if (!check) {
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-12 py-8 text-center">
        <h2 className="font-display text-2xl text-charcoal mb-4">No Questions Available</h2>
        <p className="font-body text-medium-gray mb-6">Upload a report card first to generate teacher questions.</p>
        <Link to="/parent/upload" className="btn-text px-6 py-3 rounded-[10px] bg-coral text-white inline-flex items-center gap-2 hover:bg-coral-dark transition-all">Upload Report Card</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/parent/clarity" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Clarity Check
        </Link>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-4xl text-charcoal">Questions for the Teacher</h2>
            <p className="font-body text-medium-gray mt-1">Specific questions based on the report card</p>
          </div>
          <button onClick={handleCopyAll} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-light-gray hover:border-coral hover:text-coral transition-all font-body text-sm">
            {copied ? <><Check size={14} className="text-sage" /> Copied!</> : <><Copy size={14} /> Copy all</>}
          </button>
        </div>
      </motion.div>

      <div className="space-y-4">
        {check.teacherQuestions.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="bg-white rounded-2xl shadow-card p-6"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="font-body text-xs font-semibold text-charcoal/60 uppercase tracking-wider">QUESTION {i + 1}</span>
              <button
                onClick={() => navigator.clipboard.writeText(questionToText(q))}
                className="flex items-center gap-1 text-coral font-body text-xs font-semibold hover:underline"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <h4 className="font-display text-lg text-charcoal mb-3">{questionToText(q)}</h4>
            {questionContext(q) && (
              <div className="bg-cream rounded-lg p-3">
                <p className="font-body text-xs text-charcoal/60">Based on: "{questionContext(q)}"</p>
              </div>
            )}
          </motion.div>
        ))}

        {extraQuestions.map((q, i) => (
          <motion.div
            key={`custom-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-card p-6 border border-sage/20"
          >
            <span className="label-text text-sage mb-2 block">YOUR QUESTION</span>
            <h4 className="font-display text-lg text-charcoal">{q}</h4>
          </motion.div>
        ))}
      </div>

      {/* Add Custom Question */}
      <div className="mt-6">
        {!showCustom ? (
          <button onClick={() => setShowCustom(true)} className="flex items-center gap-2 text-coral font-body text-sm font-semibold hover:underline">
            <Plus size={14} /> Add my own question
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-card p-5">
            <textarea
              value={customQuestion}
              onChange={e => setCustomQuestion(e.target.value)}
              placeholder="Type your question for the teacher..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-light-gray bg-cream font-body text-sm text-charcoal placeholder:text-medium-gray focus:border-coral outline-none resize-none mb-3"
            />
            <div className="flex gap-3">
              <button onClick={handleAddCustom} className="px-5 py-2 rounded-lg bg-coral text-white font-body text-sm font-semibold hover:bg-coral-dark transition-all">Add Question</button>
              <button onClick={() => setShowCustom(false)} className="px-5 py-2 rounded-lg border border-light-gray text-medium-gray font-body text-sm hover:text-charcoal transition-all">Cancel</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
