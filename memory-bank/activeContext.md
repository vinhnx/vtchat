# Active Context

## Current Work Focus

The immediate focus is on addressing the tasks outlined in the `TODO.md` file, grouped as:
*   Group 3: Environment and Configuration Cleanup
*   Group 4: Authentication and Authorization Changes
*   Group 5: UI/UX Simplification & Component Updates

## Recent Changes

*   Initial setup of Memory Bank files (`projectbrief.md`, `productContext.md`).

## Next Steps

1.  Create the remaining core Memory Bank files: `systemPatterns.md`, `techContext.md`, and `progress.md`.
2.  Begin addressing tasks from Group 3: Environment and Configuration Cleanup.
    *   Specifically, start with removing hardcoded 'production' string comparisons.

## Active Decisions and Considerations

*   **Environment Variable Strategy:** Decide on a consistent environment variable name (e.g., `CREEM_ENVIRONMENT` or `NODE_ENV`) and its values (e.g., 'sandbox', 'development', 'production'). `NODE_ENV` is a common standard, but `CREEM_ENVIRONMENT` might be preferred if more specific states than development/production are needed in the future.
*   **Authentication Prompts:** Determine the best UX for alerting users to log in (e.g., a non-intrusive toast notification, a modal dialog, or an inline message).
*   **Shadcn/UI Adoption:** Identify specific shadcn/ui components to replace existing ones and plan for consistent styling.

## Important Patterns and Preferences

*   **Memory Bank First:** Always read and update Memory Bank files as per `USER'S CUSTOM INSTRUCTIONS`.
*   **Iterative Approach:** Tackle tasks group by group, and item by item within each group.
*   **Clear Communication:** Document changes and decisions in the Memory Bank and, if necessary, in chat.

## Learnings and Project Insights

*   The project structure involves a monorepo with `apps/web` for the Next.js application and `packages/` for shared code (common components, shared utilities, AI logic, etc.).
*   The `TODO.md` file serves as the primary task list for the current refactoring effort.
