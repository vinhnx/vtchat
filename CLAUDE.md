# CLAUDE.md - Project Guide for VTCHAT

This file provides essential information for working on the VTCHAT project. Its accuracy and completeness are vital as my memory resets between sessions.

## 1. Common Bash Commands

Referenced from `AGENT.MD`:

- **Dev Server**: `bun dev` (starts Turborepo development server for all apps/packages)
- **Build Project**: `bun run build` (Turborepo build)
- **Lint Code**: `bun run lint` (Turborepo lint)
- **Format Code**: `bun run format` (Prettier write)
- **Check Formatting**: `bun run format:check`
- **Database Migrations (Drizzle Kit)**:
  - `cd apps/web && bun run db:generate` (generates migration SQL based on schema changes)
  - `cd apps/web && bun run db:migrate` (applies pending migrations to the database)
  - `cd apps/web && bun run db:studio` (opens Drizzle Studio)

## 2. Core Project Information

### Key Project Goals & Focus Areas (from Memory Bank)

- **Overall Aim**: Refactor and enhance the web application for better maintainability, UX, and developer efficiency.
- **Environment & Configuration**: Standardize using `NODE_ENV`; remove hardcoded checks.
- **Authentication & Authorization**:
  - Enforce login for most app usage, especially chat.
  - Alert non-logged-in users attempting protected actions.
  - Disable BYOK (Bring Your Own Key) for non-logged-in users.
- **UI/UX Simplification**:
  - Adopt `shadcn/ui` components and styles more broadly.
  - Update `UserTierBadge` to use `PlanSlug` enum for plan names.
  - Replace complex/outdated components (e.g., `TextShimmerComponent` was replaced).
- **Subscription System**: Focus on VT+ subscriptions. Recent work includes improving error handling (toasts) and UI consistency on the `/plus` page.
- **Code Cleanup**: Removal of legacy systems like credit system, Langfuse, and Plausible analytics.

### Project Structure (from `AGENT.MD` & Memory Bank)

- **Monorepo**: Managed by Turborepo.
- **Main Application**: `apps/web/` (Next.js 15 with App Router)
  - **Auth Logic**: `apps/web/lib/auth.ts` (Better-Auth integration)
  - **Database Schema**: `apps/web/lib/database/schema.ts` (Drizzle ORM)
  - **API Routes**: `apps/web/app/api/`
  - **Key UI Pages**: `/plus/page.tsx` (recently updated design and dynamic CTAs)
  - **Layout/Theme**: `apps/web/app/layout.tsx` (handles `ThemeProvider` from `next-themes`)
- **Shared Packages**: `packages/`
  - `packages/ui/`: Base UI components (Radix UI + shadcn/ui).
  - `packages/common/`: Shared React components, hooks, context, Zustand stores.
    - `packages/common/components/index.ts`: Manages component exports.
    - `packages/common/hooks/use-payment-subscription.ts`: Handles VT+ subscription logic.
    - `packages/common/providers/subscription-provider.tsx`: Central provider for subscription state.
  - `packages/ai/`: AI agent system ("Agentic Graph System").
    - `README.md` in this folder has a good overview.
    - Core: `workflow/flow.ts`, `worker/worker.ts`, `tools/mcp.ts`.
    - Supports OpenAI, Anthropic, Google, Groq, Together AI. Config via `packages/ai/.env.example`.
  - `packages/shared/`: Core types (e.g., `PlanSlug` from `packages/shared/types.ts`), configs, logger, utilities.
  - `packages/typescript-config/`: Shared TypeScript configurations.
  - `packages/tailwind-config/`: Shared Tailwind CSS configuration.
- **Database**: Drizzle ORM with Neon PostgreSQL.

### Key Technical Decisions & Patterns (from Memory Bank)

- **Full-Stack Next.js**: For both frontend and backend APIs.
- **TypeScript**: For type safety across the project.
- **Component-Based UI**: React with shadcn/ui.
- **Utility-First CSS**: Tailwind CSS.
- **State Management**: Zustand for global state.
- **Data Fetching/Caching**: React Query (client-side).
- **Design Patterns**:
  - Provider Pattern (Theming, React Query, Subscription).
  - Custom Hooks (e.g., `useSubscriptionAccess`, `use-payment-subscription`).
  - Server Actions (for Next.js server-side logic from client).
- **Critical Implementation Paths**:
  - Authentication flow.
  - Payment and Subscription flow (VT+).
  - Chat interface and AI service interaction.
  - Environment-specific configurations.

### Memory Bank System (`memory-bank/` & `.clinerules`)

- **Purpose**: My primary context retention mechanism. Critical for project continuity.
- **Core Files**:
  - `projectbrief.md`: Core requirements and goals.
  - `productContext.md`: Project rationale, problems solved, UX goals.
  - `systemPatterns.md`: Architecture, technical decisions, design patterns.
  - `techContext.md`: Technologies, setup, constraints, dependencies.
  - `activeContext.md`: Current focus, recent changes, next steps, learnings.
  - `progress.md`: Completed tasks, current status.
- **Usage**:
  - **MUST READ ALL** memory bank files at the start of every task.
  - Update relevant files after significant changes or when new patterns/insights emerge.
  - Follow guidelines in `.clinerules` and `USER'S CUSTOM INSTRUCTIONS`.
  - Adhere to "Memory Bank First", "Iterative Approach", and "Clear Communication" principles.

## 3. Code Style Guidelines

Referenced from `AGENT.MD`:

- **Package Manager**: Bun (v1.1.19 or compatible).
- **Monorepo**: Turborepo (`apps/*`, `packages/*`).
- **Formatting**: Prettier (config: single quotes, 4-space tabs, 100 char width, semicolons, trailing commas). Run `bun run format`.
- **TypeScript**: Strict mode enabled. `esModuleInterop: true`, `forceConsistentCasingInFileNames: true`.
- **Imports**: Use workspace aliases: `@repo/*` (e.g., `@repo/ui`, `@repo/common`) or specific paths for `apps/web` like `@/lib/...`.
- **Components**: Radix UI + shadcn/ui patterns.
- **Styling**: Tailwind CSS.

## 4. Testing Instructions

- (Specific testing strategies or commands are not yet detailed. For now, rely on build and lint commands for checks.)
- `bun run typecheck` (or similar, if defined) should be run after significant code changes.
- Prefer running single tests for performance during development if applicable.

## 5. Repository Etiquette

- (Branch naming conventions, merge vs. rebase preferences, PR guidelines are not yet detailed. Follow standard good practices.)

## 6. Developer Environment Setup

Referenced from `AGENT.MD` and `memory-bank/techContext.md`:

- **Package Manager**: Ensure Bun v1.1.19 or a compatible version is installed.
- **Environment Variables**:
  - Copy `apps/web/.env.example` to `apps/web/.env.local` for the web app (this is the only environment file needed for local development).
  - Fill in necessary API keys (OpenAI, Anthropic, etc.) and configurations.
- **Database**: Neon PostgreSQL. Migrations managed by Drizzle Kit (see commands in section 1).
- **Monorepo Tool**: Turborepo handles task running and build caching.

## 7. Unexpected Behaviors or Warnings

- **TypeScript Path Aliases**: Monitor TypeScript errors in the "Problems" pane in VS Code. Path alias issues (e.g., `@/lib/...` within `packages/*` or incorrect `@repo/*` usage) can sometimes arise and may need manual correction in import statements. `packages/*` should use `@repo/*` or relative paths, not `@/*`.
- **Environment Variables**: Ensure `NODE_ENV` is correctly set and used for environment-specific logic.

## 8. Other Information to Remember

- **My Memory Reset**: My memory resets between sessions. The Memory Bank and this `CLAUDE.MD` file are the *only* sources of truth for project history and context. Their accuracy and completeness are paramount.
- **Current Project State**: Major refactoring tasks (subscription system unification, UI updates, removal of legacy systems) are largely complete. Focus is on VT+ subscriptions.
- **Key Enums/Types**: `PlanSlug` (from `packages/shared/types.ts`) is used for standardizing subscription plan identifiers.
- **UI Library**: `shadcn/ui` is the preferred component library.
- **Theme**: Dark theme is gated for subscribed users. Default is light. Managed by `next-themes` in `apps/web/app/layout.tsx`.
