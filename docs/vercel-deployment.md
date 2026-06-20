# Vercel Deployment Notes

NextStep.AI is designed to deploy as a Vite single-page app.

Expected Vercel settings:

- Framework preset: Vite
- Install command: npm install
- Build command: npm run build
- Output directory: dist
- Root directory: repository root

The project includes a `vercel.json` rewrite so deep links route back through the React app.

