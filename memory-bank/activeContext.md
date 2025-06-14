# Active Context

## Current Work Focus

The immediate focus is on improving user feedback and UI consistency related to subscriptions on the `/plus` page. Specifically:
1.  **Subscription Error Handling:** Ensure toast notifications are used for errors during the subscription checkout process.
2.  **Plus Page UI Update:** Update subscription and CTA buttons on the `/plus` page to dynamically reflect the user's current subscription status (e.g., show "Manage Subscription" with a badge if subscribed, "Continue" if on free tier).

## Recent Changes

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
