# Empty States

Every list or data view in the app has an empty state. This document catalogues each one.

## Design Pattern

All empty states follow the same structure:

```
[Icon — muted colour]
[Primary message — what's missing]
[Secondary message or CTA link — what to do next]
```

## Parent Portal

| Page | Trigger | Icon | Primary message | CTA |
|---|---|---|---|---|
| Dashboard — Report Cards | No report cards for any child | `FileText` | "No report cards yet" | "Upload your first →" (links to `/parent/upload`) |
| Dashboard — Clarity Check preview | No clarity check | — | Hidden (section not rendered) | — |
| Clarity Check | No clarity check for this parent | `ClipboardCheck` | "No Clarity Check yet" | "Upload a report card" (links to `/parent/upload`) |
| Conversation Guide | No clarity check | `MessageCircle` | "No conversation guide yet" | "Upload a report card" |
| Teacher Questions | No clarity check | `HelpCircle` | "No questions yet" | "Upload a report card" |
| 30-Day Plan | No plan | `Calendar` | "No plan yet" | "Upload a report card" |
| Progress Tracking | No progress record | `TrendingUp` | "No plan in progress" | "Start with a report card" |

## Teacher Portal

| Page | Trigger | Icon | Primary message |
|---|---|---|---|
| My Classes | No classes assigned | `Users` | "No classes assigned yet" |
| Class Patterns | No students with flags | `BarChart3` | "No data yet for this class" |

## Admin Portal

| Page | Trigger | Icon | Primary message |
|---|---|---|---|
| Student Roster | No students | `Users` | "No students added yet" |
| Class Management | No classes | `BookOpen` | "No classes created yet" |
| Teacher Management | No teachers | `School` | "No teachers added yet" |

## Consistency Rules

- Empty state containers use `text-center py-10` or `py-12`.
- Icons are sized `40px` and coloured `text-light-gray`.
- Primary message: `font-body text-medium-gray`.
- CTA: `text-coral font-semibold font-body text-sm hover:underline`.
