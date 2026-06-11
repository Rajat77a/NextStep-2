# Contributing to NextStep·AI

Thank you for taking the time to contribute! This guide covers the conventions we use.

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>
```

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `chore` | Tooling, config, or dependency updates |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style` | Formatting, missing semi-colons, etc. |
| `test` | Adding or updating tests |

## Pull Request Process

1. Fork the repository and create a branch from `main`.
2. Make your changes — keep PRs focused and small.
3. Ensure the app builds (`npm run build`) without errors.
4. Open a PR with a clear title and description.
5. Wait for review — we aim to respond within 48 hours.

## Code Style

- TypeScript strict mode is enabled — avoid `any` where possible.
- Use the existing Tailwind class tokens (see `tailwind.config.js`).
- Keep components focused. If a component exceeds ~200 lines, consider splitting it.

## Reporting Bugs

Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) issue template.

## Requesting Features

Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) issue template.

