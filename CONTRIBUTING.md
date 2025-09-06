# Contributing Guide

Thank you for contributing! This repo uses Bun, a monorepo layout, and shared tooling. Keep changes small, focused, and in line with the standards below.

## Getting Started

- Prereq: Bun installed (latest stable).
- Install: `bun install`
- Dev: `bun dev`
- Build: `bun run build`
- Lint/Format: `bun run lint`, `bun run fmt` (code), `bun run format` (Markdown)
- Test: `bun test`

## Project Structure

- Apps in `apps/` (web app: `apps/web`). Shared packages in `packages/` (`@repo/shared`, `@repo/common`, `@repo/ui`).
- Tests live under `apps/web/app/tests/`.
- Do not commit large binaries; serve large prebuilt assets (e.g., PDF.js worker) from a CDN.

## Code Style

- 4-space indentation, single quotes, 100-char line length.
- Components: PascalCase; hooks/utils: camelCase; files: kebab-case; prefer named exports.
- Centralize custom keys/enums; avoid hard-coded strings; use env vars for config.
- UI: shadcn/ui principles — neutral palette, minimal icons, typography-first.
- React: follow `docs/react-effect.md` for `useEffect` best practices.

## API, Logging, and Errors

- HTTP: use the centralized ky client only.
    - `import { http } from '@repo/shared/lib/http-client'`
    - GET: `await http.get('/api/endpoint')`
    - POST: `await http.post('/api/endpoint', { body: data })`
    - Streaming: `await http.postStream('/api/completion', { body, signal })`
    - API keys: `http.get('/api/endpoint', { apiKeys: { openai: 'sk-...' } })`
- Logging: Pino via `import { log } from '@repo/shared/lib/logger'`; do not use `console.*`.

## Tests

- Write fast, deterministic tests near related code under `apps/web/app/tests/`.
- Cover new logic and regressions. Prefer behavior-focused names.
- Run locally: `bun test`.

## Commits & Branches

- Conventional Commits recommended: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci` with optional scope (`web`, `shared`, `ui`).
    - Example: `feat(web): add chat sidebar`
- Keep commits small and descriptive.

## Pull Requests

- Include summary, rationale, and screenshots for UI changes.
- Ensure `bun run lint`, `bun run fmt`, and `bun test` pass.
- Update docs (README/AGENTS.md/this guide) when behavior changes.
- Link issues and note breaking changes/migrations.

## Security & Deployment

- Never commit secrets; use env vars. Document required envs.
- Do not run `./deploy-fly.sh` without explicit approval.
