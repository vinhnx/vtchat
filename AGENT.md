# Agent Guide (Concise)

This file is intentionally short to reduce context size. For the complete contributor guide, see AGENTS.md.

## Quick Standards

- Use Bun for all scripts and package tasks.
- 4-space indentation, single quotes, 100-char line length.
- PascalCase components; camelCase hooks/utils; kebab-case files; prefer named exports.
- Centralize custom keys in enums; avoid hard-coded strings; use environment variables for config.
- UI: shadcn/ui principles; neutral palette; minimal icons; typography-first.

## Project Structure

- Apps in `apps/` (web app in `apps/web`); shared code in `packages/` (`@repo/shared`, `@repo/common`, `@repo/ui`).
- Tests live under `apps/web/app/tests/`.
- Load large prebuilt assets like the PDF.js worker from a CDN instead of committing binaries.

## Commands

- Install: `bun install`
- Dev: `bun dev`
- Build: `bun run build`
- Lint: `bun run lint`
- Format (Markdown only): `bun run format`
- Code format: `bun run fmt` (dprint)
- Tests: `bun test`

## Deployment Policy

- Never run `./deploy-fly.sh` without explicit approval.

## Logging & Error Handling

- Use Pino: `import { log } from '@repo/shared/lib/logger'`.
- Log with structured metadata; avoid `console.*`.

## React Best Practices

- For comprehensive `useEffect` best practices, examples, and anti-patterns, see [docs/react-effect.md](./docs/react-effect.md).

For details and examples, follow AGENTS.md.
