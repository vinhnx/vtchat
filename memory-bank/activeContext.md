# Active Context

## Current Work Focus

The immediate focus is on completing UI enhancements and ensuring consistency across components.

## Recent Changes

- Updated gitchamber.com usage instructions in agent guide files
- Added models.dev API usage instructions to agent guides and removed models-data.json file

- **Mobile Floating Menu Visibility Fix - COMPLETE ✅**:
  - Ensured floating menu buttons remain visible on mobile by limiting `rounded-sm` and `overflow-hidden` to desktop screens
  - Files: `packages/common/components/layout/root.tsx`

- **Chat Input Button Selection Logic - COMPLETE ✅**:
  - **Issue Resolved**: Implemented comprehensive button selection logic to ensure only one button and only one mode is selected at a time
  - **Key Features**:
    - Only one button can be active at any given time (webSearch, mathCalculator, structuredOutput)
    - When a user selects a button, it becomes active and all other buttons are deactivated
    - Chat mode selection also clears all other button states
    - Buttons can be toggled on/off by clicking them again
    - State is properly persisted to localStorage
    - All button states are reset when changing chat modes
  - **Files Modified**:
    - `packages/common/store/chat.store.ts` - Enhanced `setActiveButton` and `setChatMode` functions
    - `packages/common/components/chat-input/__tests__/button-selection.test.ts` - Comprehensive test suite
  - **Implementation Details**:
    - Updated `setActiveButton` function to handle mutual exclusion between buttons
    - Modified `setChatMode` to reset all button states when chat mode changes
    - Added localStorage persistence for button states
    - Ensured proper state management with immediate UI updates
  - **Testing**: Created comprehensive test suite with 7 test cases covering all button selection scenarios
  - **Result**: Users can now only have one input mode active at a time, providing a clear and consistent UX

- **Auth Client 404 Error Fix - COMPLETE ✅**:
  - **Issue Resolved**: Fixed 404 error on `/api/auth/fetch-options/method/to-upper-case` caused by incorrect auth client configuration
  - **Root Cause**: The `createAuthClient` from better-auth was receiving invalid `fetchOptions` configuration with `timeout` and `onError` properties that don't belong in the client config
  - **Solution**: Removed `fetchOptions` from the auth client configuration as these are server-side only options
  - **Files Modified**: `packages/shared/lib/auth-client.ts`
  - **Additional Fix**: Updated parameter structure for `getSession` calls to use proper better-auth API format with `query` wrapper
  - **Result**: Auth client now correctly communicates with server endpoints without malformed URLs

- **React Fragment Error Fix - COMPLETE ✅**:
  - **Issue Resolved**: Fixed React console error "Invalid prop `onClick` supplied to `React.Fragment`"
  - **Root Cause**: `GatedFeatureAlert` component was trying to clone React Fragment children and add `onClick` props
  - **Solution**: Removed unnecessary `<div>` wrapper in `image-upload.tsx` when passing children to `GatedFeatureAlert`
  - **Files Modified**: `packages/common/components/chat-input/image-upload.tsx`
  - **Result**: Clean console output with no React Fragment prop errors

- **🚀 Vitest Testing Framework Integration - COMPLETE ✅**:
  - **Full Monorepo Testing Setup**: Successfully integrated Vitest across the entire VTChat monorepo
  - **Dependencies Installed**: Added Vitest 3.2.4, Testing Library, Happy DOM, and coverage tools
  - **Root Configuration**: Created comprehensive `vitest.config.ts` with monorepo path aliases
  - **Test Setup**: Implemented `vitest.setup.ts` with comprehensive browser API mocking
  - **Package Scripts**: Added test scripts to root and package-level package.json files
  - **Turborepo Integration**: Updated `turbo.json` with test task dependencies and outputs
  - **Example Tests Created**:
    - Utility function tests in `packages/shared/utils/__tests__/utils.test.ts`
    - React component tests in `packages/common/components/__tests__/footer.test.tsx`
  - **All Tests Passing**: Verified 6/6 tests pass with proper TypeScript and jest-dom support
  - **Comprehensive Documentation**: Created detailed setup guide in `docs/vitest-testing-setup.md`
  - **Key Features Implemented**:
    - Happy DOM environment for fast React testing
    - Global browser API mocks (IntersectionObserver, ResizeObserver, matchMedia, localStorage)
    - Full TypeScript support with proper type checking
    - Coverage reporting with v8 provider
    - Watch mode and UI interface support
    - Monorepo-aware path resolution for all packages

- **Background Fix for Legal Pages:** Fixed background consistency issues on Help Center, Terms, and Privacy pages:
  - Changed header background from `bg-background/80` to `bg-background` for better consistency
  - Added explicit `bg-background` to main content areas to ensure proper background coverage
  - Changed footer background from `bg-muted/20` to `bg-background` for unified appearance
  - All three pages (/faq, /terms, /privacy) now have consistent, solid background styling
  - Improved visual cohesion across all legal/informational pages
  - **Unified Footer Navigation:** Added Help Center link to Footer component to complete the navigation triad:

- Terms of Service | Privacy Policy | Help Center - All three legal pages now have consistent footer navigation between each other - Footer component provides unified navigation across the entire application
  - **Full-Width Layout Implementation:** Updated all three pages to use full-width layout:
    - Changed max width from `max-w-screen-lg` to `max-w-7xl` for wider content area
    - Updated header, main content, and footer containers to use full width
    - Improved content presentation and better use of screen real estate
  - **Help Center Accordion UI Jump Fix:** Improved Help Center page layout to prevent UI jumping:
    - Restructured layout with centered header and better spacing
    - Improved accordion container sizing and spacing for smoother animations
    - Enhanced user experience when expanding/collapsing Help Center sections

- **Database Connection Error Fix:** Resolved Neon database connection termination errors (error code 57P01):
  - Updated connection pool configuration in `apps/web/lib/database/index.ts` with improved settings:
    - Increased max connections from 1 to 3 for better concurrency
    - Set appropriate timeout values (30s idle, 10s connection, 60s statement/query)
    - Added proper connection pool event handling for error monitoring
    - Implemented `withDatabaseErrorHandling` utility for graceful error handling
  - Updated subscription access control functions to use the new error handling wrapper
  - Added specific error code handling for common database connection issues:
    - `57P01`: Connection terminated by administrator
    - `ECONNRESET`/`ETIMEDOUT`: Connection timeout errors
    - `53300`: Too many connections error
  - Tested the fix successfully - database connections now handle errors gracefully and provide user-friendly error messages

- **User Button Functional Grouping Enhancement:** Improved the user popover by connecting the Settings menu item to the actual settings modal:
  - Connected the "Settings" item in the user dropdown to open the settings modal using `setIsSettingsOpen(true)`
  - Maintained the existing functional grouping structure:
    - **Account Management:** Settings (now functional), Profile
    - **Support & Legal:** Help Center, Terms of Service, Privacy Policy
    - **Sign Out:** Logout action
  - Added proper integration between user button and settings modal for better UX

- **Sidebar Blocking Indicator Fix:** Resolved the issue where a full-page loader blocked the sidebar during logout:
  - Replaced `FullPageLoader` with a non-blocking empty state message when no threads are present
  - Sidebar remains functional during logout process and thread clearing
  - Improved user experience by preventing interface blocking during authentication state changes
  - Removed unused `FullPageLoader` import to clean up linting warnings

- **Sidebar User Dropdown Functional Grouping:** Added proper functional grouping to the sidebar's user dropdown menu:
  - Added `DropdownMenuLabel` and `DropdownMenuSeparator` components for clear section organization
  - Organized menu items into logical groups:
    - **Account Management:** Settings
    - **Support & Legal:** Help Center, Privacy Policy, Terms of Service
    - **Authentication:** Log in/Sign out
  - Enhanced consistency between user button and sidebar user dropdown interfaces
  - Improved menu width and alignment for better visual presentation

- **Example Prompts - Complete Content Refresh & Revamp:** Updated `packages/common/components/example-prompts.tsx`:
  - **Styling:**
    - Applied category-specific colors to icons within the example prompt buttons.
    - Changed button variant to `outlined` for consistency with `shadcn/ui`.
    - Removed `rounded="full"` for default `shadcn/ui` button rounding.
    - Added a hover ring effect for better visual feedback.
  - **Content:**
    - All example prompts across all categories (`howTo`, `explainConcepts`, `creative`, `advice`, `analysis`) have been completely replaced with new, fresh, and current topics. Each category has been expanded to contain 7 prompts.
    - The new prompts focus on recent developments, AI, technology trends, and contemporary societal questions, offering a wider variety of starting points for users. One prompt was specifically updated to "Explain how Large Language Models work."
- **`TODO.md` Cleanup and Refinement:** Organized and categorized tasks in `TODO.md` for better clarity and actionability. Removed non-actionable items and notes better suited for other documentation.
- **Dynamic CTA Buttons on Plus Page:** Updated `apps/web/app/plus/page.tsx` to make the Call to Action (CTA) buttons more dynamic:
  - The "Free" plan button now shows "Continue" (and links to `/chat`) if the user is signed in and on the free tier.
  - The main CTA button at the bottom of the page and the button on the VT+ plan card now display "Manage Subscription" along with the `UserTierBadge` if the user is currently subscribed to VT+. They correctly trigger `openCustomerPortal`.
- **Plus Page Subscription Button Update (Initial):** Modified `apps/web/app/plus/page.tsx` to include the `UserTierBadge` within the "Manage Subscription" button when a user has an active VT+ subscription.
- **Refined Subscription Error Handling with Toasts:** Further refined the error handling in `packages/common/hooks/use-payment-subscription.ts` within the `startVtPlusSubscription` function. Instead of throwing an error when `response.ok` is false (e.g., user already subscribed), the code now directly calls `toast` with the error message and sets the local error state. The `catch` block was also updated to provide more specific toast notifications for other types of errors during the checkout process.
- **Subscription Error Toast (Initial Implementation):** Modified `packages/common/hooks/use-payment-subscription.ts` to use `useToast` to display an error message when the `/api/checkout` endpoint returns an error. This addresses the console error "Error: You already have an active VT+ subscription. Use the customer portal to manage your subscription." by showing it to the user in a toast.
- **Dark Theme Gating Implemented:**
  - Modified `apps/web/app/layout.tsx` to set `defaultTheme="light"` and `enableSystem={false}`. This ensures the application defaults to light theme, and the operating system's theme preference does not override this for non-subscribed users. The existing `ModeToggle` component already handles gating the manual toggle to dark theme for subscribed users.
- **`intro-dialog` Component Removed:**
  - Removed the usage of `IntroDialog` from `packages/common/components/layout/root.tsx`.
  - Removed the export of `IntroDialog` from `packages/common/components/index.ts`.
  - Deleted the component file `packages/common/components/intro-dialog.tsx`.
  - Resolved a coincidental TypeScript error by removing an erroneous export for `client-root.tsx` from `packages/common/components/index.ts`.
- Completed removal of credit system components and logic.
- Updated payment system to focus exclusively on VT+ subscriptions.
- Verified all credit-related files were already removed.

- **Arcjet Security Removal - COMPLETE ✅**:
  - **Issue Resolved**: Successfully completed full removal of Arcjet from the codebase as requested
  - **Actions Taken**:
    - Deleted duplicate protected route file: `apps/web/app/api/auth/[...better-auth]/route.protected.ts`
    - Removed all Arcjet references from documentation files (`SECURITY.md`, `llms.txt`)
    - Deleted Arcjet memory bank documentation: `memory-bank/arcjet-security-integration.md`
    - Confirmed no remaining Arcjet packages or imports in the codebase
    - Verified build passes successfully without any Arcjet-related errors
  - **Result**: Arcjet has been completely removed from the codebase with no remaining references or dependencies

- **Mobile PWA Installation Notification - COMPLETE ✅**:
  - **Issue Resolved**: Added Sonner toast notification for mobile users to guide them on installing the VT app as a PWA
  - **Implementation Details**:
    - Created `useMobilePWANotification` hook that detects mobile devices and shows a one-time notification
    - Notification appears only on mobile devices (screen width < 768px) using existing `useIsMobile` hook
    - Uses localStorage (`vt-mobile-pwa-notification-seen`) to ensure notification is shown only once per device
    - Toast appears after 2-second delay to allow app to load properly
    - Includes "Got it" action button and auto-dismisses after 8 seconds
  - **Files Created/Modified**:
    - `packages/common/hooks/use-mobile-pwa-notification.ts` - Main hook implementation
    - `packages/common/hooks/index.ts` - Added export for new hook
    - `packages/common/components/layout/root.tsx` - Integrated hook call
  - **User Experience**:
    - Clear, actionable message: "Install VT on your mobile device"
    - Helpful description: "Tap share button then tap 'Add to Home Screen' for a better experience"
    - Non-intrusive with close button and auto-dismiss functionality
    - Respects user choice and never shows again once dismissed
  - **Result**: Mobile users now receive helpful guidance on installing VT as a PWA for improved mobile experience

- **Enhanced PWA Mobile Installation Notification - COMPLETE ✅**:
  - **Issue Resolved**: Enhanced the PWA installation notification toast to include clear visual guidance about finding the share button
  - **Implementation Details**:
    - Added 📤 share button emoji in the description to visually represent what users should look for
    - Included step-by-step instructions: "1. Look for the 📤 Share button in your browser toolbar"
    - Added directional guidance: "↓ Share button is usually in the browser menu or toolbar"
    - Extended toast duration to 12 seconds to give users more time to read the detailed instructions
    - Maintained the existing "Got it" action button and auto-dismiss functionality
    - Used emoji and visual cues to make the instructions more intuitive and user-friendly
  - **Files Modified**:
    - `packages/common/hooks/use-mobile-pwa-notification.ts` - Enhanced toast content with visual share button guidance
    - `TODO.md` - Marked PWA notification task as completed
  - **User Experience**:
    - Clear visual representation of the share button users need to find
    - Step-by-step instructions that are easy to follow
    - Longer display time allows users to properly read and understand the instructions
    - More intuitive guidance about where to find the share button in different mobile browsers
  - **Result**: Mobile users now receive much clearer, visually-guided instructions for installing VT as a PWA with specific share button identification

- **Comprehensive PWA Enhancement - COMPLETE ✅**:
  - **Issue Resolved**: Enhanced VTChat's Progressive Web App capabilities following Next.js PWA best practices
  - **PWA Manager Component**:
    - Created advanced `PWAManager` component for handling install prompts and PWA detection
    - Supports both Chrome/Edge `beforeinstallprompt` events and iOS manual installation
    - Shows floating install button on mobile devices when PWA installation is available
    - Provides detailed iOS installation instructions with step-by-step modal
    - Detects if app is already installed using `display-mode: standalone` media query
    - Registers service worker automatically with proper error handling
  - **Enhanced Web App Manifest**:
    - Updated manifest with comprehensive PWA metadata and features
    - Added app shortcuts for "New Chat" and "Settings" for quick access
    - Included screenshots for app store listings and better discoverability
    - Added proper categories, orientation preferences, and maskable icons
    - Enhanced descriptions highlighting AI chat capabilities with multiple models
  - **Advanced Service Worker**:
    - Upgraded service worker with push notification support and better caching
    - Added comprehensive push notification handling with actions and proper click behavior
    - Enhanced offline support with custom offline page showing VT branding
    - Improved caching strategy for static assets including icons and fonts
    - Added background sync capabilities for future enhancements
    - Implemented proper cache versioning and cleanup of old caches
  - **Security Headers**:
    - Added PWA-specific security headers in `next.config.mjs`
    - Service worker served with proper Content-Security-Policy restrictions
    - Web app manifest served with correct content type and caching headers
    - Enhanced security while maintaining PWA functionality
  - **Files Created/Modified**:
    - `apps/web/components/pwa-manager.tsx` - Advanced PWA manager component
    - `apps/web/app/layout.tsx` - Integrated PWA manager into app layout
    - `apps/web/app/manifest.ts` - Enhanced manifest with PWA features
    - `apps/web/public/sw.js` - Advanced service worker with push notifications
    - `apps/web/next.config.mjs` - Added PWA security headers
  - **PWA Features Implemented**:
    - ✅ Automatic service worker registration
    - ✅ Install prompts for Chrome/Edge and iOS
    - ✅ App shortcuts and enhanced manifest
    - ✅ Push notification support (foundation)
    - ✅ Offline support with branded offline page
    - ✅ Proper icon handling with maskable support
    - ✅ Security headers for PWA assets
    - ✅ Background sync capabilities
  - **Result**: VTChat now provides a full native app-like experience on mobile devices with proper PWA standards compliance

## Next Steps

- Address high-priority items from the refined `TODO.md`.
- Monitor for any issues arising from recent changes, including the new error toast functionality.
- Test the updated UI improvements in different screen sizes and themes.
- **Expand Vitest Test Coverage:**
  - Add tests for critical utility functions and React components
  - Set up GitHub Actions CI integration for automated testing
  - Configure coverage thresholds and quality gates
  - Add integration tests for key user workflows

## Recent Code Cleanup - COMPLETE ✅

- **SmoothStream Utility Removal - COMPLETE ✅**:
  - **Removed**: All SmoothStream utility code and exports from the `@repo/ai` package
  - **Files Removed**:
    - `packages/ai/utils/smooth-stream.ts` - Main utility implementation
    - `packages/ai/utils/__tests__/smooth-stream.test.ts` - Test suite
  - **Package Cleanup**:
    - Removed exports from `packages/ai/package.json`
    - Removed re-exports from `packages/ai/main.ts`
    - Cleaned up memory-bank documentation references
  - **Result**: Simplified codebase without the streaming utility

- **Chat Input Button Selection Logic Removal - COMPLETE ✅**:
  - **Changed**: Removed the restriction that only one chat input button/mode can be selected at a time
  - **Store Updates**:
    - Removed `ActiveButtonType` and `activeButton` state
    - Replaced `setActiveButton` with individual setters: `setUseStructuredOutput`, `setUseDocumentParsing`, `setUseThinkingModeToggle`, `setUseReasoningChain`
    - Added individual boolean states for each feature
    - Updated `setChatMode` to reset all button states independently
  - **Component Updates**:
    - Updated `structured-output-button.tsx` to use `useStructuredOutput` state
    - Updated `document-parsing-button.tsx` to use `useDocumentParsing` state
    - Updated `thinking-mode-toggle-button.tsx` to use `useThinkingModeToggle` state
    - Updated `reasoning-chain-button.tsx` to use `useReasoningChain` state
    - Updated `chat-actions.tsx` for web search and math calculator buttons
  - **Tests Cleanup**:
    - Removed `button-selection.test.ts` as the activeButton logic no longer exists
  - **Result**: Users can now enable multiple chat input features simultaneously (e.g., web search + document parsing + structured output)

## UI Improvements Completed

- **Sidebar Revamp Complete:** Reorganized the sidebar for better visual hierarchy:
  - Made "New Chat" the primary action with default button styling
  - Improved spacing and grouping of primary actions (New Chat, Search)
  - Separated subscription section with visual divider for better organization
  - Enhanced responsive design for collapsed sidebar state
  - Maintained consistent styling with shadcn/ui components

- **New Chat Button Fix Complete:** Fixed the "New Chat" button functionality:
  - Added proper onClick handler that creates new threads using `useChatStore.getState().createThread()`
  - Fixed navigation logic for both chat page and non-chat page contexts
  - Improved button behavior in collapsed sidebar state
  - Removed conditional rendering that was causing different behaviors
  - Enhanced icon spacing with proper margin classes

- **User Button Enhancement Complete:** Added clear thread functionality and grouped popup by functions:
  - Added "Clear all threads" option with confirmation dialog
  - Organized dropdown menu into logical sections: Account, Conversations, Support & Legal
  - Added section labels for better organization
  - Implemented proper confirmation flow for destructive actions
  - Enhanced accessibility with proper ARIA labels and focus management

- **Settings Modal Revamp Complete:** Improved layout and organization:
  - Redesigned with modern two-column layout (sidebar navigation + content area)
  - Added descriptive text for each settings section
  - Improved visual hierarchy with sticky header and better spacing
  - Enhanced navigation with hover states and active indicators
  - Increased modal size for better content readability
  - Maintained responsive design principles

## Recent Technical Changes

- Fixed missing `cn` utility import in settings modal
- Removed unused imports to clean up linting warnings
- Added proper TypeScript types for component props
- Implemented proper state management for clear threads functionality

## Active Decisions and Considerations

- The current theme implementation relies on `next-themes` and its localStorage persistence for user-selected themes (for subscribed users).

## Important Patterns and Preferences

- **Memory Bank First:** Always read and update Memory Bank files as per `USER'S CUSTOM INSTRUCTIONS`.
- **Iterative Approach:** Tackle tasks group by group, and item by item within each group.
- **Clear Communication:** Document changes and decisions in the Memory Bank.

## Learnings and Project Insights

- The project structure involves a monorepo with `apps/web` for the Next.js application and `packages/` for shared code.
- `ThemeProvider` from `next-themes` is configured in `apps/web/app/layout.tsx`.
- Component exports are managed in `packages/common/components/index.ts`.
- **Testing Framework:** Vitest is now the primary testing framework with comprehensive monorepo support and modern developer experience.
