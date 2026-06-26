// Google Gemini API
// Required env var: NextStep (set your Gemini API key in Vercel)
// Get a key from: https://aistudio.google.com/apikey

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You analyze school report cards for parents.

Return only valid JSON matching this exact shape — no markdown, no explanation, just the JSON object:
{
  "studentName": string,
  "term": string,
  "subjects": [
    {
      "subject": string,
      "grade": string,
      "normalizedScore": number,
      "flag": "green" | "yellow" | "red",
      "teacherComment": string,
      "reasoning": string
    }
  ],
  "summaryText": string,
  "overallStatus": "green" | "yellow" | "red",
  "teacherQuestions": [
    {
      "subject": string,
      "question": string,
      "context": string,
      "whyItMatters": string
    }
  ],
  "conversationScript": {
    "opening": string,
    "acknowledgeGood": [ string ],
    "exploreChallenges": [ string ],
    "closeWithSupport": string
  },
  "thirtyDayPlan": [
    {
      "weekNumber": number,
      "weekTitle": string,
      "dateRange": string,
      "actions": [
        {
          "text": string,
          "timeEstimate": string,
          "whyItHelps": string
        }
      ]
    }
  ]
}

Non-negotiable safety rules:
1. Never predict the child's future, character, career, intelligence, or destiny. Do not say "will fail", "cannot", "should become X", or similar.
2. Use advisory language only: "this may indicate...", "worth checking with the teacher about...", "try this for two weeks and see...".
3. Every red flagged subject's reasoning MUST include this exact sentence: "This is not a diagnosis; it is worth consulting the teacher or a qualified professional for context."
4. Flags must be genuinely differentiated from the actual grades and comments. Strong grade plus positive comment => green. Mediocre grade or mixed comment => yellow. Low grade plus recurring/ongoing concern => red.
5. Avoid generic repeated reasoning. Each subject must have distinct reasoning tied to the specific report card text.
6. If the report card is unclear, make cautious inferences and say what should be checked with the teacher.
7. normalizedScore must be 0 to 100. If exact score is missing, estimate carefully from the grade.
8. thirtyDayPlan must contain exactly 4 weeks.
9. Each week must have at least 2 actions.
10. Return JSON only. No markdown.`;

function extractJson(text: string): any {
  const trimmed = text.trim();
  // Strip markdown fences if present
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? trimmed;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('Gemini did not return a JSON object.');
  }

  return JSON.parse(raw.slice(start, end + 1));
}

function validateAnalysis(value: any) {
  if (!value || typeof value !== 'object') throw new Error('Missing analysis object.');

  if (!Array.isArray(value.subjects) || value.subjects.length === 0) {
    throw new Error('Missing subjects.');
  }

  if (!['green', 'yellow', 'red'].includes(value.overallStatus)) {
    throw new Error('Invalid overallStatus.');
  }

  if (!value.summaryText || typeof value.summaryText !== 'string') {
    throw new Error('Missing summaryText.');
  }

  if (!Array.isArray(value.teacherQuestions)) {
    throw new Error('Missing teacherQuestions.');
  }

  if (!value.conversationScript) {
    throw new Error('Missing conversationScript.');
  }

  if (!Array.isArray(value.thirtyDayPlan) || value.thirtyDayPlan.length !== 4) {
    throw new Error('thirtyDayPlan must contain exactly 4 weeks.');
  }

  value.subjects.forEach((subject: any) => {
    if (!subject.subject) throw new Error('Subject name missing.');
    if (!subject.grade) throw new Error(`Grade missing for ${subject.subject}.`);

    if (!['green', 'yellow', 'red'].includes(subject.flag)) {
      throw new Error(`Invalid flag for ${subject.subject}.`);
    }

    if (typeof subject.normalizedScore !== 'number') {
      subject.normalizedScore = 0;
    }

    subject.normalizedScore = Math.max(0, Math.min(100, subject.normalizedScore));

    if (
      subject.flag === 'red' &&
      !String(subject.reasoning || '').toLowerCase().includes('not a diagnosis')
    ) {
      throw new Error(
        `Red flag reasoning for ${subject.subject} is missing the required disclaimer.`
      );
    }
  });

  return value;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // ── API key guard ──
  const apiKey = (process.env.NextStep || '').trim();
  if (!apiKey) {
    res.status(500).json({
      error:
        'Gemini API key is not configured. Add NextStep in Vercel → Project Settings → Environment Variables, then redeploy.',
    });
    return;
  }

  try {
    const { rawText, studentName, boardType } = req.body || {};

    if (!rawText || String(rawText).trim().length < 20) {
      res.status(400).json({ error: 'The text was too short to analyze. Please paste more text.' });
      return;
    }

    const userMessage = [
      `Student name hint: ${studentName || 'Unknown'}`,
      `Board type: ${boardType || 'Unknown'}`,
      '',
      'Report card text:',
      rawText,
    ].join('\n');

    // ── Call Gemini REST API ──
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 3000,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text().catch(() => '');
      throw new Error(`Gemini API error ${geminiResponse.status}: ${errBody || geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
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
