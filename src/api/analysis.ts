import type { AIReportAnalysis, BoardType } from '@/types';

export async function analyzeReportText(data: {
  rawText: string;
  studentName?: string;
  boardType?: BoardType;
}): Promise<AIReportAnalysis> {
  const response = await fetch('/api/analyze-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rawText: data.rawText,
      studentName: data.studentName || '',
      boardType: data.boardType || 'Other',
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || 'The AI analysis failed. Please try again.');
  }

  if (!payload?.analysis) {
    throw new Error('The AI response was empty. Please try again.');
  }

  return payload.analysis as AIReportAnalysis;
}

export function mapAIAnalysisToSubjectGrades(analysis: AIReportAnalysis) {
  return analysis.subjects.map((subject) => ({
    subjectName: subject.subject,
    grade: subject.grade,
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
