# Project Rules for AI Agents

## Mandatory Workflow

After EVERY code change, you MUST follow these steps in order:

### Step 1 — Update MyBrain
Update the relevant notes in `C:\Users\rajat\OneDrive\ドキュメント\MyBrain\`:

| File | When to Update |
|---|---|
| `NextStep Commit Log.md` | ALWAYS — add commit entry (hash, date, message, notes). Use `(pending)` as hash if committing later. |
| `NextStep Master Log.md` | ALWAYS — add to Timeline (new phase or update existing). Update Key Lessons if applicable. |
| `NextStep Debug Patterns.md` | If fixing a bug — add as a new Karpathy-style pattern entry. |
| `NextStep Open Issues.md` | If resolving or discovering an issue. |
| `NextStep AI Pipeline.md` | If changing the AI pipeline architecture. |
| `NextStep Upload Report AI Flow.md` | If changing the upload/OCR flow. |
| `NextStep Nav Tabs Wired.md` | If changing tab rendering or data contract. |
| `NextStep Supabase Migration Details.md` | If changing Supabase schema, auth, or data layer. |
| `NextStep Supabase.md` | If changing Supabase config or project details. |

### Step 2 — Commit & Deploy
1. `git add` the changed files
2. `git commit` with a descriptive message
3. Update the pending hash in MyBrain files to the actual commit hash
4. `git fetch origin` to check for remote changes
5. `git rebase origin/main` if remote is ahead
6. `git push origin main` — triggers Vercel auto-deploy

## Critical Code Patterns (Never Break These)

### Logout — Navigate BEFORE SignOut
In `logout()` functions, `window.location.href` MUST run BEFORE `apiLogout()`.
Wrong: `await apiLogout(); window.location.href = '/login'` — causes landing page flash.
Right: `window.location.href = '/login'; await apiLogout()` — navigates immediately, Supabase SIGNED_OUT event has no visible effect.
