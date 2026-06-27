# Report Card Upload Flow

This document describes the full pipeline from file selection to navigation to the Clarity Check page.

## Steps

```
User selects file
      │
      ▼
setSelectedFile() — validates type (JPG/PNG/PDF) and size (≤ 10 MB)
      │
      ▼
User clicks "Analyze Report Card"
      │
      ▼
handleProcess()
  ├─ Resolve or create student record
  ├─ setLoading(true)
  ├─ extractReportText(file)    ← Tesseract OCR or PDF text extraction
  │         └─ setLoadingMessage updates: "Reading your report card..." → "Putting together your guide..."
  ├─ analyzeReportText({ rawText, studentName, boardType })  ← Claude API
  │         └─ Returns AIReportAnalysis { subjects[], conversationScript, teacherQuestions, thirtyDayPlan }
  ├─ Map subjects → SubjectGrade[]
  └─ setStep(2)  — show review screen
      │
      ▼
User reviews grades (editable), clicks "Looks Correct — Save Clarity Check"
      │
      ▼
handleConfirm()
  ├─ uploadReportCard()        ← creates ReportCard record
  ├─ addSubjectGrades()        ← saves SubjectGrade[]
  ├─ saveClarityCheck()        ← saves ClarityCheck with AI outputs
  ├─ createPlanProgress()      ← saves 30-day plan items
  └─ setStep(3) → navigate('/parent/clarity', { state: { reportCardId } })
```

## Error Handling

| Stage | Error shown |
|---|---|
| File validation | Inline error (wrong type or too large) |
| Student missing | "Please choose a child or enter the student name..." |
| OCR returns <20 chars | "I could not read enough text from this report card." |
| Claude API failure | "Something went wrong. Please try again." |
| Save failure | "Something went wrong. Please try again." |

## Loading Messages

When `loading === true`, a `useEffect` fires immediately with `"Reading your report card..."` and switches to `"Putting together your guide..."` after 2 seconds. This ensures the user always sees feedback.

## Board Types

`CBSE` | `ICSE` | `IGCSE` | `State` | `Other`

The board type is passed to the AI prompt to calibrate grading scale interpretation.

## File Size Limit

10 MB. Enforced client-side before OCR is invoked.

## Supported Formats

- `image/jpeg`
- `image/png`
- `application/pdf`
