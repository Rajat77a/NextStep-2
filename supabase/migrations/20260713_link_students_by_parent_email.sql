-- Link school-created students to parent accounts by email.
-- Admins can enter parent_email before the parent has an auth user id.
-- When the matching parent signs in, the app claims those rows by setting user_id = auth.uid().

alter table public.students
  add column if not exists parent_email text;

create index if not exists students_parent_email_idx
  on public.students (lower(parent_email));

drop policy if exists "Parents can read students linked by email" on public.students;
create policy "Parents can read students linked by email"
  on public.students
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or lower(parent_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "Parents can claim students linked by email" on public.students;
create policy "Parents can claim students linked by email"
  on public.students
  for update
  to authenticated
  using (
    lower(parent_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (
    user_id = auth.uid()
    and lower(parent_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
