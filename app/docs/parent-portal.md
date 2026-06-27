# Parent Portal

The parent portal (`/parent/*`) is the core of NextStep·AI. It serves parents who want to understand and act on their child's report card.

## Pages

### Dashboard (`/parent`)

The entry point after login. Shows:
- Greeting (Good morning / afternoon / evening + first name)
- Summary bar: latest report term, overall flag, flag distribution, plan progress
- Report Cards list (up to 3 most recent, links to Clarity Check)
- Quick Actions grid (Upload, Conversation, Questions, Plan)
- Clarity Check preview (most recent 3 subjects)
- Plan Progress mini-bar
- Privacy note

### Upload Report (`/parent/upload`)

Three-step flow:
1. **Step 1** — File drop zone + child selector + board selector → "Analyze" CTA
2. **Step 2** — Editable subject grade cards → "Save Clarity Check" CTA
3. **Step 3** — Success animation → auto-redirect to Clarity Check

### Clarity Check (`/parent/clarity`)

Structured view of AI analysis:
- Overall status (FlagBadge)
- Summary paragraph
- Per-subject cards (colour-coded by flag)

### Conversation Guide (`/parent/conversation`)

AI-generated conversation script for talking with the child.

### Teacher Questions (`/parent/questions`)

List of specific questions the parent can raise at the next parent-teacher meeting.

### 30-Day Plan (`/parent/plan`)

Weekly habit checklist. Parents mark habits complete.

### Progress Tracking (`/parent/progress`)

Visual progress bar + full habit list with completion rate.

### Settings (`/parent/settings`)

Account settings (name, email, password change — MVP: UI only).

## Data Flow

```
UploadReport → creates ReportCard + SubjectGrade[] + ClarityCheck + PlanProgress
                     ↓
ParentDashboard reads all of the above to populate summary
ClarityCheck reads ClarityCheck + SubjectGrade[]
ConversationGuide reads ClarityCheck.conversationScript
TeacherQuestions reads ClarityCheck.teacherQuestions[]
DayPlan reads ClarityCheck.thirtyDayPlan + PlanProgress
ProgressTracking reads PlanProgress + updates completion
```

## Related Docs

- [`report-card-flow.md`](./report-card-flow.md)
- [`clarity-check-flow.md`](./clarity-check-flow.md)
- [`data-model.md`](./data-model.md)
