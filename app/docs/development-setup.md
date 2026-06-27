# Development Setup

Complete guide for setting up the NextStep·AI development environment.

## Requirements

| Tool | Version |
|---|---|
| Node.js | 18.x or higher |
| npm | 9.x or higher |
| Git | Any recent version |

Check your versions:

```bash
node --version
npm --version
```

## Clone and Install

```bash
git clone https://github.com/Rajat77a/NextStep-2.git
cd NextStep-2
npm install
```

## Environment Setup

```bash
cp .env.example .env
```

Open `.env` and set:

```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

## Start Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Hot Module Replacement (HMR) is enabled — changes in `src/` reflect instantly without a full page reload.

## Available Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check + compile to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Recommended VS Code Extensions

- **ESLint** — `dbaeumer.vscode-eslint`
- **Tailwind CSS IntelliSense** — `bradlc.vscode-tailwindcss`
- **Prettier** — `esbenp.prettier-vscode`
- **TypeScript + JS** — built in

## TypeScript Config

The project uses two tsconfig files:

| File | Purpose |
|---|---|
| `tsconfig.app.json` | App source (`src/`) — strict mode on |
| `tsconfig.node.json` | Vite config file |

Path alias `@/` maps to `src/` — use it for all internal imports.

## Linting

ESLint is configured in `eslint.config.js` with TypeScript-aware rules. Run before committing:

```bash
npm run lint
```
