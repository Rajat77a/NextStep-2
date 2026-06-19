# Environment Variables

NextStep·AI uses Vite environment variables. All variables must be prefixed with `VITE_` to be accessible in the browser bundle.

## Setup

```bash
cp .env.example .env
```

Edit `.env` and fill in the values below.

## Variables

### `VITE_ANTHROPIC_API_KEY`

**Required.** Your Claude API key from [console.anthropic.com](https://console.anthropic.com).

```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

> ⚠️ **Security Note:** This key is included in the client bundle and visible to anyone who inspects the network requests. For production, move AI calls to a server-side function (e.g., a Vercel serverless function or an Express API). See [`future-backend.md`](./future-backend.md).

## Checking Variables in Dev

Vite exposes environment variables via `import.meta.env`:

```ts
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
```

If `apiKey` is `undefined`, the `.env` file is missing or the variable name doesn't start with `VITE_`.

## Vercel Deployment

Add the variable in the Vercel project settings under **Settings → Environment Variables**. You do not need to commit `.env` to the repository (and should not — it is in `.gitignore`).

| Variable | Environment |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | Production, Preview, Development |
