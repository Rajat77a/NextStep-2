# Product Overview

NextStep·AI helps parents turn a school report card into clear, actionable guidance — in under two minutes.

## The Problem

Most parents receive a report card with grades and short teacher comments. They struggle to:

1. Know whether a grade of "B2" in Maths is a concern or just fine for their child's age.
2. Know what to say to their child tonight without being preachy.
3. Know what to ask the teacher at the next parent meeting.
4. Know what habits to build at home over the next month.

Schools can't always provide this — teachers have 30+ students per class.

## The Solution

NextStep·AI acts as a "report card interpreter." It reads the card using OCR, sends the extracted text to Claude AI along with the child's name and board type, and returns a structured analysis that covers all four parent pain points above.

## Key Features

### For Parents

| Feature | What it does |
|---|---|
| Upload Report Card | OCR reads JPG, PNG, or PDF; supports CBSE, ICSE, IGCSE, State, Other boards |
| Clarity Check | Per-subject green / yellow / red flags with plain-English AI notes |
| Conversation Guide | A personalised script for talking with the child tonight |
| Teacher Questions | Ready-made, specific questions to raise at the next meeting |
| 30-Day Home Plan | Weekly habits the parent can implement at home |
| Progress Tracker | Tick off completed habits; see completion percentage |

### For Teachers

| Feature | What it does |
|---|---|
| My Classes | View classes assigned to the logged-in teacher |
| Class Patterns | See flag distributions across the class |

### For Admins

| Feature | What it does |
|---|---|
| Class Management | Create and manage classes |
| Student Roster | Add and view students |
| Teacher Management | Manage teacher accounts |
| Subscriptions | View and manage school subscription plan |

## Privacy Model

- A parent's Clarity Check, conversation guide, and 30-day plan are **visible only to that parent**.
- Teachers can see class-level aggregates — not individual parent notes.
- No parent-uploaded files or AI-generated content is shared with the school or admin.

## Current Storage

This MVP uses **localStorage** — all data lives in the user's browser. A backend migration (Supabase or Firebase) is planned. See [`roadmap.md`](./roadmap.md).
