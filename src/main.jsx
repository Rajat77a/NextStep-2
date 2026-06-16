import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Home,
  Loader2,
  Lock,
  MessageSquareText,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4174";

const roleTokens = {
  parent: "demo-parent-token",
  teacher: "demo-teacher-token",
  admin: "demo-admin-token",
};

const sampleReport = `Student: Aarav Mehta
Grade: 6
Board: CBSE
Mathematics: B-. Handles routine operations but struggles with multi-step word problems and checking final answers.
English: A-. Reads fluently and participates well. Written responses need stronger evidence from the text.
Science: B. Understands concepts in class but lab writeups are brief and sometimes miss observations.
Teacher comment: Aarav is curious and polite. He may benefit from slowing down, showing steps, and asking for clarification before assessments.`;

function App() {
  const [activePortal, setActivePortal] = useState("parent");

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Portal navigation">
        <a className="brand" href="/">
          <span className="brand-mark">N</span>
          <span>NextStep.AI</span>
        </a>
        <nav className="portal-nav">
          <PortalButton
            icon={<Home size={18} />}
            active={activePortal === "parent"}
            label="Parent Portal"
            onClick={() => setActivePortal("parent")}
          />
          <PortalButton
            icon={<Users size={18} />}
            active={activePortal === "teacher"}
            label="Teacher Portal"
            onClick={() => setActivePortal("teacher")}
          />
          <PortalButton
            icon={<Building2 size={18} />}
            active={activePortal === "admin"}
            label="School Admin"
            onClick={() => setActivePortal("admin")}
          />
        </nav>
        <div className="privacy-note">
          <Lock size={16} />
          <span>Role checks are enforced by the API. Guidance content stays parent-only.</span>
        </div>
      </aside>

      <main className="workspace">
        <DemoFlow activePortal={activePortal} />
        {activePortal === "parent" && <ParentPortal />}
        {activePortal === "teacher" && <TeacherPortal />}
        {activePortal === "admin" && <AdminPortal />}
      </main>
    </div>
  );
}

function PortalButton({ active, icon, label, onClick }) {
  return (
    <button className={active ? "nav-item active" : "nav-item"} onClick={onClick} type="button">
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DemoFlow({ activePortal }) {
  const steps = [
    { id: "admin", label: "School uploads", icon: <Building2 size={16} /> },
    { id: "teacher", label: "Teacher sees patterns", icon: <BarChart3 size={16} /> },
    { id: "parent", label: "Parent gets guidance", icon: <MessageSquareText size={16} /> },
  ];

  return (
    <section className="flow-strip" aria-label="Demo narrative">
      {steps.map((step) => (
        <div className={activePortal === step.id ? "flow-step current" : "flow-step"} key={step.id}>
          {step.icon}
          <span>{step.label}</span>
        </div>
      ))}
    </section>
  );
}

function ParentPortal() {
  const [reportText, setReportText] = useState(sampleReport);
  const [studentName, setStudentName] = useState("Aarav Mehta");
  const [board, setBoard] = useState("CBSE");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeReport(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/parent/analyze-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${roleTokens.parent}`,
        },
        body: JSON.stringify({ studentName, board, reportText }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Check the API server and try again.");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="portal-grid parent-grid">
      <div className="panel upload-panel">
        <div className="panel-heading">
          <span className="section-kicker">Parent Portal</span>
          <h1>Upload a report card and get calm next steps.</h1>
          <p>
            This parent view includes the full guidance package: clarity flags, teacher questions,
            tonight's conversation, and a 30-day home plan.
          </p>
        </div>

        <form className="analysis-form" onSubmit={analyzeReport}>
          <div className="field-row">
            <label>
              Child name
              <input value={studentName} onChange={(event) => setStudentName(event.target.value)} />
            </label>
            <label>
              Board
              <select value={board} onChange={(event) => setBoard(event.target.value)}>
                <option>CBSE</option>
                <option>ICSE</option>
                <option>IGCSE</option>
                <option>State Board</option>
              </select>
            </label>
          </div>

          <label>
            Report card text
            <textarea value={reportText} onChange={(event) => setReportText(event.target.value)} />
          </label>

          <div className="upload-actions">
            <button className="primary-action" disabled={loading} type="submit">
              {loading ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
              <span>{loading ? "Analyzing" : "Analyze report"}</span>
            </button>
            <p>PDF/image OCR can plug into this same endpoint after Tesseract.js is added.</p>
          </div>
          {error && <div className="error-box">{error}</div>}
        </form>
      </div>

      <AnalysisResult analysis={analysis} />
    </section>
  );
}

function AnalysisResult({ analysis }) {
  if (!analysis) {
    return (
      <div className="panel preview-panel">
        <div className="empty-state">
          <FileText size={36} />
          <h2>Analysis preview appears here.</h2>
          <p>
            Use the sample report to show the core demo flow. The generated copy uses advisory
            language and avoids predictions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-stack">
      <div className="panel result-header">
        <div>
          <span className="section-kicker">Clarity Check</span>
          <h2>{analysis.studentName}</h2>
          <p>{analysis.summary}</p>
        </div>
        <div className="confidence-box">
          <ShieldCheck size={22} />
          <span>{analysis.source}</span>
        </div>
      </div>

      <div className="flag-grid">
        {analysis.flags.map((flag) => (
          <article className={`flag-card ${flag.status}`} key={flag.subject}>
            <span>{flag.statusLabel}</span>
            <h3>{flag.subject}</h3>
            <p>{flag.reason}</p>
          </article>
        ))}
      </div>

      <GuidancePanel title="Questions to ask the teacher" icon={<ClipboardList size={20} />} items={analysis.teacherQuestions} />
      <GuidancePanel title="Tonight's conversation script" icon={<MessageSquareText size={20} />} items={analysis.conversationScript} />
      <GuidancePanel title="30-day home plan" icon={<CheckCircle2 size={20} />} items={analysis.homePlan} />

      <div className="panel safety-panel">
        <AlertTriangle size={20} />
        <p>{analysis.safetyNote}</p>
      </div>
    </div>
  );
}

function GuidancePanel({ title, icon, items }) {
  return (
    <section className="panel guidance-panel">
      <div className="compact-heading">
        {icon}
        <h2>{title}</h2>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function TeacherPortal() {
  const { data, loading, error } = useApi("/api/teacher/dashboard", "teacher");

  return (
    <section className="portal-page">
      <PageHeader
        kicker="Teacher Portal"
        title="Class-wide patterns without parent-only guidance."
        text="Teachers see flag-level data, class patterns, and students to watch. Conversation scripts and home plans are intentionally excluded."
      />
      {loading && <LoadingPanel />}
      {error && <div className="error-box">{error}</div>}
      {data && (
        <>
          <div className="metric-grid">
            {data.patterns.map((pattern) => (
              <article className="metric-card" key={pattern.subject}>
                <span>{pattern.subject}</span>
                <strong>{pattern.percent}%</strong>
                <p>{pattern.description}</p>
              </article>
            ))}
          </div>
          <div className="panel table-panel">
            <div className="compact-heading">
              <Users size={20} />
              <h2>Students to watch</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Teacher context</th>
                </tr>
              </thead>
              <tbody>
                {data.studentsToWatch.map((student) => (
                  <tr key={`${student.name}-${student.subject}`}>
                    <td>{student.name}</td>
                    <td>{student.className}</td>
                    <td>{student.subject}</td>
                    <td>
                      <span className={`status-text ${student.status}`}>{student.statusLabel}</span>
                    </td>
                    <td>{student.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function AdminPortal() {
  const { data, loading, error } = useApi("/api/admin/dashboard", "admin");

  return (
    <section className="portal-page">
      <PageHeader
        kicker="School Admin Portal"
        title="Bulk onboarding and aggregate school visibility."
        text="Admins can upload batches, manage roster data, and see school-wide trends. Individual parent scripts and home plans stay private."
      />
      {loading && <LoadingPanel />}
      {error && <div className="error-box">{error}</div>}
      {data && (
        <>
          <div className="admin-grid">
            <div className="panel bulk-panel">
              <div className="compact-heading">
                <Upload size={20} />
                <h2>Bulk upload</h2>
              </div>
              <div className="drop-zone">
                <FileText size={34} />
                <strong>Upload CSV, PDFs, or report-card images</strong>
                <span>Demo mode stores parsed rows against the school roster.</span>
              </div>
              <button className="secondary-action" type="button">Import sample batch</button>
            </div>
            <div className="panel billing-panel">
              <span className="section-kicker">School plan</span>
              <h2>{data.billing.plan}</h2>
              <p>{data.billing.seatsUsed} of {data.billing.seatsTotal} parent seats active</p>
              <div className="renewal-box">Renewal: {data.billing.renewalDate}</div>
            </div>
          </div>
          <div className="metric-grid">
            {data.schoolTrends.map((trend) => (
              <article className="metric-card" key={trend.label}>
                <span>{trend.label}</span>
                <strong>{trend.value}</strong>
                <p>{trend.description}</p>
              </article>
            ))}
          </div>
          <div className="panel table-panel">
            <div className="compact-heading">
              <Building2 size={20} />
              <h2>Roster snapshot</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Students</th>
                  <th>Teacher</th>
                  <th>Latest upload</th>
                </tr>
              </thead>
              <tbody>
                {data.roster.map((row) => (
                  <tr key={row.className}>
                    <td>{row.className}</td>
                    <td>{row.students}</td>
                    <td>{row.teacher}</td>
                    <td>{row.latestUpload}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function PageHeader({ kicker, title, text }) {
  return (
    <header className="page-header">
      <span className="section-kicker">{kicker}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </header>
  );
}

function LoadingPanel() {
  return (
    <div className="panel loading-panel">
      <Loader2 className="spin" size={24} />
      <span>Loading portal data</span>
    </div>
  );
}

function useApi(path, role) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const token = useMemo(() => roleTokens[role], [role]);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setState({ data: null, loading: true, error: "" });
      try {
        const response = await fetch(`${API_BASE}${path}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Unable to load this portal with the current role.");
        }
        const data = await response.json();
        if (!ignore) setState({ data, loading: false, error: "" });
      } catch (nextError) {
        if (!ignore) setState({ data: null, loading: false, error: nextError.message });
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [path, token]);

  return state;
}

createRoot(document.getElementById("root")).render(<App />);
