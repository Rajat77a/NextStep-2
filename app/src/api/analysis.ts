import type { AIReportAnalysis, BoardType } from '@/types';

export async function analyzeReportText(data: {
  rawText: string;
  studentName?: string;
  boardType?: BoardType;
}): Promise<AIReportAnalysis> {
  const response = await fetch('/api/analyzereport', {          // changed from /api/analyze-report
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: data.rawText,                                       // changed from rawText → text
      studentName: data.studentName || '',
      boardType: data.boardType || 'Other',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to analyze report');
  }

  return response.json();
}

export function mapSubjectsToAddGrades(subjects: AIReportAnalysis['subjects']) {
  return subjects.map((subject) => ({
    subjectName: subject.name,
    score: subject.normalizedScore,
    grade: subject.grade,
    maxScore: subject.maxScore,
    normalizedScore: subject.normalizedScore,
    teacherComment: subject.teacherComment,
    flag: subject.flag,
    aiNote: subject.reasoning,
  }));
}

export function mapAIAnalysisToClarityCheck(analysis: AIReportAnalysis) {
  return {
    overallStatus: analysis.overallStatus,
    summaryText: analysis.summaryText,
    conversationScript: analysis.conversationScript,
    teacherQuestions: analysis.teacherQuestions,
    thirtyDayPlan: analysis.thirtyDayPlan,
  };
}
