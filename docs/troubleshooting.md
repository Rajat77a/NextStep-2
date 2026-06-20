# Troubleshooting

Common issues and how to fix them.

---

## The "Upload Report" nav button does nothing when clicked

**Fixed in v1.1.0.** The active-underline `motion.div` was using `absolute` positioning without a `relative` parent on the `<Link>`, causing it to escape the link boundary and overlay sibling nav items.

If you're on an older version, pull the latest `main` branch:

```bash
git pull origin main
```

---

## The screen goes blank after uploading a file

**Fixed in v1.1.0.** This was caused by the AI call taking time with no visible feedback.

A loading indicator now appears immediately with the message `"Reading your report card..."`, switching to `"Putting together your guide..."` after 2 seconds.

---

## "Something went wrong. Please try again." error

This means either the OCR step or the Claude AI call failed. Common causes:

| Cause | Fix |
|---|---|
| `VITE_ANTHROPIC_API_KEY` not set | Copy `.env.example` to `.env` and add your key |
| API key is invalid or expired | Generate a new key at console.anthropic.com |
| File is corrupted | Try uploading a different image or PDF |
| Rate limit hit on Claude | Wait 60 seconds and try again |
| Image is too blurry for OCR | Use a clearer scan or photo |

---

## `npm run dev` fails with "Cannot find module"

Run:

```bash
npm install
```

If that doesn't fix it, delete `node_modules` and reinstall:

```bash
rm -rf node_modules
npm install
```

---

## App shows blank screen after login on Vercel

Vercel needs a rewrite rule for the React Router SPA. Ensure `vercel.json` exists at the root with:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## LocalStorage is full / data is not saving

This MVP uses browser localStorage (5 MB limit). If you've uploaded many report cards:

1. Open DevTools → Application → Local Storage.
2. Clear old entries prefixed with `nextstep_`.

A database backend is planned in v2.0.0.

---

## TypeScript errors on build

Run:

```bash
npm run build
```

If you see type errors, check that you haven't modified `src/types/index.ts` without updating callers. The project uses strict TypeScript — `any` casts should be avoided.
