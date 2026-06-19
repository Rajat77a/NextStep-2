# Vercel Deployment

Step-by-step guide to deploying NextStep·AI on Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com)
- The repository pushed to GitHub (public or private)
- A Claude API key from [console.anthropic.com](https://console.anthropic.com)

## Steps

### 1. Import the Repository

1. Go to [vercel.com/new](https://vercel.com/new).
2. Click **Import Git Repository** and select `Rajat77a/NextStep-2`.
3. Leave the framework preset as **Vite** (auto-detected).

### 2. Add Environment Variables

In the Vercel project settings, add:

| Name | Value |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | Your Claude API key |

### 3. Deploy

Click **Deploy**. Vercel will run `npm run build` and publish the `dist/` folder.

### 4. Verify the SPA Rewrite

The `vercel.json` at the root already contains the rewrite rule:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This ensures React Router handles all paths — without it, direct URL access (e.g. `/parent/upload`) returns a 404.

## Redeployment

Every push to `main` triggers an automatic redeploy. Preview deployments are created for every pull request.

## Custom Domain

In Vercel → **Domains**, add your custom domain and follow the DNS instructions.

## Troubleshooting

| Issue | Fix |
|---|---|
| Blank screen on deep link | Check `vercel.json` has the rewrite rule |
| `VITE_ANTHROPIC_API_KEY` missing | Add it in Vercel → Settings → Environment Variables |
| Build fails | Run `npm run build` locally first to catch TypeScript errors |
