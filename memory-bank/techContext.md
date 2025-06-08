# Tech Context

## Technologies Used

*   **Programming Language:** TypeScript
*   **Framework (Frontend & Backend):** Next.js (version likely 13+ due to App Router usage `apps/web/app/`)
*   **UI Library:** React
*   **Styling:** Tailwind CSS
*   **UI Components:** Likely shadcn/ui (mentioned in tasks and `components.json` is typical for shadcn/ui). `packages/ui` likely houses these.
*   **State Management:** Zustand (inferred from `packages/common/store/`)
*   **Data Fetching/Caching (Client-side):** React Query (inferred from `packages/common/context/react-query.tsx`)
*   **ORM:** Drizzle ORM (from `apps/web/drizzle.config.ts`)
*   **Database:** PostgreSQL (common with Drizzle, but not explicitly stated, could be other SQL DBs)
*   **Package Manager:** Likely npm (due to `package-lock.json`) or Bun (due to `bun.lock` - `bun.lock` takes precedence if both exist, indicating Bun is the primary tool). The presence of `bun.lock` strongly suggests Bun.
*   **Monorepo Tool:** Turborepo (from `turbo.json`)
*   **Linting/Formatting:** Prettier (from `.prettierrc`, `.prettierignore`), ESLint (implicitly, standard in Next.js projects).
*   **Authentication:** Current solution likely NextAuth.js (inferred from `apps/web/lib/auth.ts` and common Next.js patterns). Tasks indicate a potential shift or evaluation of "Better-Auth" or "Stack Auth".

## Development Setup

*   **Environment Variables:** Managed via `.env` files (e.g., `apps/web/.env.example`, `apps/web/.env.local`). A key task is to standardize their usage for environment detection.
*   **Local Development Server:** `bun run dev` or `npm run dev` (likely managed by Turborepo scripts defined in `package.json` at the root and within `apps/web`).
*   **Database Migrations:** Drizzle ORM handles schema definitions and migrations.

## Technical Constraints

*   Must maintain compatibility within the monorepo structure.
*   Changes should align with existing TypeScript and React best practices.
*   UI changes aim for simplification and consistency, leveraging shadcn/ui where possible.

## Dependencies

*   Key dependencies are managed in `package.json` files at the root and within each app/package.
*   `packages/common` and `packages/shared` are critical internal dependencies for `apps/web`.
*   External dependencies include Next.js, React, Tailwind CSS, Zustand, React Query, Drizzle ORM, and various UI libraries.

## Tool Usage Patterns

*   **Turborepo:** Used for managing the monorepo, running scripts, and caching builds.
*   **Bun/NPM:** For installing dependencies and running scripts.
*   **Drizzle Kit:** For generating database migrations.
*   **Git:** For version control.
*   **VS Code:** Implied by the environment details provided.
