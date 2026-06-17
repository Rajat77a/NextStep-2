import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Check, Copy, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getReportCards, getClarityCheck } from '@/api/data';
import type { ClarityCheck as IClarityCheck } from '@/types';

export default function ConversationGuide() {
  const { user } = useAuth();
  const [check, setCheck] = useState<IClarityCheck | null>(null);
  const [copied, setCopied] = useState(false);
  const [childName] = useState('your child');

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

  const handleCopy = () => {
    if (!check) return;
    const text = [
      "Tonight's Conversation Script",
      '',
      'OPENING:',
      check.conversationScript.opening,
      '',
      ...check.conversationScript.acknowledgeGood.map((s, i) => `ACKNOWLEDGE ${i + 1}:\n${s}`),
      ...(check.conversationScript.exploreChallenges || []).map((s, i) => `EXPLORE ${i + 1}:\n${s}`),
      '',
      'CLOSE:',
      check.conversationScript.closeWithSupport,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!check) {
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-12 py-8 text-center">
        <h2 className="font-display text-2xl text-charcoal mb-4">No Conversation Available</h2>
        <p className="font-body text-medium-gray mb-6">Upload a report card first to generate a conversation guide.</p>
        <Link to="/parent/upload" className="btn-text px-6 py-3 rounded-[10px] bg-coral text-white inline-flex items-center gap-2 hover:bg-coral-dark transition-all">Upload Report Card</Link>
      </div>
    );
  }

  const script = check.conversationScript;
  const beats = [
    { label: 'START HERE', color: 'sage', border: 'border-l-sage', bg: 'bg-sage/[0.08]', icon: <Heart size={16} className="text-sage" />, text: script.opening, tip: 'Start with curiosity, not evaluation.' },
    ...script.acknowledgeGood.map((s, i) => ({ label: 'ACKNOWLEDGE', color: 'sage', border: 'border-l-sage', bg: 'bg-sage/[0.04]', icon: <Check size={16} className="text-sage" />, text: s, tip: i === 0 ? 'Recognize effort before addressing challenges.' : undefined })),
    ...(script.exploreChallenges || []).map((s, i) => ({ label: 'EXPLORE GENTLY', color: 'amber', border: 'border-l-amber', bg: 'bg-amber/[0.04]', icon: <MessageCircle size={16} className="text-amber" />, text: s, tip: i === 0 ? 'Use open-ended questions. Avoid "why did you..."' : undefined })),
    { label: 'CLOSE', color: 'sage', border: 'border-l-sage', bg: 'bg-sage/[0.08]', icon: <Heart size={16} className="text-sage" />, text: script.closeWithSupport, tip: 'End with love and a plan.' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-12 py-6 md:py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/parent/clarity" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Clarity Check
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl md:text-4xl text-charcoal">Tonight's Conversation</h2>
            <p className="font-body text-medium-gray mt-1">How to talk with {childName} about the report card</p>
          </div>
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-light-gray hover:border-coral hover:text-coral transition-all font-body text-sm">
            {copied ? <><Check size={14} className="text-sage" /> Copied!</> : <><Copy size={14} /> Copy script</>}
          </button>
        </div>
      </motion.div>

      {/* Tone Banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-sage/[0.08] rounded-xl p-4 mb-8 flex items-start gap-3">
        <Heart size={18} className="text-sage flex-shrink-0 mt-0.5" />
        <p className="font-body text-xs text-charcoal/70 leading-relaxed">
          Remember: the goal is connection, not interrogation. These prompts are designed to open a conversation, not deliver a verdict.
        </p>
      </motion.div>

      {/* Conversation Beats */}
      <div className="space-y-4">
        {beats.map((beat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`bg-white rounded-2xl shadow-card p-6 border-l-4 ${beat.border}`}
          >
            <div className="flex items-center gap-2 mb-3">
              {beat.icon}
              <span className={`label-text text-${beat.color}`}>{beat.label}</span>
            </div>
            <p className="font-display text-lg md:text-xl text-charcoal italic leading-relaxed mb-3">
              "{beat.text}"
            </p>
            {beat.tip && (
              <p className="font-body text-xs text-medium-gray">{beat.tip}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
