const GEMINI_API_KEY = process.env.NextStep;
const GEMINI_MODEL = 'gemini-2.5-flash';

const SYSTEM_PROMPT = `
You are an expert academic report card analyst.

Analyze the student's report card and return ONLY valid JSON.
Do not include markdown, explanation, or code blocks.

Return this structure:
{
  "overallPerformance": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "subjectAnalysis": [
    {
      "subject": "string",
      "grade": "string",
      "score": "number",
      "normalizedScore": "number",
      "teacherComment": "string",
      "flag": "string",
      "reasoning": "string"
    }
  ],
  "overallStatus": "string",
  "summaryText": "string",
  "conversationScript": "string",
  "teacherQuestions": ["string"],
  "thirtyDayPlan": ["string"]
}
`;

function extractJson(text: string): any {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI did not return valid JSON.');
  }
}

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Server configuration error: GEMINI_API_KEY (NextStep) is not set.',
    });
  }

  try {
    const { text, studentName, boardType } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please provide report card text or a file.' });
    }

    const userPrompt = `
Student Name: ${studentName || 'Unknown'}
Board: ${boardType || 'Unknown'}

Report Card Content:
${text}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    });

    const result: any = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini API error:', result);
      return res.status(geminiRes.status).json({
        error: result?.error?.message || 'Gemini API request failed.',
      });
    }

    const aiText: string | undefined =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      console.error('Empty Gemini response:', result);
      return res.status(500).json({ error: 'AI returned an empty response.' });
    }

    const analysis = extractJson(aiText);

    return res.status(200).json({ success: true, analysis });
  } catch (error: any) {
    console.error('Analyze report error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze report',
    });
  }
}
