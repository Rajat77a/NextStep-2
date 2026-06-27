# Teacher Portal

The teacher portal (`/teacher/*`) gives class teachers a view of their students' report card flag patterns.

## Pages

### Dashboard (`/teacher`)

Welcome screen with a summary of assigned classes and any recent flag activity.

### My Classes (`/teacher/classes`)

Lists all classes assigned to the logged-in teacher. Each class card shows:
- Class name and grade level
- Number of students
- Flag summary (green / yellow / red counts across latest reports)

### Class Patterns (`/teacher/patterns`)

Aggregated view across the teacher's classes. Shows:
- Per-subject flag distribution (e.g., "8 students have a red flag in Maths")
- Helps teachers identify class-wide weak spots — not individual students

### Settings (`/teacher/settings`)

Account settings (name, email, password — MVP: UI only).

## Data Access

Teachers can see:
- ✅ Student names in their assigned classes
- ✅ Aggregated flag counts per subject
- ✅ Individual student flag breakdown (per subject)
- ❌ Parent notes, conversation scripts, or 30-day plans (private to parent)

## Privacy Boundary

The teacher view is aggregated intentionally. The goal is to help teachers improve class-level teaching, not to monitor individual parents' responses to report cards.

## Related Docs

- [`auth-and-roles.md`](./auth-and-roles.md)
- [`privacy-notes.md`](./privacy-notes.md)
- [`data-model.md`](./data-model.md)
