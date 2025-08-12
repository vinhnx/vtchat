# System Patterns

## System Architecture

- **Monorepo Structure:** The project utilizes a monorepo (likely managed by Turborepo, given `turbo.json`) containing:
  - `apps/web`: A Next.js web application.
  - `packages/`: Shared libraries for common functionality:
    - `packages/common`: UI components, hooks, store, context providers.
    - `packages/shared`: Core types, configurations, utilities, logger.
    - `packages/ai`: AI models, providers, tools, and workflow logic.
    - `packages/actions`: Server actions (e.g., feedback).
    - `packages/orchestrator`: Task orchestration logic.
    - `packages/tailwind-config`: Shared Tailwind CSS configuration.
    - `packages/typescript-config`: Shared TypeScript configurations.
    - `packages/ui`: Base UI components (likely from a library like shadcn/ui).

- **Frontend:** Next.js (React) for the web application.
- **Styling:** Tailwind CSS, with components potentially from shadcn/ui.
- **State Management:** Zustand (implied by `store/chat.store.ts`, `store/app.store.ts` often used with Zustand).
- **Data Fetching/Caching:** React Query (implied by `context/react-query.tsx`).
- **Authentication:** Likely NextAuth.js or a similar solution, given `apps/web/lib/auth.ts`. The task list mentions migrating to "Better-Auth" and also "Stack Auth", indicating a potential transition or consideration of alternatives.
- **Database:** A SQL database is used, managed with Drizzle ORM (implied by `apps/web/drizzle.config.ts` and `apps/web/lib/database/schema.ts`).
- **API Routes:** Next.js API routes under `apps/web/app/api/`.

## Key Technical Decisions

- **Monorepo for Code Sharing:** Facilitates sharing code between the web app and potentially other future apps or services.
- **Next.js for Full-Stack Development:** Leverages Next.js for both frontend rendering and backend API capabilities.
- **Type Safety:** TypeScript is used across the project.
- **Component-Based UI:** React components are central to the UI architecture.
- **Utility-First CSS:** Tailwind CSS for styling.

## Design Patterns in Use

- **Provider Pattern:** For theming (`ThemeProvider`), React Query (`ReactQueryProvider`), and potentially other global state/context.
- **Custom Hooks:** For reusable logic in React components (e.g., `useMobile`, `useSubscriptionAccess`).
- **Store Pattern:** For global state management (Zustand).
- **Server Actions:** For invoking server-side logic from client components in Next.js.

## State Management Best Practices (Zustand)

- **Individual Selectors:** Always use individual selectors instead of object destructuring to avoid infinite re-renders:

  ```tsx
  // ✅ Correct: Individual selectors
  const value1 = useStore(state => state.value1);
  const value2 = useStore(state => state.value2);

  // ❌ Incorrect: Object destructuring (causes infinite loops)
  const { value1, value2 } = useStore(state => ({
      value1: state.value1,
      value2: state.value2,
  }));
  ```

- **Selector Memoization:** Use callback memoization for complex selectors to prevent unnecessary re-renders.
- **Settings Persistence:** All user settings use unified storage system (`SettingsStorage`) with type-safe operations, error handling, and user-specific isolation.

## Component Relationships

- `apps/web` consumes components and utilities from `packages/common` and `packages/shared`.
- `packages/common` likely consumes base UI elements from `packages/ui`.
- Authentication logic in `apps/web/lib/auth.ts` is used throughout the `apps/web` application.
- Payment processing components (`PaymentCheckoutProcessor`, `CreemCheckoutProcessor`) interact with backend API routes for payment and subscription management.

## Critical Implementation Paths

- **Authentication Flow:** User login, session management, and access control based on authentication status.
- **Payment and Subscription Flow:** Checkout process, subscription status checks, feature gating based on subscription tier.
- **Chat Interface:** Input handling, message display, interaction with AI services.
- **Environment-Specific Configuration:** Ensuring correct API endpoints, feature flags, and behaviors based on the deployment environment.
