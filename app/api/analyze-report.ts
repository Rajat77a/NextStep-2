// Google Gemini API
// Required env var: GEMINI_API_KEY (set your key in Vercel)
// Get a key from: https://aistudio.google.com/apikey

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You analyze school report cards for parents.

Return only valid JSON matching this exact shape — no markdown, no explanation, just the JSON object:

{
  "overallSummary": {
    "strengths": ["string"],
    "areasForImprovement": ["string"],
    "overallPerformance": "string"
  },
  "subjectAnalysis": [
    {
      "subject": "string",
      "grade": "string",
      "score": number,
      "maxScore": number,
      "teacherRemarks": "string",
      "analysis": "string",
      "suggestions": ["string"]
    }
  ],
  "recommendedNextSteps": [
    {
      "focusArea": "string",
      "actionItems": ["string"],
      "resources": ["string"]
    }
  ],
  "parentActionPlan": {
    "weeklyPlan": [
      {
        "week": number,
        "focus": "string",
        "activities": ["string"]
      }
    ],
    "conversationStarters": ["string"]
  }
}

Be accurate, encouraging, and specific to the report card data. If a field is missing in the input, infer a reasonable default or return null for that field.`;

type ReportCardAnalysis = {
  overallSummary: {
    strengths: string[];
    areasForImprovement: string[];
    overallPerformance: string;
  };
  subjectAnalysis: Array<{
    subject: string;
    grade?: string;
    score?: number;
    maxScore?: number;
    teacherRemarks?: string;
    analysis?: string;
    suggestions?: string[];
  }>;
  recommendedNextSteps?: Array<{
    focusArea: string;
    actionItems: string[];
    resources?: string[];
  }>;
  parentActionPlan?: {
    weeklyPlan?: Array<{
      week: number;
      focus: string;
      activities: string[];
    }>;
    conversationStarters?: string[];
  };
};

function extractJson(text: string): any {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error('Could not find a valid JSON object in Gemini response.');
  }

  const jsonString = text.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonString);
}

function validateAnalysis(raw: any): ReportCardAnalysis {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Analysis response is not a valid object.');
  }

  if (!raw.overallSummary || !Array.isArray(raw.subjectAnalysis)) {
    throw new Error('Analysis response missing required fields.');
  }

  return raw as ReportCardAnalysis;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Server configuration error: GEMINI_API_KEY is not set.',
    });
  }

  const { reportCardText, mimeType, fileData } = req.body;

  if (!reportCardText && !fileData) {
    return res.status(400).json({
      error: 'Please provide report card text or a file.',
    });
  }

  try {
    const parts: any[] = [];

    if (fileData) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'application/pdf',
          data: fileData,
        },
      });
    }

    if (reportCardText) {
      parts.push({
        text: `Analyze this report card and return the JSON described above:\n\n${reportCardText}`,
      });
    } else {
      parts.push({
        text: `Analyze the attached report card and return the JSON described above.`,
      });
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        systemInstruction: {
          role: 'system',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const geminiData = await response.json();

    const text: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    const analysis = validateAnalysis(extractJson(text));

    res.status(200).json({ analysis, model: GEMINI_MODEL });
  } catch (error: any) {
    res.status(500).json({
      error: error?.message || 'Could not analyze the report card. Please try again.',
    });
  }
}
