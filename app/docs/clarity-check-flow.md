# Clarity Check Flow

The Clarity Check page (`/parent/clarity`) is the main output screen after a report card is analyzed.

## Entry Points

| Source | How |
|---|---|
| After upload | Auto-redirect from `UploadReport` step 3 with `state: { reportCardId }` |
| From dashboard | Click "View Full Analysis" link on the Clarity Check preview card |
| Via nav | Click "Clarity Check" in PortalNav |

## Page State

```
No reportCardId in route state
  └─ Load most recent ClarityCheck for the current parent
        ├─ Found → display
        └─ Not found → show empty state ("Upload a report card to see your Clarity Check")

reportCardId present in route state
  └─ Load ClarityCheck for that specific reportCardId
        ├─ Found → display
        └─ Not found → show empty state
```

## Displayed Data

| Section | Data source |
|---|---|
| Overall status badge | `ClarityCheck.overallStatus` (green / yellow / red) |
| Summary paragraph | `ClarityCheck.summaryText` |
| Subject cards | `SubjectGrade[]` filtered by `reportCardId` |
| Conversation script | `ClarityCheck.conversationScript` |
| Teacher questions | `ClarityCheck.teacherQuestions[]` |
| 30-day plan preview | `ClarityCheck.thirtyDayPlan[]` |

## Subject Card Layout

Each subject card shows:
- Subject name
- Grade string (e.g. "A2", "78%")
- Flag colour (green / yellow / red left border)
- AI note (plain-English explanation for the parent)

## Navigation Out

| Action | Destination |
|---|---|
| "Tonight's Conversation" button | `/parent/conversation` |
| "Teacher Questions" button | `/parent/questions` |
| "Start 30-Day Plan" button | `/parent/plan` |
| Back button | `/parent` |

## Empty State

When no Clarity Check exists:
- Upload icon + "No Clarity Check yet" message
- Link to `/parent/upload`

## Related Docs

- [`report-card-flow.md`](./report-card-flow.md) — how the ClarityCheck is created
- [`data-model.md`](./data-model.md) — ClarityCheck entity structure
