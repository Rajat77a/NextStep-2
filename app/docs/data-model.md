# Data Model

This document describes every entity stored in localStorage, their fields, and their relationships.

## Entities

### `User`

```ts
{
  id: string;           // UUID
  fullName: string;
  email: string;
  role: 'parent' | 'teacher' | 'admin';
  schoolId?: string;
  createdAt: string;    // ISO date string
}
```

### `Student`

```ts
{
  id: string;
  fullName: string;
  parentId: string;     // → User.id (parent)
  classId?: string;     // → Class.id
  createdAt: string;
}
```

### `ReportCard`

```ts
{
  id: string;
  studentId: string;    // → Student.id
  term: string;         // e.g. "Term 1 2026"
  boardType: BoardType; // 'CBSE' | 'ICSE' | 'IGCSE' | 'State' | 'Other'
  fileUrl?: string;     // blob URL (not persisted across sessions)
  createdAt: string;
}
```

### `SubjectGrade`

```ts
{
  id: string;
  reportCardId: string; // → ReportCard.id
  subjectName: string;
  grade: string;        // Raw grade string, e.g. "A2" or "78%"
  normalizedScore: number; // 0–100, derived by scoreFromGrade()
  teacherComment: string;
  flag: FlagStatus;     // 'green' | 'yellow' | 'red'
  aiNote: string;       // Plain-English AI note for parent
  createdAt: string;
}
```

### `ClarityCheck`

```ts
{
  id: string;
  reportCardId: string; // → ReportCard.id
  parentId: string;     // → User.id (parent)
  overallStatus: FlagStatus;
  summaryText: string;
  conversationScript: string;
  teacherQuestions: string[];
  thirtyDayPlan: ThirtyDayPlanItem[];
  generatedAt: string;
}
```

### `ThirtyDayPlanItem`

```ts
{
  week: number;         // 1–4
  habit: string;        // Description of the habit
  rationale?: string;   // Why this habit helps
}
```

### `PlanProgress`

```ts
{
  id: string;
  clarityCheckId: string; // → ClarityCheck.id
  items: PlanProgressItem[];
  completionRate: number;  // 0–100, calculated
  updatedAt: string;
}
```

### `PlanProgressItem`

```ts
{
  text: string;
  completed: boolean;
  week: number;
}
```

## Relationships

```
User (parent) ──< Student ──< ReportCard ──< SubjectGrade
                                  │
                                  └──< ClarityCheck ──< PlanProgress
```

## Storage Keys (localStorage)

| Key | Entity |
|---|---|
| `nextstep_users` | `User[]` |
| `nextstep_students` | `Student[]` |
| `nextstep_report_cards` | `ReportCard[]` |
| `nextstep_subject_grades` | `SubjectGrade[]` |
| `nextstep_clarity_checks` | `ClarityCheck[]` |
| `nextstep_plan_progress` | `PlanProgress[]` |

All reads and writes go through `src/api/storage.ts`.
