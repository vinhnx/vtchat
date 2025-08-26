# Summary

Briefly describe the problem and the solution. Mention scope and rationale.

## Type of change

- [ ] feat
- [ ] fix
- [ ] chore
- [ ] refactor
- [ ] docs
- [ ] test
- [ ] ci

## Changes

-

## Screenshots / Recordings

Attach before/after for UI changes.

## How to Test

1.
2.

## Affected Areas

List impacted apps/packages (e.g., `apps/web`, `@repo/shared`).

## Checklist

- [ ] Conventional Commit message (e.g., `feat(web): add chat sidebar`)
- [ ] Lint passes: `bun run lint`
- [ ] Code formatted: `bun run fmt` (code), `bun run format` (Markdown)
- [ ] Tests added/updated under `apps/web/app/tests/` and `bun test` passes
- [ ] No direct `fetch`; uses `@repo/shared/lib/http-client`
- [ ] Logging via `@repo/shared/lib/logger` (no `console.*`)
- [ ] No large binaries; prebuilt assets served from CDN
- [ ] Docs updated as needed (README/AGENTS.md/CONTRIBUTING.md)
- [ ] No secrets committed; env vars documented
- [ ] Did not run `./deploy-fly.sh`
