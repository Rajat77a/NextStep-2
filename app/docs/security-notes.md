# Security Notes

## Current Security Posture (MVP)

This MVP is a client-side app with localStorage auth. It is **not production-secure** in its current form. Known limitations are documented below with planned mitigations.

## Known Limitations

### 1. API Key Exposed in Client Bundle

**Risk:** Anyone who inspects the built JavaScript bundle or network requests can see `VITE_ANTHROPIC_API_KEY`.

**Current mitigation:** None — this is a demo/MVP.

**Planned fix (v2.0.0):** Move AI calls to a Vercel serverless function. The API key stays in the server environment and never reaches the browser.

### 2. Plaintext Passwords in localStorage

**Risk:** Passwords are stored as plaintext strings in `nextstep_users`. Anyone with access to DevTools can read them.

**Current mitigation:** None.

**Planned fix (v2.0.0):** Replace with Supabase Auth, which uses bcrypt hashing and JWT sessions.

### 3. No Role Enforcement Server-Side

**Risk:** A user can edit localStorage to change their `role` field from `parent` to `admin` and access admin routes.

**Current mitigation:** `ProtectedRoute` checks role client-side, which a motivated attacker can bypass.

**Planned fix (v2.0.0):** Supabase Row Level Security (RLS) policies enforce access at the database level, regardless of what the client sends.

### 4. No CSRF Protection

**Risk:** Not applicable currently (no server API calls from authenticated sessions).

**Planned fix:** Implement CSRF tokens when server-side API is added.

## What Is Secure

- **Parent data isolation:** No UI path exposes one parent's data to another parent. The storage module always filters by `parentId` or `userId`.
- **OCR is client-side:** Report card images are processed entirely in-browser by Tesseract.js. Images never leave the device.
- **No tracking or analytics:** No third-party analytics scripts are loaded.

## Responsible Disclosure

See [`SECURITY.md`](../SECURITY.md) at the repository root.
