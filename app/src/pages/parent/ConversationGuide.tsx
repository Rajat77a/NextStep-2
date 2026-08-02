import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Copy,
  Heart,
  MessageCircle,
} from 'lucide-react';
import type { ClarityCheck, ReportCard } from '@/types';

type ScriptShape = {
  openingLine?: string;
  avoidSaying?: string[];
  tryInstead?: string[];
  opening?: string;
  acknowledgeGood?: string[];
  exploreChallenges?: string[];
  closeWithSupport?: string;
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function getLatestCheck() {
  const lastReportCardId = window.localStorage.getItem('nsa_lastReportCardId');
  const cards = readStorage<ReportCard[]>('nsa_reportCards', []);
  const checks = readStorage<ClarityCheck[]>('nsa_clarityChecks', []);

  const card = lastReportCardId
    ? cards.find((item) => item.id === lastReportCardId) || cards[0]
    : cards[0];

  if (!card) return null;

  return checks.find((item) => item.reportCardId === card.id) || null;
}

export default function ConversationGuide() {
  const [check, setCheck] = useState<ClarityCheck | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCheck(getLatestCheck());
  }, []);

  const script = (check?.conversationScript || {}) as ScriptShape;
  const openingLine =
    script.openingLine ||
    script.opening ||
    'I looked at your report card, and I want us to talk about it calmly together.';

  const avoidSaying = script.avoidSaying?.length
    ? script.avoidSaying
    : [
        'Why did you get this grade?',
        'You should have done better.',
        'This is not good enough.',
      ];

  const tryInstead = script.tryInstead?.length
    ? script.tryInstead
    : [
        ...(script.acknowledgeGood || []),
        ...(script.exploreChallenges || []),
        script.closeWithSupport || '',
      ].filter(Boolean);

  const finalTryInstead = tryInstead.length
    ? tryInstead
    : [
        'Which subject felt easiest for you this term?',
        'Which part felt difficult, and what kind of help would make it easier?',
        'Let us choose one small habit to try for the next two weeks.',
      ];

  const handleCopy = async () => {
    const text = [
      "Tonight's Conversation Script",
      '',
      'OPENING:',
      openingLine,
      '',
      'AVOID SAYING:',
      ...avoidSaying.map((line, index) => `${index + 1}. ${line}`),
      '',
      'TRY INSTEAD:',
      ...finalTryInstead.map((line, index) => `${index + 1}. ${line}`),
    ].join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (!check) {
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-12 py-8 text-center">
        <MessageCircle size={40} className="mx-auto text-light-gray mb-4" />
        <h2 className="font-display text-2xl text-charcoal mb-4">
          No Conversation Guide Yet
        </h2>
        <p className="font-body text-medium-gray mb-6">
          Upload and analyze a report card first to generate a conversation guide.
        </p>
        <Link
          to="/parent/upload"
          className="btn-text px-6 py-3 rounded-[10px] bg-coral text-white inline-flex items-center gap-2 hover:bg-coral-dark transition-all"
        >
          Upload Report Card
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <Link
        to="/parent/clarity"
        className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4"
      >
        <ArrowLeft size={14} /> Back to Clarity Check
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-4xl text-charcoal">
            Tonight's Conversation
          </h2>
          <p className="font-body text-medium-gray mt-1">
            A calmer way to talk about the report card
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-light-gray hover:border-coral hover:text-coral transition-all font-body text-sm"
        >
          {copied ? (
            <>
              <Check size={14} className="text-sage" /> Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy
            </>
          )}
        </button>
      </div>

      <div className="bg-sage/[0.08] rounded-xl p-4 mb-8 flex items-start gap-3">
        <Heart size={18} className="text-sage flex-shrink-0 mt-0.5" />
        <p className="font-body text-xs text-charcoal/70 leading-relaxed">
          The goal is connection, not interrogation. Use these prompts to understand what your child experienced and choose one small next step.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-card p-6 border-l-4 border-l-sage">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={16} className="text-sage" />
            <span className="label-text text-sage">Opening Line</span>
          </div>
          <p className="font-display text-lg md:text-xl text-charcoal italic leading-relaxed">
            "{openingLine}"
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 border-l-4 border-l-coral">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={16} className="text-coral" />
            <span className="label-text text-coral">Avoid Saying</span>
          </div>
          <ul className="space-y-3">
            {avoidSaying.map((line, index) => (
              <li key={index} className="font-body text-sm text-charcoal/75">
                "{line}"
              </li>
            ))}
          </ul>
        </div>

        {finalTryInstead.map((line, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-card p-6 border-l-4 border-l-sage"
          >
            <div className="flex items-center gap-2 mb-3">
              <Check size={16} className="text-sage" />
              <span className="label-text text-sage">Try Instead</span>
            </div>
            <p className="font-display text-lg md:text-xl text-charcoal italic leading-relaxed">
              "{line}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
