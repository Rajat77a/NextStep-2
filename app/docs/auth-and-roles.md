# Auth and Roles

NextStep·AI uses a simple client-side auth model backed by localStorage for the MVP.

## How Auth Works

### Sign Up

`SignupPage` collects `fullName`, `email`, `password`, and `role`. On submit:

1. Checks that the email isn't already registered.
2. Creates a `User` object and saves it to `nextstep_users` in localStorage.
3. Sets the current user in `nextstep_current_user`.
4. Redirects to the role-specific portal (`/parent`, `/teacher`, or `/admin`).

### Log In

`LoginPage` looks up the email in `nextstep_users`, checks the password, and sets `nextstep_current_user`.

### Log Out

The `logout()` function in `useAuth` removes `nextstep_current_user` and redirects to `/`.

### Session Persistence

The current user is read from localStorage on every page load in the `useAuth` hook. The session persists across browser refreshes until the user logs out.

## Roles

| Role | Portal prefix | What they see |
|---|---|---|
| `parent` | `/parent` | Their own children's data and AI outputs |
| `teacher` | `/teacher` | Class-level patterns for assigned classes |
| `admin` | `/admin` | All students, teachers, classes, subscriptions |

## Protected Routes

`ProtectedRoute` in `App.tsx`:

1. Shows a spinner while `useAuth` is loading.
2. Redirects to `/login` if no user is found.
3. Redirects to `/` if the user's role is not in `allowedRoles`.
4. Otherwise, wraps children in `<PortalLayout>`.

## Security Limitations (MVP)

Because this is client-side localStorage auth:

- Passwords are stored in plaintext — **not suitable for production**.
- Any user can edit localStorage to impersonate another role.
- There is no token expiry.

v2.0.0 will replace this with Supabase Auth (bcrypt password hashing, JWT sessions).
