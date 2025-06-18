# Active Context

## Current Work Focus

The immediate focus is on completing UI enhancements and ensuring consistency across components.

## Recent Changes

*   **🚀 Vitest Testing Framework Integration - COMPLETE ✅**:
    *   **Full Monorepo Testing Setup**: Successfully integrated Vitest across the entire VTChat monorepo
    *   **Dependencies Installed**: Added Vitest 3.2.4, Testing Library, Happy DOM, and coverage tools
    *   **Root Configuration**: Created comprehensive `vitest.config.ts` with monorepo path aliases
    *   **Test Setup**: Implemented `vitest.setup.ts` with comprehensive browser API mocking
    *   **Package Scripts**: Added test scripts to root and package-level package.json files
    *   **Turborepo Integration**: Updated `turbo.json` with test task dependencies and outputs
    *   **Example Tests Created**:
        - Utility function tests in `packages/shared/utils/__tests__/utils.test.ts`
        - React component tests in `packages/common/components/__tests__/footer.test.tsx`
    *   **All Tests Passing**: Verified 6/6 tests pass with proper TypeScript and jest-dom support
    *   **Comprehensive Documentation**: Created detailed setup guide in `docs/vitest-testing-setup.md`
    *   **Key Features Implemented**:
        - Happy DOM environment for fast React testing
        - Global browser API mocks (IntersectionObserver, ResizeObserver, matchMedia, localStorage)
        - Full TypeScript support with proper type checking
        - Coverage reporting with v8 provider
        - Watch mode and UI interface support
        - Monorepo-aware path resolution for all packages

*   **Background Fix for Legal Pages:** Fixed background consistency issues on FAQ, Terms, and Privacy pages:
    *   Changed header background from `bg-background/80` to `bg-background` for better consistency
    *   Added explicit `bg-background` to main content areas to ensure proper background coverage
    *   Changed footer background from `bg-muted/20` to `bg-background` for unified appearance
    *   All three pages (/faq, /terms, /privacy) now have consistent, solid background styling
    *   Improved visual cohesion across all legal/informational pages
    *   **Unified Footer Navigation:** Added FAQ link to Footer component to complete the navigation triad:
        - Terms of Service | Privacy Policy | FAQs
        - All three legal pages now have consistent footer navigation between each other
        - Footer component provides unified navigation across the entire application
    *   **Full-Width Layout Implementation:** Updated all three pages to use full-width layout:
        - Changed max width from `max-w-screen-lg` to `max-w-7xl` for wider content area
        - Updated header, main content, and footer containers to use full width
        - Improved content presentation and better use of screen real estate
    *   **FAQ Accordion UI Jump Fix:** Improved FAQ page layout to prevent UI jumping:
        - Restructured layout with centered header and better spacing
        - Improved accordion container sizing and spacing for smoother animations
        - Enhanced user experience when expanding/collapsing FAQ sections

*   **Database Connection Error Fix:** Resolved Neon database connection termination errors (error code 57P01):
    *   Updated connection pool configuration in `apps/web/lib/database/index.ts` with improved settings:
        - Increased max connections from 1 to 3 for better concurrency
        - Set appropriate timeout values (30s idle, 10s connection, 60s statement/query)
        - Added proper connection pool event handling for error monitoring
        - Implemented `withDatabaseErrorHandling` utility for graceful error handling
    *   Updated subscription access control functions to use the new error handling wrapper
    *   Added specific error code handling for common database connection issues:
        - `57P01`: Connection terminated by administrator
        - `ECONNRESET`/`ETIMEDOUT`: Connection timeout errors
        - `53300`: Too many connections error
    *   Tested the fix successfully - database connections now handle errors gracefully and provide user-friendly error messages

*   **User Button Functional Grouping Enhancement:** Improved the user popover by connecting the Settings menu item to the actual settings modal:
    *   Connected the "Settings" item in the user dropdown to open the settings modal using `setIsSettingsOpen(true)`
    *   Maintained the existing functional grouping structure:
        - **Account Management:** Settings (now functional), Profile
        - **Support & Legal:** FAQ & Help, Terms of Service, Privacy Policy
        - **Sign Out:** Logout action
    *   Added proper integration between user button and settings modal for better UX

*   **Sidebar Blocking Indicator Fix:** Resolved the issue where a full-page loader blocked the sidebar during logout:
    *   Replaced `FullPageLoader` with a non-blocking empty state message when no threads are present
    *   Sidebar remains functional during logout process and thread clearing
    *   Improved user experience by preventing interface blocking during authentication state changes
    *   Removed unused `FullPageLoader` import to clean up linting warnings

*   **Sidebar User Dropdown Functional Grouping:** Added proper functional grouping to the sidebar's user dropdown menu:
    *   Added `DropdownMenuLabel` and `DropdownMenuSeparator` components for clear section organization
    *   Organized menu items into logical groups:
        - **Account Management:** Settings
        - **Support & Legal:** FAQ, Privacy Policy, Terms of Service
        - **Authentication:** Log in/Sign out
    *   Enhanced consistency between user button and sidebar user dropdown interfaces
    *   Improved menu width and alignment for better visual presentation

*   **Example Prompts - Complete Content Refresh & Revamp:** Updated `packages/common/components/example-prompts.tsx`:
    *   **Styling:**
        *   Applied category-specific colors to icons within the example prompt buttons.
        *   Changed button variant to `outlined` for consistency with `shadcn/ui`.
        *   Removed `rounded="full"` for default `shadcn/ui` button rounding.
        *   Added a hover ring effect for better visual feedback.
    *   **Content:**
        *   All example prompts across all categories (`howTo`, `explainConcepts`, `creative`, `advice`, `analysis`) have been completely replaced with new, fresh, and current topics. Each category has been expanded to contain 7 prompts.
        *   The new prompts focus on recent developments, AI, technology trends, and contemporary societal questions, offering a wider variety of starting points for users. One prompt was specifically updated to "Explain how Large Language Models work."
*   **`TODO.md` Cleanup and Refinement:** Organized and categorized tasks in `TODO.md` for better clarity and actionability. Removed non-actionable items and notes better suited for other documentation.
*   **Dynamic CTA Buttons on Plus Page:** Updated `apps/web/app/plus/page.tsx` to make the Call to Action (CTA) buttons more dynamic:
    *   The "Free" plan button now shows "Continue" (and links to `/chat`) if the user is signed in and on the free tier.
    *   The main CTA button at the bottom of the page and the button on the VT+ plan card now display "Manage Subscription" along with the `UserTierBadge` if the user is currently subscribed to VT+. They correctly trigger `openCustomerPortal`.
*   **Plus Page Subscription Button Update (Initial):** Modified `apps/web/app/plus/page.tsx` to include the `UserTierBadge` within the "Manage Subscription" button when a user has an active VT+ subscription.
*   **Refined Subscription Error Handling with Toasts:** Further refined the error handling in `packages/common/hooks/use-payment-subscription.ts` within the `startVtPlusSubscription` function. Instead of throwing an error when `response.ok` is false (e.g., user already subscribed), the code now directly calls `toast` with the error message and sets the local error state. The `catch` block was also updated to provide more specific toast notifications for other types of errors during the checkout process.
*   **Subscription Error Toast (Initial Implementation):** Modified `packages/common/hooks/use-payment-subscription.ts` to use `useToast` to display an error message when the `/api/checkout` endpoint returns an error. This addresses the console error "Error: You already have an active VT+ subscription. Use the customer portal to manage your subscription." by showing it to the user in a toast.
*   **Dark Theme Gating Implemented:**
    *   Modified `apps/web/app/layout.tsx` to set `defaultTheme="light"` and `enableSystem={false}`. This ensures the application defaults to light theme, and the operating system's theme preference does not override this for non-subscribed users. The existing `ModeToggle` component already handles gating the manual toggle to dark theme for subscribed users.
*   **`intro-dialog` Component Removed:**
    *   Removed the usage of `IntroDialog` from `packages/common/components/layout/root.tsx`.
    *   Removed the export of `IntroDialog` from `packages/common/components/index.ts`.
    *   Deleted the component file `packages/common/components/intro-dialog.tsx`.
    *   Resolved a coincidental TypeScript error by removing an erroneous export for `client-root.tsx` from `packages/common/components/index.ts`.
*   Completed removal of credit system components and logic.
*   Updated payment system to focus exclusively on VT+ subscriptions.
*   Verified all credit-related files were already removed.

## Next Steps

*   Address high-priority items from the refined `TODO.md`.
*   Monitor for any issues arising from recent changes, including the new error toast functionality.
*   Test the updated UI improvements in different screen sizes and themes.
*   **Expand Vitest Test Coverage:**
    *   Add tests for critical utility functions and React components
    *   Set up GitHub Actions CI integration for automated testing
    *   Configure coverage thresholds and quality gates
    *   Add integration tests for key user workflows

## UI Improvements Completed

*   **Sidebar Revamp Complete:** Reorganized the sidebar for better visual hierarchy:
    *   Made "New Chat" the primary action with default button styling
    *   Improved spacing and grouping of primary actions (New Chat, Search)
    *   Separated subscription section with visual divider for better organization
    *   Enhanced responsive design for collapsed sidebar state
    *   Maintained consistent styling with shadcn/ui components

*   **New Chat Button Fix Complete:** Fixed the "New Chat" button functionality:
    *   Added proper onClick handler that creates new threads using `useChatStore.getState().createThread()`
    *   Fixed navigation logic for both chat page and non-chat page contexts
    *   Improved button behavior in collapsed sidebar state
    *   Removed conditional rendering that was causing different behaviors
    *   Enhanced icon spacing with proper margin classes

*   **User Button Enhancement Complete:** Added clear thread functionality and grouped popup by functions:
    *   Added "Clear all threads" option with confirmation dialog
    *   Organized dropdown menu into logical sections: Account, Conversations, Support & Legal
    *   Added section labels for better organization
    *   Implemented proper confirmation flow for destructive actions
    *   Enhanced accessibility with proper ARIA labels and focus management

*   **Settings Modal Revamp Complete:** Improved layout and organization:
    *   Redesigned with modern two-column layout (sidebar navigation + content area)
    *   Added descriptive text for each settings section
    *   Improved visual hierarchy with sticky header and better spacing
    *   Enhanced navigation with hover states and active indicators
    *   Increased modal size for better content readability
    *   Maintained responsive design principles

## Recent Technical Changes

*   Fixed missing `cn` utility import in settings modal
*   Removed unused imports to clean up linting warnings
*   Added proper TypeScript types for component props
*   Implemented proper state management for clear threads functionality

## Active Decisions and Considerations

*   The current theme implementation relies on `next-themes` and its localStorage persistence for user-selected themes (for subscribed users).

## Important Patterns and Preferences

*   **Memory Bank First:** Always read and update Memory Bank files as per `USER'S CUSTOM INSTRUCTIONS`.
*   **Iterative Approach:** Tackle tasks group by group, and item by item within each group.
*   **Clear Communication:** Document changes and decisions in the Memory Bank.

## Learnings and Project Insights

*   The project structure involves a monorepo with `apps/web` for the Next.js application and `packages/` for shared code.
*   `ThemeProvider` from `next-themes` is configured in `apps/web/app/layout.tsx`.
*   Component exports are managed in `packages/common/components/index.ts`.
*   **Testing Framework:** Vitest is now the primary testing framework with comprehensive monorepo support and modern developer experience.
