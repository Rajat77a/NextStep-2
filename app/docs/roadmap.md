# Roadmap

This document tracks planned features, improvements, and milestones for NextStep·AI.

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ | Done |
| 🔄 | In progress |
| 📋 | Planned |
| 💡 | Idea (not committed) |

---

## v1.0.0 — MVP ✅

- [x] Parent upload flow (OCR + Claude analysis)
- [x] Clarity Check with per-subject flags
- [x] Conversation Guide
- [x] Teacher Questions
- [x] 30-Day Home Plan
- [x] Progress Tracker
- [x] Teacher portal (classes + patterns)
- [x] Admin portal (classes, students, teachers, subscriptions)
- [x] Role-based auth and protected routes
- [x] Vercel deployment

## v1.1.0 — Bug Fixes ✅

- [x] Fix Upload Report nav button click regression
- [x] Add visible loading messages during AI call
- [x] Surface API errors to user instead of blank screen

---

## v1.2.0 — UX Polish 📋

- [ ] Mobile layout improvements for upload and clarity check pages
- [ ] Animated progress bar during OCR phase
- [ ] Confirm dialog before deleting a report card
- [ ] Toast notifications for save success/failure
- [ ] Keyboard navigation through nav items

## v2.0.0 — Backend Migration 📋

- [ ] Replace localStorage with Supabase (Postgres + Row Level Security)
- [ ] File storage for uploaded report card images/PDFs
- [ ] Server-side AI calls (move API key off client)
- [ ] Real authentication (Supabase Auth / magic link)
- [ ] Multi-device sync

## v2.1.0 — Multi-Child & History 📋

- [ ] Add multiple children per parent account
- [ ] View historical report cards per child
- [ ] Compare term-over-term performance

## v3.0.0 — School Integration 💡

- [ ] School admin can invite parents via email
- [ ] Teacher can push flagged subjects directly to parent
- [ ] PDF export of Clarity Check for parent meetings
- [ ] Email digest: weekly plan progress summary

## Performance & Infrastructure 📋

- [ ] Move to server-side rendering (Next.js) for faster initial load
- [ ] Image compression before OCR to reduce processing time
- [ ] Rate limiting on AI calls per user per day

---

*Last updated: June 2026*
