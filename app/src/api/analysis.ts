import { NextApiRequest, NextApiResponse } from 'next';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `
You are an expert academic report card analyst for Indian school boards (CBSE, ICSE, State, IGCSE).
Analyze the report card text and return a structured JSON response.

Required JSON format:
{
  "overallStatus": "green" | "yellow" | "red",
  "summaryText": "string - 2-3 sentence summary for parents",
  "conversationScript": "string - empathetic parent-teacher conversation script",
  "teacherQuestions": ["string", "string", ...],
  "thirtyDayPlan": {
    "week1": "string",
    "week2": "string",
    "week3": "string",
    "week4": "string"
  },
  "subjects": [
    {
      "name": "string",
      "score": number,
      "normalizedScore": number,
      "teacherComment": "string",
      "flag": "green" | "yellow" | "red",
      "reasoning": "string"
    }
  ]
}

Rules:
- Use the original board terminology and grading.
- Flag red only if scores/remarks indicate serious concern.
- normalizedScore should be 0-100.
- Keep all values concise and parent-friendly.
`;

function extractJson(text: string): any {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in response');
  return JSON.parse(match[0]);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.NextStep;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY is not set.' });
  }

  const { text, studentName, boardType } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide report card text or a file.' });
  }

  const userPrompt = `
Student Name: ${studentName || 'Unknown'}
Board: ${boardType || 'Other'}
Report Card Text:
${text.trim()}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'user', parts: [{ text: userPrompt }] },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Gemini API error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      return res.status(500).json({ error: 'Empty response from Gemini API.' });
    }

    const parsed = extractJson(generatedText);
    return res.status(200).json(parsed);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to analyze report card.', details: error.message });
  }
}
