# Gemini Agent Guide (Concise)

This guide is streamlined to reduce context size. Use AGENTS.md for the authoritative repository guidelines.

## Key Practices

- Bun for all tasks; no npm/yarn.
- 4-space indent, single quotes, 100-char line.
- PascalCase components; camelCase hooks/utils; kebab-case files; named exports.
- Use enums for reusable keys; configuration via environment variables only.
- UI follows shadcn/ui minimal principles; neutral palette; minimal icons.

## Structure & Commands

- Apps in `apps/` (Next.js in `apps/web`); shared packages in `packages/` (`@repo/ui`, `@repo/shared`, `@repo/common`).
- Tests live in `apps/web/app/tests/`.
- Common commands: `bun install`, `bun dev`, `bun run build`, `bun run lint`, `bun run biome:format`, `bun test`.

## Deployment & Logging

- Never run `./deploy-fly.sh` without explicit approval.
- Use `log` from `@repo/shared/lib/logger`; avoid `console.*`.

## React Best Practices

- For comprehensive `useEffect` best practices, examples, and anti-patterns, see [docs/react-effect.md](./docs/react-effect.md).

Refer to AGENTS.md for complete details.
