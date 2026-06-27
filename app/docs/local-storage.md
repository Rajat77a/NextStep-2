# Local Storage

NextStep·AI (MVP) persists all data in the browser's `localStorage`. This document describes every key, its type, and what it contains.

## Storage Keys

| Key | Type | Description |
|---|---|---|
| `nextstep_users` | `User[]` | All registered user accounts |
| `nextstep_current_user` | `User \| null` | The currently logged-in user |
| `nextstep_students` | `Student[]` | All students (linked to parent IDs) |
| `nextstep_report_cards` | `ReportCard[]` | All uploaded report card metadata |
| `nextstep_subject_grades` | `SubjectGrade[]` | All subject-level grades and AI flags |
| `nextstep_clarity_checks` | `ClarityCheck[]` | All AI-generated clarity check results |
| `nextstep_plan_progress` | `PlanProgress[]` | 30-day plan completion data |
| `nextstep_classes` | `Class[]` | School class records (admin) |
| `nextstep_teachers` | `Teacher[]` | Teacher records (admin) |

## The `storage` Module

All reads and writes go through `src/api/storage.ts`. It exports typed getters and setters for each entity. **Never read from `localStorage` directly in components** — always use the storage module.

Example:

```ts
// ✅ Correct
const grades = storage.getSubjectGrades().filter(g => g.reportCardId === id);

// ❌ Avoid
const raw = JSON.parse(localStorage.getItem('nextstep_subject_grades') || '[]');
```

## Storage Limits

Browsers allocate ~5 MB of localStorage per origin. Rough estimates per entity:

| Entity | Avg size per record |
|---|---|
| User | ~200 bytes |
| Student | ~150 bytes |
| ReportCard | ~250 bytes |
| SubjectGrade | ~400 bytes |
| ClarityCheck | ~2–5 KB (AI text content) |
| PlanProgress | ~500 bytes |

A family with 2 children and 3 report cards each will use approximately **50–100 KB** — well within the limit.

## Clearing Data

To reset all data during development:

1. Open DevTools (F12).
2. Go to **Application** → **Local Storage** → `http://localhost:5173`.
3. Right-click → **Clear**.

Or from the console:

```js
Object.keys(localStorage)
  .filter(k => k.startsWith('nextstep_'))
  .forEach(k => localStorage.removeItem(k));
```

## Why localStorage?

localStorage was chosen for the MVP because:
- Zero backend infrastructure required.
- Instant reads/writes — no async latency.
- Easy to demo and deploy.

The migration plan to Supabase is documented in [`future-backend.md`](./future-backend.md).
