import { describe, it, expect } from 'vitest';
import { mapAIAnalysisToSubjectGrades, mapAIAnalysisToClarityCheck } from '@/api/analysis';
import type { AIReportAnalysis } from '@/types';

function mockAnalysis(overrides?: Partial<AIReportAnalysis>): AIReportAnalysis {
  return {
    overallStatus: 'good',
    summaryText: 'Good progress this term.',
    subjects: [
      { subject: 'Mathematics', grade: 'A', normalizedScore: 90, teacherComment: 'Excellent', flag: 'green', reasoning: 'Strong performance' },
      { subject: 'Science', grade: 'B+', normalizedScore: 85, teacherComment: 'Good', flag: 'green', reasoning: 'Solid effort' },
    ],
    conversationScript: {
      openingLine: 'How was school today?',
      acknowledgeGood: ['Great job in Math'],
      exploreChallenges: ['What felt hard?'],
      avoidSaying: ['You should study more'],
      tryInstead: ['What would help?'],
      closeWithSupport: 'We are here for you',
    },
    teacherQuestions: ['How is my child doing socially?', 'Any areas to focus on?'],
    thirtyDayPlan: [
      {
        weekNumber: 1,
        weekTitle: 'Build Momentum',
        actions: [{ text: 'Review Math daily', timeEstimate: '20 min', whyItHelps: 'Builds routine' }],
      },
    ],
    ...overrides,
  } as AIReportAnalysis;
}

describe('mapAIAnalysisToSubjectGrades', () => {
  it('maps subjects to SubjectGrade format', () => {
    const analysis = mockAnalysis();
    const grades = mapAIAnalysisToSubjectGrades(analysis);
    expect(grades).toHaveLength(2);
    expect(grades[0]).toMatchObject({
      subjectName: 'Mathematics',
      grade: 'A',
      normalizedScore: 90,
      flag: 'green',
      aiNote: 'Strong performance',
    });
  });

  it('preserves teacherComment', () => {
    const analysis = mockAnalysis();
    const grades = mapAIAnalysisToSubjectGrades(analysis);
    expect(grades[0].teacherComment).toBe('Excellent');
  });

  it('handles empty subjects', () => {
    const analysis = mockAnalysis();
    analysis.subjects = [];
    const grades = mapAIAnalysisToSubjectGrades(analysis);
    expect(grades).toHaveLength(0);
  });
});

describe('mapAIAnalysisToClarityCheck', () => {
  it('extracts clarity check fields from analysis', () => {
    const analysis = mockAnalysis();
    const check = mapAIAnalysisToClarityCheck(analysis);
    expect(check.overallStatus).toBe('good');
    expect(check.summaryText).toBe('Good progress this term.');
    expect(check.conversationScript.openingLine).toBe('How was school today?');
    expect(check.teacherQuestions).toHaveLength(2);
    expect(check.thirtyDayPlan).toHaveLength(1);
  });

  it('passes through teacherQuestions array', () => {
    const analysis = mockAnalysis();
    const check = mapAIAnalysisToClarityCheck(analysis);
    expect(check.teacherQuestions[0]).toBe('How is my child doing socially?');
  });
});
