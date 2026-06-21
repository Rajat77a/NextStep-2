# Error States

This document maps every error condition in the app to the message shown to the user.

## Upload Report — Step 1 (File Selection)

| Condition | Message shown |
|---|---|
| File is not JPG, PNG, or PDF | "Please upload a JPG, PNG, or PDF report card." |
| File is larger than 10 MB | "Please upload a file smaller than 10MB." |
| No child selected and no name entered | "Please choose a child or enter the student name before analyzing the report card." |

## Upload Report — Analysis (Claude API call)

| Condition | Message shown |
|---|---|
| OCR extracts < 20 characters | "I could not read enough text from this report card. Please try a clearer image or PDF." |
| Claude API call throws any error | `e.message` if set, otherwise "Something went wrong. Please try again." |
| API key missing / invalid | Claude throws → "Something went wrong. Please try again." |

## Upload Report — Save (handleConfirm)

| Condition | Message shown |
|---|---|
| Any save step throws | `e.message` if set, otherwise "Something went wrong. Please try again." |

## Error Display Pattern

All errors in `UploadReport` are shown via:

```tsx
{error && (
  <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm font-body flex items-center gap-2">
    <AlertCircle size={14} />
    {error}
  </div>
)}
```

The error clears (`setError('')`) at the start of each new action.

## Auth Errors

| Condition | Where shown |
|---|---|
| Email already registered | LoginPage / SignupPage inline error |
| Wrong password | LoginPage inline error |
| Empty required fields | HTML5 `required` validation |

## General Principle

> **No silent failures.** Every `catch` block must call `setError()` with a user-readable message. A blank screen on failure is never acceptable.

See [troubleshooting.md](./troubleshooting.md) for user-facing help with common errors.
