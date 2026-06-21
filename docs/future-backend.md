# Future Backend

This document describes the planned migration from localStorage to a real backend (Supabase).

## Why Migrate?

| Current (localStorage) | After Migration (Supabase) |
|---|---|
| Data lost if browser clears storage | Data persisted in PostgreSQL |
| Single device only | Multi-device sync |
| No server-side auth | Bcrypt passwords + JWT sessions |
| API key exposed in client bundle | API key on server only |
| No file storage | Report card images in Supabase Storage |
| No email features | Email digests via Supabase Edge Functions |

## Planned Stack

| Layer | Technology |
|---|---|
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (magic link + email/password) |
| File storage | Supabase Storage (private buckets) |
| Server-side AI | Vercel serverless function (Next.js API routes) |
| ORM | Supabase JS client |

## Migration Plan

### Phase 1: Auth (v2.0.0)

1. Replace `useAuth` + localStorage auth with Supabase Auth.
2. Add email/password sign-up and magic link login.
3. Store JWT in httpOnly cookie (not localStorage).

### Phase 2: Database (v2.0.0)

1. Create Postgres tables matching the current data model (see `data-model.md`).
2. Add Row Level Security policies:
   - Parents can only read/write their own students and reports.
   - Teachers can read students in their assigned classes.
   - Admins have full read access within their school.
3. Replace all `storage.get*` / `storage.set*` calls with Supabase JS client queries.

### Phase 3: File Storage (v2.0.0)

1. Create a private Supabase Storage bucket: `report-cards`.
2. Upload report card images directly from the browser to the bucket.
3. Store the object path in `ReportCard.fileUrl`.
4. Generate signed URLs for viewing uploaded files.

### Phase 4: Server-side AI (v2.1.0)

1. Create a Vercel API route: `POST /api/analyze`.
2. Move the `analyzeReportText()` call and the Anthropic API key to this route.
3. The client sends the extracted OCR text; the server returns the analysis JSON.
4. Remove `VITE_ANTHROPIC_API_KEY` from client environment.

## Schema (Supabase)

```sql
-- Users managed by Supabase Auth (auth.users)

create table students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  parent_id uuid references auth.users(id),
  class_id uuid,
  created_at timestamptz default now()
);

create table report_cards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id),
  term text,
  board_type text,
  file_url text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table students enable row level security;
create policy "Parents see own students"
  on students for all
  using (parent_id = auth.uid());
```
