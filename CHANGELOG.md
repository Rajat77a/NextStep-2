# Changelog

All notable changes to NextStep·AI are documented here.
This project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Planned
- Backend API (Supabase or Firebase) to replace localStorage
- Multi-child support per parent account
- Email digest of weekly plan progress
- PDF export of Clarity Check

---

## [1.2.0] - 2026-07-08

### Added
- **Landing page scroll animations** — cohesive system across all sections.
- **Hero video crossfade playlist** — 3 Pixabay CC0 education clips with 5s auto-advance, AnimatePresence crossfade, and preload for zero gaps.
- **Hero right card iterations** — Multiple rounds: AnimatedClarityCheck product demo, AmbientHeroCard (rejected), solid dark card (rejected), GlowTiltCard heart card, realistic report card grade table (current).
- **Scroll animations system** — Per-section exit transforms (opacity, scale, blur, rotateY, slide), scroll-linked step card entrances, parallax shapes, ambient gradient shifts.
- **Scroll progress bar** — 2px fixed bar at viewport top, coral-to-sage gradient.
- **Feature demo parallax** — Scroll-linked Y drift on AnimatedClarityCheck/Conversation/DayPlan cards.

### Fixed
- **Hero blur** — Ref-based `filter: blur()` via `on('change')` to bypass framer-motion v12 style prop issue.

---



---

## [1.1.0] - 2026-06-22

### Fixed
- **Upload button** — added `relative` positioning to nav Link so the active-underline `motion.div` stays inside its parent and no longer blocks sibling nav items from receiving clicks.
- **Loading state** — added two-phase loading message (`"Reading your report card..."` → `"Putting together your guide..."`) with a 2-second auto-switch so users always see feedback during the AI call.
- **Error visibility** — replaced silent failures with a user-facing `"Something went wrong. Please try again."` fallback in both the analyse and save flows.

---

## [1.0.0] - 2026-06-19

### Added
- Parent portal: Upload Report Card (OCR + Claude AI analysis)
- Parent portal: Clarity Check (structured subject flags)
- Parent portal: Conversation Guide (personalised scripts)
- Parent portal: Teacher Questions generator
- Parent portal: 30-Day Home Plan
- Parent portal: Progress Tracker
- Teacher portal: Dashboard, My Classes, Class Patterns
- Admin portal: Dashboard, Class Management, Student Roster, Teacher Management, Subscriptions
- Shared: PortalNav with role-based navigation
- Shared: FlagBadge (green / yellow / red)
- Authentication: login, signup, protected routes by role
- Vercel deployment with `vercel.json` SPA rewrite rule


