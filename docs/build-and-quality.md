# Build and Quality

## Build

```bash
npm run build
```

Runs Vite's production build pipeline:
1. TypeScript compilation (via `tsc --noEmit` for type checking)
2. Vite bundles and tree-shakes to `dist/`
3. Assets are hashed for cache busting

Output in `dist/`:
- `index.html`
- `assets/*.js` (bundled + minified)
- `assets/*.css` (Tailwind purged + minified)

## Preview Production Build

```bash
npm run preview
```

Serves `dist/` locally at `http://localhost:4173`. Use this to verify the production build before deploying.

## Type Checking

TypeScript is configured in strict mode (`tsconfig.app.json`):

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

Run type check only (no emit):

```bash
npx tsc --noEmit
```

## Linting

ESLint is configured in `eslint.config.js` with:
- `@typescript-eslint/recommended` rules
- React-specific rules

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

## Bundle Analysis

To inspect what's in the production bundle:

```bash
npx vite-bundle-visualizer
```

Known large dependencies:
| Package | Approx bundle size |
|---|---|
| `tesseract.js` | ~2 MB (WASM loaded lazily on first use) |
| `framer-motion` | ~100 KB |
| `@anthropic-ai/sdk` | ~50 KB |

## CI (Planned)

A GitHub Actions workflow for automated build + lint on every PR is planned for v1.2.0. See [`.github/`](../.github/) for templates.
