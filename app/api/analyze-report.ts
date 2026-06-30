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
      "marks": "string",
      "performance": "string",
      "suggestion": "string"
    }
  ],
  "recommendations": ["string"],
  "parentGuidance": "string",
  "nextSteps": ["string"]
}
`;

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('No JSON found in AI response');
  }

  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Server configuration error: NextStep API key is not set.',
      });
    }

    const body = req.body || {};
    const reportText = body.text || body.rawText || body.reportCardText || '';

    if (!reportText || typeof reportText !== 'string' || !reportText.trim()) {
      return res.status(400).json({
        error: 'Please provide report card text or a file.',
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\nReport card text:\n${reportText}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', result);
      return res.status(response.status).json({
        error: result?.error?.message || 'Failed to analyze report',
      });
    }

    const aiText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      console.error('Empty Gemini response:', result);
      return res.status(500).json({
        error: 'AI returned an empty response.',
      });
    }

    const analysis = extractJson(aiText);

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Analyze report error:', error);

    return res.status(500).json({
      error: error?.message || 'Failed to analyze report',
    });
  }
}
