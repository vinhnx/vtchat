# Repository Guidelines

## Project Structure & Module Organization

- Monorepo with Turborepo. Top-level workspace folders: `apps/` and `packages/`.
- Web app lives in `apps/web`; shared libraries in `packages/`:
    - `@repo/shared`: types, utils, logger (`@repo/shared/lib/logger`).
    - `@repo/common` and `@repo/ui`: reusable hooks/components.
- Tests live under `apps/web/app/tests/`. Avoid adding debug/test files in repo root.
- Large prebuilt assets (e.g., the PDF.js worker) should be loaded from a CDN, not committed.

## Build, Test, and Development Commands

- Install: `bun install`
- Dev (all apps): `bun dev`
- Build: `bun run build`
- Lint (oxlint): `bun run lint`
- Format Markdown only (Prettier): `bun run format`
- Biome autofix: `bun run biome:format`
- Tests (Vitest via Bun): `bun test` or `bun run test`

## Coding Style & Naming Conventions

- 4-space indentation, single quotes, 100-char line length.
- Components PascalCase; hooks/utils camelCase; file names kebab-case.
- Prefer named exports; centralize custom keys in enums; do not hard-code strings.
- Configuration via environment variables (e.g., `ADMIN_USER_IDS` comma-separated, API keys).
- UI: shadcn/ui principles; neutral palette; minimal icons; typography first.

## Testing Guidelines

- Framework: Vitest with `@testing-library/*` and `@testing-library/jest-dom/vitest`.
- Place tests in `apps/web/app/tests/`; name as `*.test.ts`/`*.test.tsx`.
- Cover critical paths and edge cases; run locally with `bun test`.

## Commit & Pull Request Guidelines

- Do not commit or deploy without approval. Never run `./deploy-fly.sh` without explicit consent.
- PRs should include: clear description, linked issues, screenshots for UI changes, and test notes.
- Run `bun run lint`, `bun run biome:format`, and `bun run build` before opening a PR.

## Security & Configuration Tips

- Bun auto-loads `.env`. Do not check secrets into git.
- Always use the Pino logger: `import { log } from '@repo/shared/lib/logger'`.
- Log with structured metadata: `log.info({ userId }, 'action')`; avoid `console.*`.

## React Best Practices

- For comprehensive `useEffect` best practices, examples, and anti-patterns, see [docs/react-effect.md](./docs/react-effect.md).
