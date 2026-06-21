# Demo Data

This document describes the seed / demo data used for local development and testing.

## Purpose

Because the MVP uses localStorage, there is no database seed script. Instead, the app creates data organically as you interact with it. This document describes what a "fully seeded" local state looks like for testing all features.

## Creating a Full Test State

### Step 1 — Sign Up as Parent

1. Go to `/signup`
2. Name: `Priya Sharma`, Email: `priya@test.com`, Password: `test123`, Role: `Parent`

### Step 2 — Upload a Report Card

1. Navigate to `/parent/upload`
2. Upload any clear JPG or PDF
3. Child name: `Aryan Sharma`
4. Board: `CBSE`
5. Click "Analyze Report Card"
6. Wait for AI analysis, then click "Looks Correct — Save Clarity Check"

This creates:
- `Student`: Aryan Sharma
- `ReportCard`: Term auto-detected from AI
- `SubjectGrade[]`: One per subject found in the card
- `ClarityCheck`: With conversation script, teacher questions, 30-day plan
- `PlanProgress`: With all habits unchecked

### Step 3 — Mark Some Habits

1. Go to `/parent/plan`
2. Check 3–4 habits to test `completionRate`

### Step 4 — Sign Up as Teacher

1. Open an incognito window, go to `/signup`
2. Name: `Arun Kumar`, Email: `arun@test.com`, Password: `test123`, Role: `Teacher`

### Step 5 — Sign Up as Admin

1. Another incognito window, `/signup`
2. Name: `Meena Rao`, Email: `meena@test.com`, Password: `test123`, Role: `Admin`

## Exporting Test State

You can export the current localStorage state for sharing:

```js
// Run in browser console
const state = {};
Object.keys(localStorage)
  .filter(k => k.startsWith('nextstep_'))
  .forEach(k => state[k] = localStorage.getItem(k));
copy(JSON.stringify(state, null, 2));
```

Paste the JSON into a file and share it. To restore:

```js
// Run in browser console
const state = JSON.parse('/* paste here */');
Object.entries(state).forEach(([k, v]) => localStorage.setItem(k, v));
location.reload();
```
