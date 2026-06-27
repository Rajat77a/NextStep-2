## Session Log — Jun 22

Work session for NextStep.AI bug fix sprint.

### Objectives
- Fix nav Upload Report button dead-click regression
- Add visible loading feedback during AI call
- Surface silent API errors to the user

### Fixes Shipped

**Fix 1 — Upload Button (PortalNav.tsx)**
Added `relative` to the nav `<Link>` className. The `motion.div` active underline was using `absolute bottom-0` without a relative parent, causing it to escape to the `<nav>` bar and overlay sibling links.

**Fix 2 — Loading State (UploadReport.tsx)**
Added a `useEffect` that fires when `loading` becomes true. Immediately shows "Reading your report card…" then switches to "Putting together your guide…" after 2 seconds. Cleans up the timeout on unmount.

**Fix 3 — Error Visibility (UploadReport.tsx)**
Both catch blocks in `handleProcess` and `handleConfirm` now fall back to "Something went wrong. Please try again." instead of being empty or using technical error strings.

### Repo Hygiene Also Shipped
- `.env.example` — documents required API key
- `CONTRIBUTING.md` — commit conventions and PR process
- `CODE_OF_CONDUCT.md`
- `SECURITY.md` — vulnerability reporting policy
- `CHANGELOG.md` — v1.0.0 and v1.1.0 release notes
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/pull_request_template.md`
- `README.md` — full rewrite from Vite boilerplate
