# Dependency Notes

Key third-party packages used in NextStep·AI, their purpose, and version constraints.

## Runtime Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.3 | UI component library |
| `react-dom` | ^18.3 | DOM renderer for React |
| `react-router-dom` | ^6.x | Client-side routing |
| `framer-motion` | ^11.x | Page transitions and micro-animations |
| `lucide-react` | ^0.x | Icon library (consistent SVG icons) |
| `@anthropic-ai/sdk` | ^0.x | Claude API client |
| `tesseract.js` | ^5.x | Client-side OCR engine (report card text extraction) |
| `clsx` | ^2.x | Conditional className utility |
| `tailwind-merge` | ^2.x | Merge Tailwind classes without conflicts |

## Dev Dependencies

| Package | Purpose |
|---|---|
| `vite` | Build tool and dev server with HMR |
| `@vitejs/plugin-react` | React Fast Refresh integration for Vite |
| `typescript` | Static type checking |
| `tailwindcss` | Utility-first CSS framework |
| `postcss` + `autoprefixer` | Tailwind processing pipeline |
| `eslint` | Linting (TypeScript-aware rules) |
| `@types/react` | TypeScript definitions for React |

## Notes

### Tesseract.js

Tesseract.js runs OCR entirely in the browser using WebAssembly — no server needed. On first use, it downloads the English language model (~7 MB). Subsequent uses load from the browser cache.

- Large PDFs with many pages can be slow — advise users to upload single-page or small multi-page PDFs.
- Very low-resolution images (< 150 DPI) may produce poor OCR results.

### Framer Motion

Used for:
- Page entrance animations (`initial={{ opacity: 0, y: 16 }}`)
- Shared layout animations (`layoutId="activeNav"` in PortalNav)
- AnimatePresence for route transitions and modal-style reveals

### `@anthropic-ai/sdk`

The SDK is used in `src/api/analysis.ts` to call Claude. The API key is read from `import.meta.env.VITE_ANTHROPIC_API_KEY`.

**Important:** Never commit an actual API key to the repository. The `.env` file is in `.gitignore`. Use `.env.example` to document required variables.

### Upgrading Dependencies

Before upgrading any major version:
1. Check the package's migration guide.
2. Run `npm run build` to catch type errors.
3. Test all three portals manually (see `manual-qa.md`).
