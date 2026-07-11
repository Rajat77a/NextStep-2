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
      text: data.rawText,
      studentName: data.studentName || '',
      boardType: data.boardType || 'Other',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({} as Record<string, unknown>));
    throw new Error(errorData.error || 'Failed to analyze report');
  }

  return response.json();
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

