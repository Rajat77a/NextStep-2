const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `
You are an expert academic report card analyst.

Analyze the student's report card and return ONLY valid JSON.
Do not include markdown, explanation, or code blocks.

Return this structure:
{
  "subjects": [
    {
      "name": "string",
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
  "teacherQuestions": [{"question": "string"}],
  "thirtyDayPlan": [
    {
      "week": "number",
      "weekNumber": "number",
      "habit": "string",
      "actions": [{"text": "string"}]
    }
  ],
  "term": "string"
}
`;

function extractJson(text) {
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST.' });

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Server config error: GROQ_API_KEY is not set.' });
  }

  try {
    const { text, studentName, boardType } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please provide report card text.' });
    }

    const userPrompt = `Student Name: ${studentName || 'Unknown'}\nBoard: ${boardType || 'Unknown'}\n\nReport Card Content:\n${text}`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 8192,
      }),
    });

    const result = await groqRes.json();
    if (!groqRes.ok) {
      return res.status(groqRes.status).json({ error: result?.error?.message || 'Groq API request failed.' });
    }

    const aiText = result?.choices?.[0]?.message?.content;
    if (!aiText) return res.status(500).json({ error: 'AI returned an empty response.' });

    const analysis = extractJson(aiText);

    return res.status(200).json(analysis);
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Failed to analyze report' });
  }
}
