import type { AIReportAnalysis, BoardType } from '@/types';

export async function analyzeReportText(data: {
  rawText: string;
  studentName: string;
  boardType: BoardType;
}): Promise<AIReportAnalysis> {
  const response = await fetch('/api/analyze-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || 'The AI analysis failed. Please try again.');
  }

  return payload.analysis as AIReportAnalysis;
}
