import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { AIReportSubject, ReportCard } from '@/types';

const flagRank = { green: 3, yellow: 2, red: 1 } as const;

type FlagStatus = keyof typeof flagRank;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function inferFlagFromGrade(gradeValue: string, textValue: string): FlagStatus {
  const grade = gradeValue.trim().toUpperCase();
  const text = textValue.toLowerCase();

  if (
    grade === 'D' ||
    grade === 'E' ||
    grade === 'F' ||
    grade === 'C2' ||
    text.includes('significant') ||
    text.includes('continues to struggle') ||
    text.includes('incomplete') ||
    text.includes('irregular') ||
    text.includes('decline') ||
    text.includes('needs close support')
  ) {
    return 'red';
  }

  if (
    grade === 'C1' ||
    grade === 'C' ||
    grade === 'B2' ||
    text.includes('needs more') ||
    text.includes('needs improvement') ||
    text.includes('weak') ||
    text.includes('difficult') ||
    text.includes('limited preparation')
  ) {
    return 'yellow';
  }

  return 'green';
}

function strongerConcernFlag(explicitFlag: FlagStatus, inferredFlag: FlagStatus): FlagStatus {
  return flagRank[inferredFlag] < flagRank[explicitFlag] ? inferredFlag : explicitFlag;
}

function normalizeSubject(subject: any): AIReportSubject | null {
  const name = subject?.subject || subject?.subjectName;
  if (!name) return null;

  const explicitFlag: FlagStatus = ['green', 'yellow', 'red'].includes(subject?.flag)
    ? subject.flag
    : 'green';

  const grade = subject?.grade || '';
  const reasoning = subject?.reasoning || subject?.aiNote || subject?.teacherComment || '';
  const inferredFlag = inferFlagFromGrade(grade, reasoning);
  const flag = strongerConcernFlag(explicitFlag, inferredFlag);

  return {
    subject: name,
    grade,
    flag,
    reasoning,
  };
}

function flagClasses(flag: FlagStatus) {
  if (flag === 'red') return 'bg-coral/10 text-coral';
  if (flag === 'yellow') return 'bg-amber/10 text-amber';
  return 'bg-sage/10 text-sage';
}

function flagLabel(flag: FlagStatus) {
  if (flag === 'red') return 'Needs support';
  if (flag === 'yellow') return 'Watch';
  return 'On track';
}

export default function ProgressTracking() {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [gradesByCard, setGradesByCard] = useState<Record<string, AIReportSubject[]>>({});

  useEffect(() => {
    const cards = readStorage<ReportCard[]>('nsa_reportCards', [])
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const storedSubjectGrades = readStorage<any[]>('nsa_subjectGrades', []);
    const grouped: Record<string, AIReportSubject[]> = {};

    for (const card of cards) {
      const fromAi = (card.ai_response?.subjects || [])
        .map(normalizeSubject)
        .filter(Boolean) as AIReportSubject[];

      const fromLegacy = storedSubjectGrades
        .filter((grade) => grade.reportCardId === card.id)
        .map(normalizeSubject)
        .filter(Boolean) as AIReportSubject[];

      grouped[card.id] = fromAi.length > 0 ? fromAi : fromLegacy;
    }

    setReportCards(cards);
    setGradesByCard(grouped);
  }, []);

  const subjects = useMemo(() => {
    const subjectSet = new Set<string>();

    Object.values(gradesByCard).forEach((grades) => {
      grades.forEach((grade) => subjectSet.add(grade.subject));
    });

    return Array.from(subjectSet);
  }, [gradesByCard]);

  if (reportCards.length === 0 || subjects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-12 py-8">
        <Link
          to="/parent"
          className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="text-center py-12">
          <TrendingUp size={40} className="mx-auto text-light-gray mb-4" />
          <h2 className="font-display text-2xl text-charcoal mb-2">
            No Progress Data Yet
          </h2>
          <p className="font-body text-medium-gray mb-6">
            Upload and analyze a report card first to start tracking progress.
          </p>
          <Link
            to="/parent/upload"
            className="btn-text px-6 py-3 rounded-[10px] bg-coral text-white inline-flex items-center gap-2 hover:bg-coral-dark transition-all"
          >
            Upload Report Card <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  if (reportCards.length < 2) {
    const latestCard = reportCards[reportCards.length - 1];
    const latestGrades = gradesByCard[latestCard.id] || [];

    return (
      <div className="max-w-4xl mx-auto px-5 md:px-12 py-6 md:py-8">
        <Link
          to="/parent"
          className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <h2 className="font-display text-2xl md:text-4xl text-charcoal">
          Progress Over Time
        </h2>
        <p className="font-body text-medium-gray mt-1 mb-6">
          Upload another term later to compare changes.
        </p>

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6 border-t-[3px] border-coral">
          <h3 className="font-display text-xl text-charcoal mb-2">
            Current Baseline
          </h3>
          <p className="font-body text-medium-gray">
            This report is saved as your first progress point.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {latestGrades.map((grade, index) => (
            <div key={`${grade.subject}-${index}`} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h4 className="font-display text-lg text-charcoal">{grade.subject}</h4>
                <span className={`px-3 py-1 rounded-full font-body text-xs font-semibold ${flagClasses(grade.flag as FlagStatus)}`}>
                  {flagLabel(grade.flag as FlagStatus)}
                </span>
              </div>
              <p className="font-body text-sm text-charcoal/60 mb-2">
                Grade: <span className="font-medium text-charcoal">{grade.grade}</span>
              </p>
              {grade.reasoning && (
                <p className="font-body text-xs text-charcoal/60">
                  {grade.reasoning}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const latestCard = reportCards[reportCards.length - 1];
  const previousCard = reportCards[reportCards.length - 2];
  const latestGrades = gradesByCard[latestCard.id] || [];
  const previousGrades = gradesByCard[previousCard.id] || [];

  const improvements: string[] = [];
  const watchAreas: string[] = [];

  subjects.forEach((subject) => {
    const latest = latestGrades.find((grade) => grade.subject === subject);
    const previous = previousGrades.find((grade) => grade.subject === subject);

    if (!latest || !previous) return;

    const latestFlag = latest.flag as FlagStatus;
    const previousFlag = previous.flag as FlagStatus;

    if (flagRank[latestFlag] > flagRank[previousFlag]) {
      improvements.push(`${subject} improved from ${flagLabel(previousFlag)} to ${flagLabel(latestFlag)}.`);
    } else if (flagRank[latestFlag] < flagRank[previousFlag]) {
      watchAreas.push(`${subject} moved from ${flagLabel(previousFlag)} to ${flagLabel(latestFlag)}.`);
    }
  });

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <Link
        to="/parent"
        className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <h2 className="font-display text-2xl md:text-4xl text-charcoal">
        Progress Over Time
      </h2>
      <p className="font-body text-medium-gray mt-1 mb-6">
        Comparing {previousCard.term} with {latestCard.term}
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {subjects.map((subject, index) => {
          const latest = latestGrades.find((grade) => grade.subject === subject);
          const previous = previousGrades.find((grade) => grade.subject === subject);
          const latestFlag = (latest?.flag || 'green') as FlagStatus;
          const previousFlag = (previous?.flag || 'green') as FlagStatus;
          const trend =
            flagRank[latestFlag] > flagRank[previousFlag]
              ? 'up'
              : flagRank[latestFlag] < flagRank[previousFlag]
                ? 'down'
                : 'flat';

          return (
            <div key={`${subject}-${index}`} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h4 className="font-display text-lg text-charcoal">{subject}</h4>
                <span className={`px-3 py-1 rounded-full font-body text-xs font-semibold ${flagClasses(latestFlag)}`}>
                  {flagLabel(latestFlag)}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full font-body text-sm font-medium ${flagClasses(previousFlag)}`}>
                  {flagLabel(previousFlag)}
                </span>
                {trend === 'up' ? (
                  <TrendingUp size={18} className="text-sage" />
                ) : trend === 'down' ? (
                  <TrendingDown size={18} className="text-coral" />
                ) : (
                  <Minus size={18} className="text-medium-gray" />
                )}
                <span className={`px-3 py-1 rounded-full font-body text-sm font-medium ${flagClasses(latestFlag)}`}>
                  {flagLabel(latestFlag)}
                </span>
              </div>

              {latest?.reasoning && (
                <p className="font-body text-xs text-charcoal/60">
                  {latest.reasoning}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 border-t-[3px] border-coral">
        <h3 className="font-display text-xl text-charcoal mb-4">What's Changed</h3>

        <div className="space-y-4">
          {improvements.length > 0 && (
            <div>
              <p className="label-text text-sage mb-2 flex items-center gap-2">
                <Check size={14} /> Improved
              </p>
              <ul className="space-y-1.5">
                {improvements.map((item, index) => (
                  <li key={index} className="font-body text-sm text-charcoal/80 flex items-start gap-2">
                    <Check size={14} className="text-sage mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {watchAreas.length > 0 && (
            <div>
              <p className="label-text text-amber mb-2 flex items-center gap-2">
                <Eye size={14} /> Keep An Eye On
              </p>
              <ul className="space-y-1.5">
                {watchAreas.map((item, index) => (
                  <li key={index} className="font-body text-sm text-charcoal/80 flex items-start gap-2">
                    <Eye size={14} className="text-amber mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {improvements.length === 0 && watchAreas.length === 0 && (
            <p className="font-body text-charcoal/60">
              No major flag changes between the latest two report cards.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
