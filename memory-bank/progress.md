# Progress

## What Works

*   The basic monorepo structure is in place.
*   The Next.js application (`apps/web`) is functional.
*   Shared packages (`packages/common`, `packages/shared`, etc.) are being utilized.
*   Initial Memory Bank files have been created.
*   Centralized environment checking utility (`packages/shared/utils/env.ts`) created and implemented in `payment.ts` and `creem.ts`.
*   `apps/web/.env.example` updated with `CREEM_ENVIRONMENT`.

## What's Left to Build (Current Tasks from TODO.md)

**Group 3: Environment and Configuration Cleanup**
*   [x] Remove hardcoded 'production' string comparisons for environment checks.
    *   [x] Implement a robust way to distinguish between sandbox/development and production environments using environment variables (e.g., `CREEM_ENVIRONMENT='sandbox'|'production'` or `NODE_ENV='development'|'production'`).
    *   [x] Update files like `payment.ts` and `creem.ts`.

**Group 4: Authentication and Authorization Changes**
*   [ ] If a user is not logged in, show an alert on tapping the chat input box, prompting them to log in.
*   [ ] Ensure only logged-in users can use the app (potentially with BYOK features, though BYOK itself might be adjusted).
*   [ ] Disable BYOK (Bring Your Own Key) functionality for non-logged-in users. Do not fetch or allow API key input if the user is not authenticated.

**Group 5: UI/UX Simplification & Component Updates**
*   [ ] Update `UserTierBadge` to display plan names based on the `PlanSlug` enum's display text (e.g., `PlanSlug.VT_PLUS` should render as "VT+").
*   [ ] Replace `TextShimmerComponent` with a simple `Label` component (e.g., from shadcn/ui).
*   [ ] Adopt simple shadcn/ui styles and components more broadly.

## Current Status

*   **Overall:** Project refactoring and enhancement effort initiated.
*   **Memory Bank:** Core files created and being updated.
*   **Group 3 Tasks:** Environment variable handling refactored.
*   **Next Task:** Proceed to "Group 4: Authentication and Authorization Changes", starting with "If a user is not logged in, show an alert on tapping the chat input box, prompting them to log in."

## Known Issues

*   No specific code-related issues identified yet, as implementation of the task list has not commenced.
*   The primary "issue" is the list of pending refactoring tasks themselves.

## Evolution of Project Decisions

*   **Initial Decision:** Create all core Memory Bank files before starting on the `TODO.md` tasks. (Completed)
*   **Environment Variables Decision:**
    *   Adopted `NODE_ENV` as the primary driver for `production` vs `development` states.
    *   Introduced `CREEM_ENVIRONMENT` as an optional override, primarily for a `sandbox` state that can behave like non-production even if `NODE_ENV` might be `production` (e.g., in a staging environment that uses production build but sandbox services).
    *   The `packages/shared/utils/env.ts` utility encapsulates this logic: `CREEM_ENVIRONMENT` (if 'sandbox') takes precedence, then `NODE_ENV`.
    *   `getCreemServerIndex()` now returns `0` (production) only if `IS_PRODUCTION` (derived from `CURRENT_ENV`) is true, otherwise `1` (sandbox/dev).
