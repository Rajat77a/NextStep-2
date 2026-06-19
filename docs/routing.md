# Routing

All routes live in `src/App.tsx`. Every portal route is wrapped in `<ProtectedRoute>` which checks authentication and role, then wraps the page in `<PortalLayout>` (adds `<PortalNav>`).

## Public Routes

| Path | Component | Notes |
|---|---|---|
| `/` | `LandingPage` | Marketing / hero page |
| `/login` | `LoginPage` | Redirects to portal if already logged in |
| `/signup` | `SignupPage` | Redirects to portal if already logged in |

## Parent Portal Routes

All require `role === 'parent'`.

| Path | Component |
|---|---|
| `/parent` | `ParentDashboard` |
| `/parent/upload` | `UploadReport` |
| `/parent/clarity` | `ClarityCheck` |
| `/parent/conversation` | `ConversationGuide` |
| `/parent/questions` | `TeacherQuestions` |
| `/parent/plan` | `DayPlan` |
| `/parent/progress` | `ProgressTracking` |
| `/parent/settings` | `ParentSettings` |

## Teacher Portal Routes

All require `role === 'teacher'`.

| Path | Component |
|---|---|
| `/teacher` | `TeacherDashboard` |
| `/teacher/classes` | `TeacherClasses` |
| `/teacher/patterns` | `ClassPatterns` |
| `/teacher/settings` | `TeacherSettings` |

## Admin Portal Routes

All require `role === 'admin'`.

| Path | Component |
|---|---|
| `/admin` | `AdminDashboard` |
| `/admin/classes` | `ClassManagement` |
| `/admin/students` | `StudentRoster` |
| `/admin/teachers` | `TeacherManagement` |
| `/admin/subscription` | `SubscriptionPage` |
| `/admin/settings` | `AdminSettings` |

## Fallback

`*` → `Navigate to="/" replace` — any unmatched route redirects to the landing page.

## Vercel SPA Rewrite

`vercel.json` rewrites all paths to `index.html` so React Router handles client-side navigation on Vercel:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
