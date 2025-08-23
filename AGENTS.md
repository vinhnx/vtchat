# Repository Guidelines

## Project Structure & Module Organization

- Apps live in `apps/` (web app in `apps/web`). Shared code in `packages/` (`@repo/shared`, `@repo/common`, `@repo/ui`).
- Tests reside under `apps/web/app/tests/`.
- Do not commit large binaries; load large prebuilt assets (e.g., PDF.js worker) from a CDN.

## Build, Test, and Development Commands

- Install deps: `bun install`
- Start dev server: `bun dev`
- Build all apps/packages: `bun run build`
- Lint codebase: `bun run lint`
- Type-aware lint: `bun run lint:type-aware`
- Format Markdown: `bun run format`
- Code format (dprint): `bun run fmt`
- Run tests: `bun test`

## Coding Style & Naming Conventions

- Indentation: 4 spaces; quotes: single; max line length: 100 chars.
- Components: PascalCase. Hooks/utils: camelCase. File names: kebab-case. Prefer named exports.
- Centralize custom keys/enums; avoid hard-coded strings; use environment variables for configuration.
- UI: shadcn/ui principles — neutral palette, minimal icons, typography-first.

## API, Logging, and Errors

- HTTP: always use the shared ky client, not `fetch`.
  - Example: `import { http } from '@repo/shared/lib/http-client'`
  - GET: `await http.get('/api/endpoint')`
  - POST: `await http.post('/api/endpoint', { body: data })`
  - Streaming: `await http.postStream('/api/completion', { body, signal })`
- Logging: use Pino via `import { log } from '@repo/shared/lib/logger'`; log structured metadata, not `console.*`.

## Testing Guidelines

- Runner: `bun test`. Place tests under `apps/web/app/tests/`.
- Add tests for new logic and regressions. Keep tests fast and deterministic.
- Prefer clear, behavior-focused test names; group by feature or route.

## Commit & Pull Request Guidelines

- Commits: concise, imperative; prefer Conventional Commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`) with optional scope (`web`, `shared`, `ui`).
  - Example: `feat(web): add chat sidebar`
- PRs: include a descriptive summary, linked issues, and screenshots for UI changes. Ensure lint, format, and tests pass; update docs when behavior changes.

## Security & Deployment

- Keep secrets in env vars; never commit keys. Inject API keys via the HTTP client options when required.
- Deployment: never run `./deploy-fly.sh` without explicit approval.
