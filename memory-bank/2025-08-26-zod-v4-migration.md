# Zod v4 Migration (initial)

Date: 2025-08-26

Summary:
- Upgraded Zod to v4 across the monorepo (apps/web, packages/ai). Added explicit zod dependency to packages/common and packages/shared.
- Replaced deprecated string format usages:
  - `.string().date()` → `z.iso.date()`
  - `.string().datetime()` → `z.iso.datetime()`
  - `.string().email()` → `z.email()`
- Replaced broad `ZodSchema` type annotations with `ZodTypeAny` where schemas are passed around dynamically.

Files changed (high-level):
- apps/web/app/api/metrics/database-maintenance/route.ts
- packages/shared/utils/zod-date-utils.ts
- packages/shared/utils/zod-date-examples.ts
- packages/ai/workflow/utils.ts
- packages/ai/workflow/tasks/structured-extraction.ts
- packages/common/hooks/use-structured-extraction.ts
- packages/common/components/custom-schema-builder.tsx
- packages/common/components/chat-input/structured-output-button.tsx
- apps/web/package.json, packages/ai/package.json, packages/common/package.json, packages/shared/package.json

Notes:
- Ran `bun install` to update lockfile; formatted changed files and linted only modified paths.
- Full `bun run lint` currently flags existing console.* usage in scripts; not part of this change.
- `bun run build` failed under sandbox constraints; needs full local environment to validate app build.

Next steps:
- Run full lint/build locally and address any pre-existing lint issues if desired.
- Optionally evaluate `zod/mini` in client-only code if further bundle reduction is required.
