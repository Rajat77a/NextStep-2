# Content Tone

This document defines the writing tone for all in-app copy, AI-generated content, and documentation.

## Core Principles

### 1. Warm, Not Clinical
Parents are often anxious when they see a red flag on their child's report card. All copy should feel like advice from a knowledgeable, caring friend — not a medical report or legal notice.

**Avoid:** "Subject performance indicates a deficit in foundational comprehension."
**Use:** "Your child is finding this subject tough right now — and that's completely fixable."

### 2. Actionable, Not Alarming
Every piece of information should lead to something the parent can *do*.

**Avoid:** "Mathematics is flagged red."
**Use:** "Maths needs attention this term. Here's a habit you can try at home tonight."

### 3. Honest, Not Falsely Reassuring
The app never hides problems. A red flag is clearly a red flag. But the framing is constructive, not catastrophic.

**Avoid:** "Everything looks great!" (when it doesn't)
**Avoid:** "This is a serious concern." (alarmist)
**Use:** "This subject needs some attention, and the steps below will help."

### 4. Specific, Not Generic
The AI outputs reference the child's name and specific subjects. Generic advice ("study more") is actively prohibited in the prompt.

## AI Output Rules

| Rule | Example |
|---|---|
| Always name the child | "Aryan is doing well in Science..." |
| Always name the subject | "...but Maths needs attention." |
| Avoid the word "failing" | Use "needs support" or "struggling with" |
| Avoid "bad grades" | Use "lower scores this term" |
| End with a next step | "A good first habit is..." |

## UI Copy

| Element | Tone | Example |
|---|---|---|
| Button labels | Action verbs | "Analyze Report Card", "Save Clarity Check" |
| Empty states | Inviting | "No report cards yet — upload your first one" |
| Error messages | Clear and non-blaming | "Something went wrong. Please try again." |
| Loading messages | Friendly progress | "Reading your report card..." |
| Success messages | Celebratory | "Analysis Complete! 🎉" |

## Disclaimer

All AI-generated content includes a disclaimer:

> *"Use the subject notes below as conversation guidance, not as a diagnosis or prediction."*

This is written into `buildSummary()` in `UploadReport.tsx` and appears at the top of the Clarity Check summary.
