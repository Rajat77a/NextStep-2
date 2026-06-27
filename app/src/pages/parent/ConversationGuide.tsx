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
    const script = check.conversationScript;
    const openingLine = script.openingLine || script.opening || '';
    const avoidSaying = script.avoidSaying || [];
    const tryInstead = script.tryInstead || [
      ...(script.acknowledgeGood || []),
      ...(script.exploreChallenges || []),
      script.closeWithSupport || '',
    ].filter(Boolean);
    const text = [
      "Tonight's Conversation Script",
      '',
      'OPENING:',
      openingLine,
      '',
      'AVOID SAYING:',
      ...avoidSaying.map((s, i) => `${i + 1}. ${s}`),
      '',
      'TRY INSTEAD:',
      ...tryInstead.map((s, i) => `${i + 1}. ${s}`),
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
  const openingLine = script.openingLine || script.opening || '';
  const avoidSaying = script.avoidSaying || [];
  const tryInstead = script.tryInstead || [
    ...(script.acknowledgeGood || []),
    ...(script.exploreChallenges || []),
    script.closeWithSupport || '',
  ].filter(Boolean);

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

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card p-6 border-l-4 border-l-sage"
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart size={16} className="text-sage" />
            <span className="label-text text-sage">OPENING LINE</span>
          </div>
          <p className="font-display text-lg md:text-xl text-charcoal italic leading-relaxed">"{openingLine}"</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-card p-6 border-l-4 border-l-coral">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={16} className="text-coral" />
            <span className="label-text text-coral">AVOID SAYING</span>
          </div>
          <ul className="space-y-3">
            {avoidSaying.map((line, i) => <li key={i} className="font-body text-sm text-charcoal/75">"{line}"</li>)}
          </ul>
        </motion.div>

        {tryInstead.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl shadow-card p-6 border-l-4 border-l-sage"
          >
            <div className="flex items-center gap-2 mb-3">
              <Check size={16} className="text-sage" />
              <span className="label-text text-sage">TRY INSTEAD</span>
            </div>
            <p className="font-display text-lg md:text-xl text-charcoal italic leading-relaxed mb-3">
              "{line}"
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
