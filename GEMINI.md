# Gemini Agent Guide (Concise)

This guide is streamlined to reduce context size. Use AGENTS.md for the authoritative repository guidelines.

## Key Practices

- Bun for all tasks; no npm/yarn.
- 4-space indent, single quotes, 100-char line.
- PascalCase components; camelCase hooks/utils; kebab-case files; named exports.
- Use enums for reusable keys; configuration via environment variables only.
- UI follows shadcn/ui minimal principles; neutral palette; minimal icons.

## HTTP Client Guidelines

- **Use ky HTTP client only**: `import { http } from '@repo/shared/lib/http-client'`
- **Never use fetch directly** - bypasses security and standardization
- GET: `const data = await http.get('/api/endpoint')`
- POST: `const result = await http.post('/api/endpoint', { body: data })`
- Streaming: `const response = await http.postStream('/api/completion', { body, signal })`
- API keys: `http.post('/api/external', { body, apiKeys: { openai: 'sk-...' } })`

## Structure & Commands

- Apps in `apps/` (Next.js in `apps/web`); shared packages in `packages/` (`@repo/ui`, `@repo/shared`, `@repo/common`).
- Tests live in `apps/web/app/tests/`.
- Common commands: `bun install`, `bun dev`, `bun run build`, `bun run lint`, `bun run fmt`, `bun test`.

## Deployment & Logging

- Never run `./deploy-fly.sh` without explicit approval.
- Use `log` from `@repo/shared/lib/logger`; avoid `console.*`.

## React Best Practices

- For comprehensive `useEffect` best practices, examples, and anti-patterns, see [docs/react-effect.md](./docs/react-effect.md).

Refer to AGENTS.md for complete details.

## URL Context + Grounding (Gemini)

When your prompt contains one or more URLs, the Gemini web search task automatically enables Google’s URL Context tool alongside Google Search grounding. The model retrieves content from those URLs (if supported and safe) and uses it to enhance the answer. Retrieved URLs are surfaced in the Sources stack when available.

Notes

- Works with Gemini 2.5 family used for web search (Flash, Pro, Flash Lite).
- Up to 20 URLs per request; unsupported/paywalled URLs are skipped by Google.
- Retrieved content counts toward input tokens per Google pricing/limits.
