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

## Commands

- Install: `bun install`
- Dev: `bun dev`
- Build: `bun run build`
- Lint: `bun run lint`
- Format (Markdown only): `bun run format`
- Biome format: `bun run biome:format`
- Tests: `bun test`

## Deployment Policy

- Never run `./deploy-fly.sh` without explicit approval.

## Logging & Error Handling

- Use Pino: `import { log } from '@repo/shared/lib/logger'`.
- Log with structured metadata; avoid `console.*`.

For details and examples, follow AGENTS.md.
