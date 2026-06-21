# Repository Map

Full file tree of the NextStep·AI source code.

```
NextStep-2/
├── .env.example                  # Required environment variable template
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── .gitignore
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── README.md
├── SECURITY.md
├── api/                          # (root-level, legacy — not used)
├── components.json               # shadcn/ui config (if used)
├── docs/                         # Project documentation (40+ files)
├── eslint.config.js
├── index.html                    # Vite HTML entry point
├── info.md
├── package.json
├── postcss.config.js
├── src/
│   ├── App.css
│   ├── App.tsx                   # Routes + ProtectedRoute + PortalLayout
│   ├── api/
│   │   ├── analysis.ts           # Claude API call (analyzeReportText)
│   │   ├── data.ts               # All CRUD operations (uses storage.ts)
│   │   └── storage.ts            # localStorage read/write primitives
│   ├── components/
│   │   ├── shared/
│   │   │   ├── FlagBadge.tsx     # green/yellow/red badge component
│   │   │   ├── PortalNav.tsx     # Top nav bar (role-aware)
│   │   │   └── ScrollReveal.tsx  # Scroll-triggered animation wrapper
│   │   └── ui/                   # Reusable UI primitives
│   ├── hooks/
│   │   └── useAuth.ts            # Auth context hook
│   ├── index.css                 # Global CSS + Tailwind base
│   ├── lib/
│   │   └── reportOcr.ts          # Tesseract.js OCR wrapper
│   ├── main.tsx                  # React entry point
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── LandingPage.tsx       # Marketing page
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminSettings.tsx
│   │   │   ├── ClassManagement.tsx
│   │   │   ├── StudentRoster.tsx
│   │   │   ├── SubscriptionPage.tsx
│   │   │   └── TeacherManagement.tsx
│   │   ├── parent/
│   │   │   ├── ClarityCheck.tsx
│   │   │   ├── ConversationGuide.tsx
│   │   │   ├── DayPlan.tsx
│   │   │   ├── ParentDashboard.tsx
│   │   │   ├── ParentSettings.tsx
│   │   │   ├── ProgressTracking.tsx
│   │   │   ├── TeacherQuestions.tsx
│   │   │   └── UploadReport.tsx
│   │   └── teacher/
│   │       ├── ClassPatterns.tsx
│   │       ├── TeacherClasses.tsx
│   │       ├── TeacherDashboard.tsx
│   │       └── TeacherSettings.tsx
│   └── types/
│       └── index.ts              # All shared TypeScript interfaces
├── tailwind.config.js            # Design tokens (colours, shadows, fonts)
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json                   # SPA rewrite rule
└── vite.config.ts
```

## Key Entry Points

| File | Purpose |
|---|---|
| `src/main.tsx` | React root render + BrowserRouter |
| `src/App.tsx` | All routes + ProtectedRoute logic |
| `src/api/storage.ts` | All localStorage operations |
| `src/api/analysis.ts` | Claude AI call |
| `src/lib/reportOcr.ts` | Tesseract OCR |
| `tailwind.config.js` | Design token source of truth |
