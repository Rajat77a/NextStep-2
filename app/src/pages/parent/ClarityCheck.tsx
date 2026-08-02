import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Calendar,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import type { ClarityCheck, ReportCard, SubjectGrade } from '@/types';

type RouteState = {
  reportCardId?: string;
} | null;

type FlagStatus = 'green' | 'yellow' | 'red';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function getFlagStyles(flag: FlagStatus) {
  if (flag === 'red') return 'border-l-coral bg-coral/10 text-coral';
  if (flag === 'yellow') return 'border-l-amber bg-amber/10 text-amber';
  return 'border-l-sage bg-sage/10 text-sage';
}

function getFlagLabel(flag: FlagStatus) {
  if (flag === 'red') return 'Needs support';
  if (flag === 'yellow') return 'Watch';
  return 'On track';
}

export default function ClarityCheck() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<ReportCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<ReportCard | null>(null);
  const [grades, setGrades] = useState<SubjectGrade[]>([]);
  const [clarityCheck, setClarityCheck] = useState<ClarityCheck | null>(null);

  useEffect(() => {
    const routeState = location.state as RouteState;
    const stateCardId = routeState?.reportCardId;

    const storedCards = readStorage<ReportCard[]>('nsa_reportCards', []);
    const storedGrades = readStorage<SubjectGrade[]>('nsa_subjectGrades', []);
    const storedChecks = readStorage<ClarityCheck[]>('nsa_clarityChecks', []);

    const card = stateCardId
      ? storedCards.find((item) => item.id === stateCardId) || storedCards[0]
      : storedCards[0];

    setCards(storedCards);
    setSelectedCard(card || null);

    if (card) {
      setGrades(storedGrades.filter((grade) => grade.reportCardId === card.id));
      setClarityCheck(storedChecks.find((check) => check.reportCardId === card.id) || null);
    } else {
      setGrades([]);
      setClarityCheck(null);
    }

    setLoading(false);
  }, [location.state]);

  const handleCardChange = (cardId: string) => {
    const storedGrades = readStorage<SubjectGrade[]>('nsa_subjectGrades', []);
    const storedChecks = readStorage<ClarityCheck[]>('nsa_clarityChecks', []);
    const card = cards.find((item) => item.id === cardId) || null;

    setSelectedCard(card);

    if (card) {
      setGrades(storedGrades.filter((grade) => grade.reportCardId === card.id));
      setClarityCheck(storedChecks.find((check) => check.reportCardId === card.id) || null);
    } else {
      setGrades([]);
      setClarityCheck(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-12 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-light-gray rounded w-1/4" />
          <div className="h-16 bg-light-gray rounded-xl" />
          <div className="h-32 bg-light-gray rounded-xl" />
        </div>
      </div>
    );
  }

  if (!selectedCard) {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-12 py-8 text-center">
        <h2 className="font-display text-2xl text-charcoal mb-4">No Report Cards Yet</h2>
        <p className="font-body text-medium-gray mb-6">
          Upload a report card to see your Clarity Check.
        </p>
        <Link
          to="/parent/upload"
          className="btn-text px-6 py-3 rounded-[10px] bg-coral text-white inline-flex items-center gap-2 hover:bg-coral-dark transition-all"
        >
          Upload Report Card <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <Link
        to="/parent"
        className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-4xl text-charcoal">Clarity Check</h2>
          <p className="font-body text-medium-gray mt-1">
            Here's what stands out and what you can do about it
          </p>
        </div>

        {cards.length > 1 && (
          <select
            value={selectedCard.id}
            onChange={(event) => handleCardChange(event.target.value)}
            className="px-4 py-2.5 rounded-[10px] border border-light-gray bg-white font-body text-sm text-charcoal focus:border-coral outline-none"
          >
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.term}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-amber/[0.08] border-l-[3px] border-amber rounded-r-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber flex-shrink-0 mt-0.5" />
        <p className="font-body text-xs text-charcoal/70 leading-relaxed">
          This analysis is designed to guide conversations, not replace professional advice. When in doubt, always check with your child's teacher. This is not a diagnosis.
        </p>
      </div>

      {grades.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <p className="font-body text-medium-gray">
            The report card was saved, but no subject grades were found. Please analyze the report again.
          </p>
          <Link
            to="/parent/upload"
            className="mt-4 btn-text px-5 py-3 rounded-[10px] bg-coral text-white inline-flex items-center gap-2 hover:bg-coral-dark transition-all"
          >
            Analyze Again <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {grades.map((grade, index) => {
            const flag = (grade.flag || 'green') as FlagStatus;

            return (
              <div
                key={grade.id || `${grade.subjectName}-${index}`}
                className={`bg-white rounded-2xl shadow-card p-5 border-l-4 ${getFlagStyles(flag).split(' ')[0]}`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="font-display text-lg text-charcoal">{grade.subjectName}</h4>
                  <span className={`px-3 py-1 rounded-full font-body text-xs font-semibold ${getFlagStyles(flag).replace('border-l-coral', '').replace('border-l-amber', '').replace('border-l-sage', '')}`}>
                    {getFlagLabel(flag)}
                  </span>
                </div>

                <p className="font-body text-sm text-charcoal/60 mb-3">
                  Grade: <span className="font-medium text-charcoal">{grade.grade}</span>
                </p>

                {grade.teacherComment && (
                  <div className="bg-cream rounded-lg p-3 mb-3">
                    <p className="font-body text-sm text-charcoal/70">{grade.teacherComment}</p>
                  </div>
                )}

                <p className="font-body text-sm text-charcoal leading-relaxed">
                  {grade.aiNote || 'No detailed AI note was saved for this subject.'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {clarityCheck && (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <h3 className="font-display text-xl text-charcoal mb-3">Overall Summary</h3>
          <p className="font-body text-charcoal/70 leading-relaxed">
            {clarityCheck.summaryText}
          </p>
        </div>
      )}

      <div className="bg-cream rounded-2xl p-8 text-center">
        <h4 className="font-display text-xl text-charcoal mb-2">Ready for the next step?</h4>
        <p className="font-body text-medium-gray mb-6">
          Continue with conversation help, teacher questions, and your 30-day plan.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/parent/conversation"
            className="btn-text px-5 py-3 rounded-[10px] bg-white text-charcoal border border-light-gray hover:border-coral hover:text-coral transition-all inline-flex items-center gap-2"
          >
            <MessageCircle size={16} /> Conversation Guide
          </Link>

          <Link
            to="/parent/questions"
            className="btn-text px-5 py-3 rounded-[10px] bg-white text-charcoal border border-light-gray hover:border-coral hover:text-coral transition-all inline-flex items-center gap-2"
          >
            <HelpCircle size={16} /> Teacher Questions
          </Link>

          <Link
            to="/parent/plan"
            className="btn-text px-5 py-3 rounded-[10px] bg-coral text-white hover:bg-coral-dark transition-all inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Calendar size={16} /> 30-Day Plan
          </Link>
        </div>
      </div>
    </div>
  );
}
