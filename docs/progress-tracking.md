# Progress Tracking

The Progress Tracking page (`/parent/progress`) gives parents a visual summary of how many plan habits they've completed.

## Completion Rate Formula

```
completionRate = Math.round((completedCount / totalCount) * 100)
```

Where:
- `completedCount` = number of `PlanProgressItem` entries where `completed === true`
- `totalCount` = total number of `PlanProgressItem` entries for that `PlanProgress` record

## Display

| Element | Description |
|---|---|
| Circular or bar progress indicator | Shows `completionRate` as a percentage |
| Week filter tabs | Filter habit list by Week 1 / 2 / 3 / 4 |
| Habit list | Checkboxes with habit text; completed items struck through |
| "Keep Going" / "All done!" message | Contextual encouragement based on completion rate |

## Encouragement Messages

| Rate | Message |
|---|---|
| 0% | "Start with Week 1 — just one habit a day." |
| 1–33% | "You've made a start — keep it up!" |
| 34–66% | "You're halfway there. Great consistency!" |
| 67–99% | "Almost done — one final push!" |
| 100% | "Plan complete! 🎉 Consider uploading the next report card." |

## State Persistence

Progress is stored in `nextstep_plan_progress` localStorage. Every toggle of a habit checkbox calls `updatePlanProgress()` which:

1. Finds the matching `PlanProgress` by `clarityCheckId`.
2. Flips `item.completed`.
3. Recalculates `completionRate`.
4. Saves back to localStorage.

## Dashboard Integration

The `completionRate` is read by `ParentDashboard` to power the progress bar in the summary strip at the top of the dashboard.

## Related Docs

- [`day-plan.md`](./day-plan.md)
- [`data-model.md`](./data-model.md)
