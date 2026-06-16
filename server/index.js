import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
const port = process.env.PORT || 4174;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const usersByToken = {
  "demo-parent-token": { id: "parent-1", role: "parent", parentId: "par-1", studentIds: ["stu-1"] },
  "demo-teacher-token": { id: "teacher-1", role: "teacher", teacherId: "tea-1", classIds: ["cls-6a"] },
  "demo-admin-token": { id: "admin-1", role: "admin", schoolId: "sch-1" },
};

function requireRole(...roles) {
  return (request, response, next) => {
    const token = request.headers.authorization?.replace("Bearer ", "");
    const user = usersByToken[token];

    if (!user || !roles.includes(user.role)) {
      return response.status(403).json({ error: "Forbidden for this role" });
    }

    request.user = user;
    return next();
  };
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "NextStep.AI API" });
});

app.post("/api/parent/analyze-report", requireRole("parent"), async (request, response) => {
  const { studentName = "Student", board = "CBSE", reportText = "" } = request.body;

  if (!reportText.trim()) {
    return response.status(400).json({ error: "Report card text is required" });
  }

  const analysis = await analyzeReport({ studentName, board, reportText });
  return response.json(analysis);
});

app.get("/api/teacher/dashboard", requireRole("teacher"), (_request, response) => {
  response.json({
    className: "Grade 6A",
    patterns: [
      {
        subject: "Reading comprehension",
        percent: 60,
        description: "Flagged yellow. This may indicate a class-wide need for evidence-based responses.",
      },
      {
        subject: "Multi-step math",
        percent: 38,
        description: "Flagged red/yellow. Worth checking whether students are showing enough working.",
      },
      {
        subject: "Science writeups",
        percent: 24,
        description: "Flagged yellow. Lab observation notes may need more guided practice.",
      },
    ],
    studentsToWatch: [
      {
        name: "Aarav Mehta",
        className: "6A",
        subject: "Mathematics",
        status: "red",
        statusLabel: "Act now",
        note: "New this term. Check whether assessment pace is affecting accuracy.",
      },
      {
        name: "Maya Shah",
        className: "6A",
        subject: "English",
        status: "yellow",
        statusLabel: "Watch",
        note: "Ongoing pattern around citing evidence in written answers.",
      },
      {
        name: "Rohan Iyer",
        className: "6A",
        subject: "Science",
        status: "yellow",
        statusLabel: "Watch",
        note: "Class participation is strong; written lab details are thinner.",
      },
    ],
  });
});

app.get("/api/admin/dashboard", requireRole("admin"), (_request, response) => {
  response.json({
    billing: {
      plan: "School Annual Plan",
      seatsUsed: 214,
      seatsTotal: 300,
      renewalDate: "31 Mar 2027",
    },
    schoolTrends: [
      {
        label: "Students onboarded",
        value: "214",
        description: "Across grades 4-8 in the current academic year.",
      },
      {
        label: "Red flags",
        value: "18%",
        description: "Aggregate only. Admins cannot open parent guidance content.",
      },
      {
        label: "Parent reports sent",
        value: "181",
        description: "Generated after uploaded report cards were parsed.",
      },
    ],
    roster: [
      { className: "Grade 6A", students: 32, teacher: "Neha Kapoor", latestUpload: "Term 1 batch" },
      { className: "Grade 6B", students: 34, teacher: "Arjun Rao", latestUpload: "Term 1 batch" },
      { className: "Grade 7A", students: 29, teacher: "Meera Nair", latestUpload: "Pending" },
    ],
  });
});

async function analyzeReport({ studentName, board, reportText }) {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await analyzeWithClaude({ studentName, board, reportText });
    } catch (error) {
      console.warn("Claude analysis failed, using safe demo analysis:", error.message);
    }
  }

  return mockSafeAnalysis({ studentName, board, reportText });
}

async function analyzeWithClaude({ studentName, board, reportText }) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
    max_tokens: 1200,
    temperature: 0.2,
    system:
      "You analyze school report cards for parents. Never predict fixed futures. Use soft advisory language. Every red item must include a caveat that this is not a diagnosis and the parent should consult the teacher or a professional if concerned. Return only valid JSON matching the requested shape.",
    messages: [
      {
        role: "user",
        content: `Student: ${studentName}
Board: ${board}
Report card:
${reportText}

Return JSON with keys: studentName, summary, source, flags [{subject,status,statusLabel,reason}], teacherQuestions [], conversationScript [], homePlan [], safetyNote.`,
      },
    ],
  });

  const text = message.content.find((part) => part.type === "text")?.text || "";
  return JSON.parse(text);
}

function mockSafeAnalysis({ studentName, board, reportText }) {
  const lower = reportText.toLowerCase();
  const mathNeedsAttention = lower.includes("multi-step") || lower.includes("math");
  const writingWatch = lower.includes("written") || lower.includes("evidence");

  return {
    studentName,
    summary: `${studentName}'s ${board} report shows clear strengths and a few areas worth checking with the teacher. The pattern may indicate that accuracy and written explanation need more support than understanding itself.`,
    source: "Demo-safe analysis",
    flags: [
      {
        subject: "Mathematics",
        status: mathNeedsAttention ? "red" : "yellow",
        statusLabel: mathNeedsAttention ? "Act now" : "Watch",
        reason:
          "This may indicate difficulty with multi-step work or checking final answers. This is not a diagnosis; confirm the pattern with the teacher before making major changes.",
      },
      {
        subject: "English",
        status: writingWatch ? "yellow" : "green",
        statusLabel: writingWatch ? "Watch" : "Do not worry",
        reason:
          "Reading looks steady, while written responses may need more evidence from the text. Try targeted practice for two weeks and see what changes.",
      },
      {
        subject: "Science",
        status: "yellow",
        statusLabel: "Watch",
        reason:
          "Concept understanding appears present, but lab writeups may be brief. Worth asking whether the issue is observation detail, vocabulary, or time management.",
      },
    ],
    teacherQuestions: [
      "Is the main concern understanding the concept, showing steps, or checking work under time pressure?",
      "Can you share one example of a strong written response so we can practice the same structure at home?",
      "Would two weeks of short review sessions be enough to see whether this pattern improves?",
    ],
    conversationScript: [
      "Start with: I noticed your teacher said you are curious and participate well. That matters.",
      "Then ask: Which part of math feels most rushed right now: reading the question, choosing steps, or checking the answer?",
      "Close with: Let's try one small routine for two weeks, then we will see what helped.",
    ],
    homePlan: [
      "Week 1: Do two 10-minute sessions where the child explains each math step out loud.",
      "Week 2: Use one reading paragraph and ask for two pieces of evidence in the answer.",
      "Weeks 3-4: Keep a simple progress log: what felt easier, what still needs teacher help, and one win to celebrate.",
    ],
    safetyNote:
      "Guidance is advisory and based on limited report-card text. Red items are not diagnoses; consult the teacher or a qualified professional if concerns persist.",
  };
}

app.listen(port, () => {
  console.log(`NextStep.AI API running on http://localhost:${port}`);
});
