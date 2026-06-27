# Release Checklist

Use this checklist before merging to `main` and deploying to production.

## Code Quality

- [ ] `npm run build` passes with no TypeScript errors
- [ ] `npm run lint` passes with no ESLint errors
- [ ] No `console.log` statements left in source files
- [ ] No `TODO` comments blocking the release

## Manual QA (see `manual-qa.md`)

- [ ] Upload flow: file validation, child selection, analysis, save, redirect
- [ ] Clarity Check page loads with correct data
- [ ] Conversation Guide content visible
- [ ] Teacher Questions content visible
- [ ] 30-Day Plan content visible and interactive
- [ ] Progress Tracker updates completion rate on checkbox toggle
- [ ] All nav links work in desktop and mobile
- [ ] Login, signup, and logout work correctly
- [ ] Protected routes redirect unauthenticated users to `/login`
- [ ] Protected routes redirect wrong-role users to `/`

## Error States

- [ ] Upload with missing API key shows "Something went wrong. Please try again."
- [ ] Upload with blurry/unreadable image shows OCR error message
- [ ] Network failure shows user-facing error (not blank screen)

## Environment

- [ ] `.env` is NOT committed to the repository (check `.gitignore`)
- [ ] `VITE_ANTHROPIC_API_KEY` is set in Vercel environment variables
- [ ] `vercel.json` SPA rewrite rule is present

## Vercel Deployment

- [ ] `npm run build` output (`dist/`) is clean
- [ ] Vercel preview deployment passes all manual QA checks
- [ ] Custom domain (if any) is configured and resolves correctly

## Documentation

- [ ] `CHANGELOG.md` updated with release notes for this version
- [ ] Any new environment variables added to `.env.example`
- [ ] Any new routes added to `docs/routing.md`

## Post-Deploy

- [ ] Open the production URL and run a smoke test (login → upload → clarity check)
- [ ] Check browser console for runtime errors
- [ ] Verify the nav "Upload Report" button navigates correctly
