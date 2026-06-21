import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You analyze school report cards for parents.

Return only valid JSON matching this exact shape:
{
  "studentName": string,
  "term": string,
  "subjects": [
    { "subject": string, "grade": string, "flag": "green" | "yellow" | "red", "reasoning": string }
  ],
  "teacherQuestions": [ string ],
  "conversationScript": {
    "openingLine": string,
    "avoidSaying": [ string ],
    "tryInstead": [ string ]
  },
  "thirtyDayPlan": [
    { "week": number, "habit": string }
  ]
}

Non-negotiable safety rules:
1. Never predict the child's future, character, career, intelligence, or destiny. Do not say "will fail", "cannot", "should become X", or similar.
2. Use advisory language only: "this may indicate...", "worth checking with the teacher about...", "try this for two weeks and see...".
3. Every red flagged subject's reasoning must include this sentence: "This is not a diagnosis; it is worth consulting the teacher or a qualified professional for context."
4. Flags must be genuinely differentiated from the actual grades and comments. Strong grade plus positive comment => green. Mediocre grade plus real gap => yellow. Low grade plus recurring/ongoing concern => red.
5. Avoid generic repeated reasoning. Each subject must have distinct reasoning tied to the report card text.
6. If the report card is unclear, make cautious inferences and say what should be checked with the teacher.`;

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] || trimmed;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('Claude did not return JSON.');
  }

  return JSON.parse(raw.slice(start, end + 1));
}

function validateAnalysis(value: any) {
  if (!value || typeof value !== 'object') throw new Error('Missing analysis object.');
  if (!Array.isArray(value.subjects) || value.subjects.length === 0) throw new Error('Missing subjects.');
  if (!Array.isArray(value.teacherQuestions)) throw new Error('Missing teacherQuestions.');
  if (!value.conversationScript) throw new Error('Missing conversationScript.');
  if (!Array.isArray(value.thirtyDayPlan)) throw new Error('Missing thirtyDayPlan.');

  value.subjects.forEach((subject: any) => {
    if (!['green', 'yellow', 'red'].includes(subject.flag)) {
      throw new Error(`Invalid flag for ${subject.subject || 'subject'}.`);
    }
    if (subject.flag === 'red' && !String(subject.reasoning || '').toLowerCase().includes('not a diagnosis')) {
      throw new Error(`Red flag reasoning for ${subject.subject || 'subject'} is missing the diagnosis disclaimer.`);
    }
  });

  return value;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured.' });
    return;
  }

  try {
    const { rawText, studentName, boardType } = req.body || {};

    if (!rawText || String(rawText).trim().length < 20) {
      res.status(400).json({ error: 'The OCR text was too short to analyze.' });
      return;
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2500,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Student name hint: ${studentName || 'Unknown'}\nBoard type: ${boardType || 'Unknown'}\n\nOCR report card text:\n${rawText}`,
        },
      ],
    });

    const text = message.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    const analysis = validateAnalysis(extractJson(text));
    res.status(200).json({ analysis, model: MODEL });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Could not analyze the report card.' });
  }
}
