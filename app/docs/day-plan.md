# 30-Day Home Plan

The Day Plan page (`/parent/plan`) shows the AI-generated 30-day habit plan and lets parents track completion.

## Structure

The plan is divided into 4 weeks. Each week has one or more habits — small, specific actions the parent can take at home.

```
Week 1 — Foundation habits (easy wins)
Week 2 — Reinforcement
Week 3 — Consolidation
Week 4 — Independence building
```

## Data Model

```ts
ThirtyDayPlanItem {
  week: 1 | 2 | 3 | 4
  habit: string   // e.g. "Read together for 15 minutes before bed"
  rationale?: string  // why this habit helps
}
```

The AI generates 8–12 habits distributed across the 4 weeks, calibrated to the child's flagged subjects.

## Progress Tracking

Each habit maps to a `PlanProgressItem`:

```ts
{
  text: string      // copy of the habit text
  completed: boolean
  week: number
}
```

`PlanProgress.completionRate` is calculated as:

```
completionRate = (completedItems / totalItems) * 100
```

This value is shown on the Parent Dashboard progress bar.

## Interaction

- Parents check off habits using a checkbox or toggle.
- Checking triggers `updatePlanProgress()` which recalculates `completionRate`.
- Completed habits are visually struck through or greyed out.

## AI Habit Guidelines (for prompt authors)

Each habit should:
- Be completable in 15–30 minutes per day
- Require no special materials or tutoring
- Involve the parent and child doing something *together*
- Reference the specific subject where relevant (e.g., "Practice multiplication tables for 10 minutes using flashcards")

## Related Docs

- [`progress-tracking.md`](./progress-tracking.md)
- [`data-model.md`](./data-model.md)
